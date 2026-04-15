import { Signi, Spell, Lrig, Assist, Piece, Art } from './Card';

export class SearchEngine {
    // --- Filter predicates ---

    static typeFunc(filter, card) {
        const typeMap = { signi: Signi, spell: Spell, lrig: Lrig, assist: Assist, piece: Piece, art: Art };
        return typeMap[filter.toLowerCase()] && card instanceof typeMap[filter.toLowerCase()];
    }

    static nameFunc(filter, card) {
        return card.name.toLowerCase().includes(filter.toLowerCase());
    }

    static classFunc(filter, card) {
        if (!(card instanceof Signi)) return false;
        return card.clas.toLowerCase().includes(filter.toLowerCase());
    }

    static levelFunc(filter, card) {
        if (!(card instanceof Signi) && !(card instanceof Lrig) && !(card instanceof Assist)) return false;
        return card.level === parseInt(filter);
    }

    static textFunc(filter, card) {
        return card.textBox.toLowerCase().includes(filter.toLowerCase());
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
        return (card.subtype || '').toLowerCase().includes('(dissona)');
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

    static formatFunc(filter, card) {
        return card.formats instanceof Set && card.formats.has(filter.toLowerCase());
    }

    // --- Tokenizer ---

    /**
     * Converts a query string into an array of tokens.
     *
     * Token shapes: { type: 'PREDICATE', value: string }
     *               { type: 'AND' | 'OR' | 'NOT' | 'LPAREN' | 'RPAREN' }
     *
     * Rules:
     *  - '(' and ')' become LPAREN / RPAREN
    *  - Text wrapped in double quotes becomes one literal PREDICATE (operators inside are ignored)
     *  - The bare keyword 'and' (case-insensitive) becomes AND
     *  - The bare keyword 'or'  (case-insensitive) becomes OR
     *  - A standalone '-' becomes NOT
     *  - '-word' (no space after '-') becomes NOT + PREDICATE('word')
     *  - Everything else becomes PREDICATE
     */
    static _tokenize(input) {
        const tokens = [];
        let i = 0;
        while (i < input.length) {
            while (i < input.length && input[i] === ' ') i++;
            if (i >= input.length) break;

            if (input[i] === '(') { tokens.push({ type: 'LPAREN' }); i++; continue; }
            if (input[i] === ')') { tokens.push({ type: 'RPAREN' }); i++; continue; }

            // Quoted literal: treat the entire content as a single name predicate.
            if (input[i] === '"') {
                let j = i + 1;
                let value = '';
                while (j < input.length) {
                    // Support escaped quote: \"
                    if (input[j] === '\\' && j + 1 < input.length && input[j + 1] === '"') {
                        value += '"';
                        j += 2;
                        continue;
                    }
                    if (input[j] === '"') break;
                    value += input[j];
                    j++;
                }
                tokens.push({ type: 'PREDICATE', value, literal: true });
                i = (j < input.length && input[j] === '"') ? j + 1 : j;
                continue;
            }

            // Read a non-whitespace, non-paren word
            let j = i;
            while (j < input.length && input[j] !== ' ' && input[j] !== '(' && input[j] !== ')') j++;
            const word = input.slice(i, j);
            i = j;

            if (word.toLowerCase() === 'and') {
                tokens.push({ type: 'AND' });
            } else if (word.toLowerCase() === 'or') {
                tokens.push({ type: 'OR' });
            } else if (word === '-') {
                tokens.push({ type: 'NOT' });
            } else if (word.startsWith('-')) {
                // '-type:signi' → NOT + PREDICATE('type:signi')
                tokens.push({ type: 'NOT' });
                tokens.push({ type: 'PREDICATE', value: word.slice(1) });
            } else {
                tokens.push({ type: 'PREDICATE', value: word });
            }
        }
        return tokens;
    }

    // --- Recursive-descent parser ---
    //
    // Grammar:
    //   expr      = or_expr
    //   or_expr   = and_expr ('or' and_expr)*
    //   and_expr  = not_expr ('and'? not_expr)*    ← 'and' is optional (implicit AND)
    //   not_expr  = 'NOT' not_expr | primary
    //   primary   = '(' expr ')' | PREDICATE
    //
    // Each _parseXxx(tokens, pos) returns [astNode, newPos].

    static _parseExpr(tokens, pos) {
        return SearchEngine._parseOr(tokens, pos);
    }

    static _parseOr(tokens, pos) {
        let [left, p] = SearchEngine._parseAnd(tokens, pos);
        while (p < tokens.length && tokens[p].type === 'OR') {
            p++;
            const [right, p2] = SearchEngine._parseAnd(tokens, p);
            left = { type: 'OR', left, right };
            p = p2;
        }
        return [left, p];
    }

    static _parseAnd(tokens, pos) {
        let [left, p] = SearchEngine._parseNot(tokens, pos);
        if (left === null) return [null, pos];

        while (p < tokens.length) {
            const t = tokens[p];
            // OR and RPAREN end this and-clause
            if (t.type === 'OR' || t.type === 'RPAREN') break;

            // Consume optional explicit 'and'; implicit AND skips this step
            let nextPos = (t.type === 'AND') ? p + 1 : p;
            if (nextPos >= tokens.length) break;

            const [right, p2] = SearchEngine._parseNot(tokens, nextPos);
            if (right === null) break;
            left = { type: 'AND', left, right };
            p = p2;
        }
        return [left, p];
    }

    static _parseNot(tokens, pos) {
        if (pos < tokens.length && tokens[pos].type === 'NOT') {
            const [child, p] = SearchEngine._parseNot(tokens, pos + 1);
            return [{ type: 'NOT', child }, p];
        }
        return SearchEngine._parsePrimary(tokens, pos);
    }

    static _parsePrimary(tokens, pos) {
        if (pos >= tokens.length) return [null, pos];
        const t = tokens[pos];

        if (t.type === 'LPAREN') {
            const [expr, p] = SearchEngine._parseExpr(tokens, pos + 1);
            // consume closing ')'
            return [expr, (p < tokens.length && tokens[p].type === 'RPAREN') ? p + 1 : p];
        }

        if (t.type === 'PREDICATE') {
            if (t.literal) {
                return [{ type: 'PREDICATE', fn: SearchEngine.nameFunc, filter: t.value }, pos + 1];
            }
            return [SearchEngine._buildPredicateNode(t.value), pos + 1];
        }

        return [null, pos];
    }

    /**
     * Converts a predicate token string (e.g. 'type:signi', 'level>3', 'tama')
     * into a leaf AST node: { type: 'PREDICATE', fn, filter }.
     */
    static _buildPredicateNode(value) {
        let splitter = null;
        if (value.includes(':'))      splitter = ':';
        else if (value.includes('>')) splitter = '>';
        else if (value.includes('<')) splitter = '<';
        else if (value.includes('=')) splitter = '=';

        if (splitter !== null) {
            const idx    = value.indexOf(splitter);
            const action = value.slice(0, idx);
            const filter = value.slice(idx + 1);
            const key    = action + splitter;
            const fn     = SearchEngine._FILTER_MAP[key];
            if (fn) return { type: 'PREDICATE', fn, filter };
            // Unknown key — never matches
            return { type: 'PREDICATE', fn: () => false, filter };
        }

        // Bare word → name search
        return { type: 'PREDICATE', fn: SearchEngine.nameFunc, filter: value };
    }

    // --- AST evaluator ---

    static _evaluate(node, card) {
        if (node === null) return true;
        switch (node.type) {
            case 'AND':       return SearchEngine._evaluate(node.left, card) && SearchEngine._evaluate(node.right, card);
            case 'OR':        return SearchEngine._evaluate(node.left, card) || SearchEngine._evaluate(node.right, card);
            case 'NOT':       return !SearchEngine._evaluate(node.child, card);
            case 'PREDICATE': return node.fn(node.filter, card);
            default:          return true;
        }
    }

    // --- Public API ---

    /**
     * Filters a list of cards using a query string.
     *
     * Supported operators:
     *   field1 field2            implicit AND (both must match)
     *   field1 and field2        explicit AND
     *   field1 or field2         OR (either must match)
    *   "literal text"          exact literal substring in card name
     *   -field1                  NOT (field must not match)
     *   -(field1 or field2)      NOT applied to a group
     *   (field1 or field2) and field3   grouping with parentheses
     *
     * Supported filter predicates:
     *   type:  class:  level:  text:  color:  is:  has:
     *   power>  power<  power=  level>  level<
     *
     * @param {string} string - search query
     * @param {Card[]} db     - array of Card objects
     * @returns {Card[]}
     */
    static search(string, db) {
        const trimmed = string.trim();
        if (!trimmed) return db;
        const tokens = SearchEngine._tokenize(trimmed);
        if (tokens.length === 0) return db;
        const [ast] = SearchEngine._parseExpr(tokens, 0);
        return db.filter(card => SearchEngine._evaluate(ast, card));
    }
}

// Populated after class definition so static method references resolve correctly.
SearchEngine._FILTER_MAP = {
    'type:':    SearchEngine.typeFunc,
    'class:':   SearchEngine.classFunc,
    'level:':   SearchEngine.levelFunc,
    'text:':    SearchEngine.textFunc,
    'is:':      SearchEngine.dissonaFunc,
    'has:':     SearchEngine.lifeburstFunc,
    'color:':   SearchEngine.colorEqualFunc,
    'format:':  SearchEngine.formatFunc,
    'power>':   SearchEngine.powerGreaterFunc,
    'power<':   SearchEngine.powerLesserFunc,
    'power=':   SearchEngine.powerEqual,
    'level>':   SearchEngine.levelGreater,
    'level<':   SearchEngine.levelLower,
};
