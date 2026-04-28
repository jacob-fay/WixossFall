const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const { URL } = require('url');
const { createProxyMiddleware } = require('http-proxy-middleware');

const FLASK_URL = 'http://localhost:5000';

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

            fileStream.on('finish', () => {
                fileStream.close(() => resolve(true));
            });

            fileStream.on('error', (err) => {
                fs.unlink(destinationFilePath, () => reject(err));
            });
        }).on('error', reject);
    });
}

module.exports = function setupDevProxy(app) {
    // Proxy /cardart/ and /test/ to the Flask backend so the Python scripts are used
    // for image serving (with Cloudflare R2 upload) and card search.
    app.use(
        '/cardart',
        createProxyMiddleware({
            target: FLASK_URL,
            changeOrigin: true,
            on: {
                error: (err, req, res) => {
                    res.status(502).json({ error: 'Flask backend unavailable. Is server.py running?' });
                },
            },
        })
    );

    app.use(
        '/test',
        createProxyMiddleware({
            target: FLASK_URL,
            changeOrigin: true,
            on: {
                error: (err, req, res) => {
                    res.status(502).json({ error: 'Flask backend unavailable. Is server.py running?' });
                },
            },
        })
    );

    // Legacy dev endpoint: downloads an image into public/cards/ directly via Node.
    // Used as a fallback when the Flask backend is not running.
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

        const cardsDir = path.resolve(__dirname, '../public/cards');
        const targetPath = path.join(cardsDir, imageName);

        try {
            if (fs.existsSync(targetPath)) {
                res.status(200).json({ cached: true, source: 'existing' });
                return;
            }

            fs.mkdirSync(cardsDir, { recursive: true });
            const sourceUrl = getExternalImageUrl(imageName);
            await downloadToFile(sourceUrl, targetPath);
            res.status(200).json({ cached: true, source: 'downloaded', url: sourceUrl });
        } catch (err) {
            res.status(502).json({
                cached: false,
                error: err && err.message ? err.message : 'Failed to cache image.',
            });
        }
    });
};
