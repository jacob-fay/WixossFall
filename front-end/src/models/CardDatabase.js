import {
    Card, Signi, Resona, Piece, Art, Spell, Lrig, Assist,
    Cost, Timing, CardType
} from './Card';

export class CardDatabase {
    constructor() {
        this.allCards = [];
    }

    static costConverter(string) {
        if (!string) return new Cost(0, 0, 0, 0, 0, 0);
        if (string.length === 4 && string.includes('-')) {
            return new Cost(parseInt(string[0]), 0, 0, 0, 0, 0);
        }
        let cost;
        try {
            cost = string.split('- ')[1];
            if (!cost) throw new Error();
        } catch {
            cost = string;
        }
        const black = (cost.match(/B/g) || []).length;
        const blue = (cost.match(/U/g) || []).length;
        const white = (cost.match(/W/g) || []).length;
        const green = (cost.match(/G/g) || []).length;
        const red = (cost.match(/R/g) || []).length;
        const firstChar = cost[0];
        const colorless = isNaN(parseInt(firstChar)) ? 0 : parseInt(firstChar);
        return new Cost(colorless, white, black, green, red, blue);
    }

    static timeConverter(string) {
        const map = {
            'Main Phase': Timing.main,
            'Main Phase\r\nAttack Phase': Timing.main_attack,
            'Main Phase\nAttack Phase': Timing.main_attack,
            'Attack Phase': Timing.attack,
            'Main Phase\r\nSpell Cut-In': Timing.main_spell,
        };
        const result = map[string];
        if (result === undefined) throw new Error(`Error reading play timing: ${JSON.stringify(string)}`);
        return result;
    }

    static artsTimeConverter(string) {
        if (string === 'When a SIGNI on your field is about to be vanished Cut-In') return Timing.other;
        const hasMain = string.includes('Main Phase');
        const hasAttack = string.includes('Attack Phase');
        const hasSpell = string.includes('Spell Cut-In');
        if (hasMain) {
            if (hasAttack) return hasSpell ? Timing.main_attack_spell : Timing.main_attack;
            return hasSpell ? Timing.main_spell : Timing.main;
        } else {
            if (hasAttack) return hasSpell ? Timing.attack_spell : Timing.attack;
            if (hasSpell) return Timing.spell;
        }
        throw new Error(`Error reading Art timing: ${JSON.stringify(string)}`);
    }

    static colorConverter(string) {
        const colorList = [];
        if (!string) return colorList;
        if (string.includes('W')) colorList.push('white');
        if (string.includes('U')) colorList.push('blue');
        if (string.includes('C')) colorList.push('colorless');
        if (string.includes('B')) colorList.push('black');
        if (string.includes('R')) colorList.push('red');
        if (string.includes('G')) colorList.push('green');
        return colorList;
    }

    static limitConverter(string) {
        if (string === '+ 1') return 1;
        return null;
    }

    static cardParser(card) {
        const name = (card['name'] || '').replace(/\(\([^)]*\)\)/g, '').trim();
        const cardText = card['text'] || '';
        const set = card['set'];
        const image = card['image'];
        let subtype = card['subtype'] || '';
        if (!subtype && card['type']) {
            const parts = card['type'].split('- ');
            if (parts.length > 1) subtype = parts.slice(1).join('- ');
        }
        const base = new Card('none', set, name, 'none', CardType.piece, 'none', cardText, image, subtype);
        base.formats = CardDatabase._parseFormats(card);
        return base;
    }

    static _parseFormats(card) {
        const formats = new Set();
        if (card['format-allstar'] === 'legal') formats.add('as');
        if (card['format-key'] === 'legal') formats.add('key');
        if (card['format-diva'] === 'legal') formats.add('diva');
        return formats;
    }

    static pieceParser(card) {
        const base = CardDatabase.cardParser(card);
        const cost = CardDatabase.costConverter(card['manacost']);
        let timing = Timing.main;
        try {
            timing = CardDatabase.timeConverter(card['text'].split('se Timing [')[1].split(']')[0]);
        } catch {
            try {
                timing = CardDatabase.timeConverter(card['text'].split('se Timing: [')[1].split(']')[0]);
            } catch {}
        }
        const result = new Piece(base.id, base.set, base.name, base.color, CardType.piece, base.artist, base.textBox, cost, timing, base.image);
        result.formats = base.formats;
        return result;
    }

    static artParser(card) {
        const base = CardDatabase.cardParser(card);
        const cost = CardDatabase.costConverter(card['manacost']);
        let timing = Timing.main;
        try {
            timing = CardDatabase.artsTimeConverter(card['text'].split('se Timing [')[1].split(']')[0]);
        } catch {
            try {
                timing = CardDatabase.artsTimeConverter(card['text'].split('se Timing: [')[1].split(']')[0]);
            } catch {}
        }
        const result = new Art(base.id, base.set, base.name, base.color, CardType.piece, base.artist, base.textBox, cost, timing, base.image);
        result.formats = base.formats;
        return result;
    }

    static resonaParser(card) {
        const base = CardDatabase.cardParser(card);
        const power = card['pt'];
        const level = parseInt(card['cmc']);
        const burst = card['type'];
        let lifeburst = null;
        if (burst && burst.includes('SIGNI|LB')) {
            const parts = card['text'].split('[Life Burst]:');
            lifeburst = parts.length > 1 ? parts[1] : null;
        }
        const clas = card['type'] ? card['type'].split('- ')[1] : '';
        const result = new Resona(base.id, base.set, base.name, base.color, CardType.signi, base.artist, base.textBox, power, lifeburst, level, base.image, clas, base.subtype);
        result.formats = base.formats;
        return result;
    }

    static signiParser(card) {
        const base = CardDatabase.cardParser(card);
        const power = card['pt'];
        const level = parseInt(card['cmc']);
        const burst = card['type'];
        let lifeburst = null;
        if (burst && burst.includes('SIGNI|LB')) {
            const parts = card['text'].split('[Life Burst]:');
            lifeburst = parts.length > 1 ? parts[1] : null;
        }
        const clas = card['type'] ? card['type'].split('- ')[1] : '';
        const result = new Signi(base.id, base.set, base.name, base.color, CardType.signi, base.artist, base.textBox, power, lifeburst, level, base.image, clas, base.subtype);
        result.formats = base.formats;
        return result;
    }

    static assistParser(card) {
        const base = CardDatabase.cardParser(card);
        const cost = CardDatabase.costConverter(card['cost']);
        const timing = CardDatabase.timeConverter(card['guard_coin_timing']);
        const limit = CardDatabase.limitConverter(card['limits']);
        const level = parseInt(card['level']);
        const result = new Assist(base.id, base.set, base.name, base.color, CardType.assist, base.artist, base.textBox, limit, level, cost, timing, base.image);
        result.formats = base.formats;
        return result;
    }

    static lrigParser(card) {
        const base = CardDatabase.cardParser(card);
        const cost = CardDatabase.costConverter(card['manacost']);
        const limit = CardDatabase.limitConverter(card['loyalty']);
        const level = parseInt(card['cmc']);
        const result = new Lrig(base.id, base.set, base.name, base.color, CardType.lrig, base.artist, base.textBox, limit, level, cost, base.image);
        result.formats = base.formats;
        return result;
    }

    static spellParser(card) {
        const base = CardDatabase.cardParser(card);
        const cost = CardDatabase.costConverter(card['manacost']);
        const result = new Spell(base.id, base.set, base.name, base.color, CardType.spell, base.artist, base.textBox, cost, base.image, base.subtype, null);
        result.formats = base.formats;
        return result;
    }

    /**
     * Fetches and parses the card-database.xml file, returning a CardDatabase instance.
     * Update public/card-database.xml to add new cards.
     * @param {string} xmlUrl - URL to the card database XML file (default: process.env.PUBLIC_URL + '/card-database.xml')
     * @returns {Promise<CardDatabase>}
     */
    static async load(xmlUrl) {
        const url = xmlUrl || `${process.env.PUBLIC_URL}/card-database.xml`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch card database: ${response.statusText}`);
        const text = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, 'application/xml');
        const db = new CardDatabase();
        db.allCards = CardDatabase._parseDoc(doc);
        return db;
    }

    static _parseDoc(doc) {
        const allCards = [];
        const cardsEl = doc.querySelector('cards');
        if (!cardsEl) return allCards;

        for (const cardEl of cardsEl.querySelectorAll('card')) {
            const tagToVal = {};

            const propEl = cardEl.querySelector('prop');
            if (propEl) {
                for (const child of propEl.children) {
                    tagToVal[child.tagName] = child.textContent;
                }
            }

            for (const child of cardEl.children) {
                tagToVal[child.tagName] = child.textContent;
            }

            const maintype = tagToVal['maintype'];
            if (!maintype) continue; // skip tokens

            const imageUrls = Array.from(cardEl.querySelectorAll('set'))
                .filter(el => el.hasAttribute('picURL'))
                .map(el => el.getAttribute('picURL'));

            for (const pic of imageUrls) {
                tagToVal['image'] = pic.split('/').pop();
                tagToVal['imageUrl'] = pic;

                try {
                    switch (maintype) {
                        case 'PIECE':
                            allCards.push(CardDatabase.pieceParser(tagToVal));
                            break;
                        case 'LRIG|ASSIST':
                            allCards.push(CardDatabase.assistParser(tagToVal));
                            break;
                        case 'SPELL':
                            allCards.push(CardDatabase.spellParser(tagToVal));
                            break;
                        case 'SIGNI':
                            allCards.push(CardDatabase.signiParser(tagToVal));
                            break;
                        case 'SIGNI|LB':
                            allCards.push(CardDatabase.signiParser(tagToVal));
                            break;
                        case 'LRIG':
                            allCards.push(CardDatabase.lrigParser(tagToVal));
                            break;
                        case 'RESONA':
                            allCards.push(CardDatabase.resonaParser(tagToVal));
                            break;
                        case 'ARTS':
                            allCards.push(CardDatabase.artParser(tagToVal));
                            break;
                        default:
                            break;
                    }
                } catch (err) {
                    console.warn(`Skipping card "${tagToVal['name']}": ${err.message}`);
                }
            }
        }
        return allCards;
    }

    /**
     * Returns the local static path for a card image.
     * Place image files in front-end/public/cards/ to serve them locally.
     * @param {string} imageName
     * @returns {string}
     */
    static resolveLocalImageUrl(imageName) {
        if (!imageName) return '';
        return `${process.env.PUBLIC_URL}/cards/${encodeURIComponent(imageName)}`;
    }

    /**
     * Returns the external fallback URL for a card image.
     * Used as onError fallback when the local image is not available.
     * JP cards:    https://www.takaratomy.co.jp/products/wixoss/img/card/{set}/{name}
     * EN cards:    https://www.takaratomy.co.jp/products/en.wixoss/card/thumb/{name}
     * Custom (Tetrus): https://raw.githubusercontent.com/TetrusAO/Wixoss-TCG-Cockatrice-Plugin/master/pics/CUSTOM/{name}
     * @param {string} imageName
     * @returns {string}
     */
    static resolveExternalImageUrl(imageName) {
        if (!imageName) return '';
        if (imageName.includes('[EN]')) {
            return `https://www.takaratomy.co.jp/products/en.wixoss/card/thumb/${imageName}`;
        }
        if (imageName.includes('(') || !imageName.includes('-')) {
            return `https://raw.githubusercontent.com/TetrusAO/Wixoss-TCG-Cockatrice-Plugin/master/pics/CUSTOM/${imageName}`;
        }
        const setCode = imageName.split('-')[0];
        return `https://www.takaratomy.co.jp/products/wixoss/img/card/${setCode}/${imageName}`;
    }

    /**
     * Returns true when running on localhost so the dev-only caching endpoint can be used.
     * @returns {boolean}
     */
    static isLocalhost() {
        if (typeof window === 'undefined') return false;
        const host = window.location.hostname;
        return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
    }

    /**
     * Dev-only helper that asks the CRA dev server to download a missing card image
     * into front-end/public/cards/ and upload it to Cloudflare R2 (if configured).
     * @param {string} imageName
     * @returns {Promise<boolean>}
     */
    static async cacheImageLocallyOnLocalhost(imageName) {
        if (!imageName || !CardDatabase.isLocalhost()) return false;

        try {
            const response = await fetch(`/__dev__/cache-card-image?name=${encodeURIComponent(imageName)}`, {
                method: 'POST',
            });
            return response.ok;
        } catch {
            return false;
        }
    }

    /**
     * @deprecated Use resolveLocalImageUrl() for src and resolveExternalImageUrl() for onError fallback.
     */
    static resolveImageUrl(imageName) {
        return CardDatabase.resolveLocalImageUrl(imageName);
    }
}
