const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');

// Load R2 credentials from the project-root .env file (one level above front-end/).
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { S3Client, PutObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

// Images are cached here instead of public/cards/ so the CRA dev server does not
// detect file-system changes inside public/ and trigger a hot reload (which would
// reset React state and navigate back to page 1).
const CACHE_DIR = path.join(os.tmpdir(), 'wixoss_card_cache');

const SAFE_FILENAME_RE = /^[\w\-\[\]. ()]+$/;

function isValidFileName(name) {
    if (!name) return false;
    if (!SAFE_FILENAME_RE.test(name)) return false;
    return path.basename(name) === name;
}

function getExternalImageUrl(imageName) {
    if (imageName.includes('[EN]')) {
        return `https://www.takaratomy.co.jp/products/en.wixoss/card/thumb/${imageName}`;
    }
    if (imageName.includes('(') || !imageName.includes('-')) {
        return `https://raw.githubusercontent.com/TetrusAO/Wixoss-TCG-Cockatrice-Plugin/master/pics/CUSTOM/${imageName}`;
    }
    const setCode = imageName.split('-')[0];
    return `https://www.takaratomy.co.jp/products/wixoss/img/card/${setCode}/${imageName}`;
}

function downloadToFile(urlString, destinationFilePath) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(urlString);
        const client = urlObj.protocol === 'https:' ? https : http;

        client.get(urlObj, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                response.resume();
                downloadToFile(response.headers.location, destinationFilePath).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                response.resume();
                reject(new Error(`Download failed with status ${response.statusCode}`));
                return;
            }

            const fileStream = fs.createWriteStream(destinationFilePath);
            response.pipe(fileStream);
            fileStream.on('finish', () => fileStream.close(() => resolve(true)));
            fileStream.on('error', (err) => fs.unlink(destinationFilePath, () => reject(err)));
        }).on('error', reject);
    });
}

/**
 * Returns an S3Client configured for Cloudflare R2, or null if env vars are missing.
 */
function getR2Client() {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    if (!accountId || !accessKeyId || !secretAccessKey) return null;
    return new S3Client({
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        region: 'auto',
        credentials: { accessKeyId, secretAccessKey },
    });
}

/**
 * Uploads a local file to Cloudflare R2. No-op if R2 is not configured.
 */
async function uploadToR2(localFilePath, objectKey) {
    const bucket = process.env.R2_BUCKET_NAME;
    const r2 = getR2Client();
    if (!r2 || !bucket) return;

    try {
        // Skip upload if the object already exists in R2.
        try {
            await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
            console.log(`[R2] Already exists: ${objectKey}`);
            return;
        } catch {
            // Object not found — proceed with upload.
        }

        const fileBuffer = await fs.promises.readFile(localFilePath);
        await r2.send(new PutObjectCommand({
            Bucket: bucket,
            Key: objectKey,
            Body: fileBuffer,
        }));
        console.log(`[R2] Uploaded ${objectKey} to bucket ${bucket}`);
    } catch (err) {
        console.error(`[R2] Upload failed for ${objectKey}:`, err.message);
    }
}

module.exports = function setupDevProxy(app) {
    // Serve a cached card image from the temp cache directory.
    // Used by the browser after a successful POST to /__dev__/cache-card-image.
    app.get('/__dev__/card-image', (req, res) => {
        const imageName = String(req.query.name || '');
        if (!isValidFileName(imageName)) {
            res.status(400).json({ error: 'Invalid filename format.' });
            return;
        }
        const filePath = path.join(CACHE_DIR, imageName);
        res.sendFile(filePath, (err) => {
            if (err && !res.headersSent) {
                res.status(404).json({ error: 'Not cached.' });
            }
        });
    });

    // Downloads a card image into the temp cache dir and uploads it to Cloudflare R2.
    // Returns { cached: true, url: '/__dev__/card-image?name=...' } on success so the
    // browser can update the <img> src without touching public/, which would hot-reload
    // the CRA dev server and reset React state (including the current page).
    app.post('/__dev__/cache-card-image', async (req, res) => {
        if (process.env.NODE_ENV !== 'development') {
            res.status(403).json({ error: 'Only available in development mode.' });
            return;
        }

        const imageName = String(req.query.name || '');
        if (!isValidFileName(imageName)) {
            res.status(400).json({ error: 'Invalid filename format.' });
            return;
        }

        const targetPath = path.join(CACHE_DIR, imageName);
        const servedUrl = `/__dev__/card-image?name=${encodeURIComponent(imageName)}`;

        try {
            if (fs.existsSync(targetPath)) {
                await uploadToR2(targetPath, imageName);
                res.status(200).json({ cached: true, source: 'existing', url: servedUrl });
                return;
            }

            fs.mkdirSync(CACHE_DIR, { recursive: true });
            const sourceUrl = getExternalImageUrl(imageName);
            await downloadToFile(sourceUrl, targetPath);
            await uploadToR2(targetPath, imageName);
            res.status(200).json({ cached: true, source: 'downloaded', url: servedUrl });
        } catch (err) {
            res.status(502).json({
                cached: false,
                error: err && err.message ? err.message : 'Failed to cache image.',
            });
        }
    });
};
