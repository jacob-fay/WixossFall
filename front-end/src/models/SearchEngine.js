import { Signi, Spell, Lrig, Assist, Piece } from './Card';

export class SearchEngine {
    static typeFunc(filter, card) {
        const typeMap = { signi: Signi, spell: Spell, lrig: Lrig, assist: Assist, piece: Piece };
        return typeMap[filter] && card instanceof typeMap[filter];
    }

    static nameFunc(filter, card) {
        return card.name.includes(filter);
    }

    static classFunc(filter, card) {
        if (!(card instanceof Signi)) return false;
        return card.clas.includes(filter);
    }

    static levelFunc(filter, card) {
        if (!(card instanceof Signi) && !(card instanceof Lrig) && !(card instanceof Assist)) return false;
        return card.level === parseInt(filter);
    }

    static textFunc(filter, card) {
        return card.textBox.includes(filter);
    }

    static powerGreaterFunc(filter, card) {
        if (!(card instanceof Signi)) return false;
        return parseInt(card.power) > parseInt(filter);
    }

    static powerLesserFunc(filter, card) {
        if (!(card instanceof Signi)) return false;
        return parseInt(card.power) < parseInt(filter);
    }

    static powerEqual(filter, card) {
        if (!(card instanceof Signi)) return false;
        return parseInt(card.power) === parseInt(filter);
    }

    static dissonaFunc(filter, card) {
        return card.subtype && card.subtype.toLowerCase() === 'dissona';
    }

    static lifeburstFunc(filter, card) {
        if (!(card instanceof Signi) && !(card instanceof Spell)) return false;
        return !!card.lifeburst;
    }

    static colorEqualFunc(filter, card) {
        if (!Array.isArray(card.color)) return false;
        return card.color.some(c => c.toLowerCase() === filter.toLowerCase());
    }

    static levelGreater(filter, card) {
        if (!(card instanceof Signi) && !(card instanceof Lrig) && !(card instanceof Assist)) return false;
        return card.level > parseInt(filter);
    }

    static levelLower(filter, card) {
        if (!(card instanceof Signi) && !(card instanceof Lrig) && !(card instanceof Assist)) return false;
        return card.level < parseInt(filter);
    }

    static _registerFunc(command, splitter, functionMap, usedFunctions, usedNegativeFilter) {
        const action = command.split(splitter)[0];
        const filter = command.split(splitter)[1];
        const key = action + splitter;
        const entry = functionMap[key];
        if (!entry) throw new Error(`Unknown filter key: ${key}`);
        entry[0].push([filter, entry[1]]);
    }

    /**
     * Filters a list of cards using a query string.
     * Supported filters: type:, class:, level:, text:, is:, has:, power>, power<, power=,
     * level>, level<, color:, and negations with - prefix.
     * @param {string} string - search query
     * @param {Card[]} db - array of Card objects
     * @returns {Card[]}
     */
    static search(string, db) {
        const usedFunctions = [];
        const usedNegativeFilter = [];

        const functionMap = {
            'type:': [usedFunctions, SearchEngine.typeFunc],
            'class:': [usedFunctions, SearchEngine.classFunc],
            'level:': [usedFunctions, SearchEngine.levelFunc],
            'text:': [usedFunctions, SearchEngine.textFunc],
            '-type:': [usedNegativeFilter, SearchEngine.typeFunc],
            '-class:': [usedNegativeFilter, SearchEngine.classFunc],
            '-level:': [usedNegativeFilter, SearchEngine.levelFunc],
            '-text:': [usedNegativeFilter, SearchEngine.textFunc],
            'is:': [usedFunctions, SearchEngine.dissonaFunc],
            '-is:': [usedNegativeFilter, SearchEngine.dissonaFunc],
            'has:': [usedFunctions, SearchEngine.lifeburstFunc],
            '-has:': [usedNegativeFilter, SearchEngine.lifeburstFunc],
            'power>': [usedFunctions, SearchEngine.powerGreaterFunc],
            'power<': [usedFunctions, SearchEngine.powerLesserFunc],
            'power=': [usedFunctions, SearchEngine.powerEqual],
            '-power>': [usedNegativeFilter, SearchEngine.powerGreaterFunc],
            '-power<': [usedNegativeFilter, SearchEngine.powerLesserFunc],
            '-power=': [usedNegativeFilter, SearchEngine.powerEqual],
            'level>': [usedFunctions, SearchEngine.levelGreater],
            'level<': [usedFunctions, SearchEngine.levelLower],
            '-level>': [usedNegativeFilter, SearchEngine.levelGreater],
            '-level<': [usedNegativeFilter, SearchEngine.levelLower],
            'color:': [usedFunctions, SearchEngine.colorEqualFunc],
            '-color:': [usedNegativeFilter, SearchEngine.colorEqualFunc],
        };

        const spaceSeparated = string.split(' ').filter(s => s.length > 0);

        for (const command of spaceSeparated) {
            try {
                if (command.includes(':')) {
                    SearchEngine._registerFunc(command, ':', functionMap, usedFunctions, usedNegativeFilter);
                } else if (command.includes('>')) {
                    SearchEngine._registerFunc(command, '>', functionMap, usedFunctions, usedNegativeFilter);
                } else if (command.includes('<')) {
                    SearchEngine._registerFunc(command, '<', functionMap, usedFunctions, usedNegativeFilter);
                } else if (command.includes('=')) {
                    SearchEngine._registerFunc(command, '=', functionMap, usedFunctions, usedNegativeFilter);
                } else {
                    usedFunctions.push([command, SearchEngine.nameFunc]);
                }
            } catch (e) {
                console.warn('Search error:', e.message);
                return [];
            }
        }

        return db.filter(card => {
            for (const [filter, fn] of usedFunctions) {
                if (!fn(filter, card)) return false;
            }
            for (const [filter, fn] of usedNegativeFilter) {
                if (fn(filter, card)) return false;
            }
            return true;
        });
    }
}
