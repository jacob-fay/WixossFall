from card_models import *


class SearchEngine:
    # --- Filter predicates ---

    def typeFunc(filter, card: Card):
        '''Returns true if the filter matches the card type of the card'''
        typeMap = {'signi': Signi, 'spell': Spell, 'lrig': Lrig, 'assist': Assist, 'piece': Piece}
        return typeMap.get(filter) == type(card)

    def nameFunc(filter, card: Card):
        '''Returns true if the filter is contained inside the cards name'''
        return filter in card.name

    def classFunc(filter, card: Card):
        '''Returns true if the filter is contained within the cards class.
        Returns False if the card is not a Signi'''
        if type(card) != Signi:
            return False
        return filter in card.clas

    def levelFunc(filter, card):
        '''Returns true if the filter matches the cards level.
        Returns false if the card is not a signi, lrig, or assist'''
        if type(card) not in (Signi, Lrig, Assist):
            return False
        return card.level == int(filter)

    def textFunc(filter, card: Card):
        '''Returns true if the filter is contained inside the cards textbox'''
        return filter in card.textBox

    def powerGreaterFunc(filter, card: Card):
        '''Returns true if the cards power is greater than the filter.
        Returns false if the card is not a signi'''
        if type(card) != Signi:
            return False
        return int(card.power) > int(filter)

    def powerLesserFunc(filter, card: Card):
        '''Returns true if the cards power is less than the filter.
        Returns false if the card is not a signi'''
        if type(card) != Signi:
            return False
        return int(card.power) < int(filter)

    def powerEqual(filter, card: Card):
        '''Returns true if the cards power equals the filter.
        Returns false if the card is not a signi'''
        if type(card) != Signi:
            return False
        return int(card.power) == int(filter)

    def dissonaFunc(filter: str, card: Card):
        '''Returns true if the card has the dissona subtype'''
        return card.subtype.lower() == 'dissona'

    def lifeburstFunc(filter: str, card: Card):
        '''Returns true if the card has a lifeburst.
        Returns false if the card is not a signi or spell'''
        if type(card) not in (Signi, Spell):
            return False
        return card.lifeburst != ""

    def colorEqualFunc(filter: str, card: Card):
        '''Returns true if the filter matches one of the cards colors'''
        return any(filter.lower() == c.lower() for c in card.color)

    def levelGreater(filter: str, card: Card):
        '''Returns true if the cards level is greater than the filter.
        Returns false if the card is not a signi, lrig, or assist'''
        if type(card) not in (Signi, Lrig, Assist):
            return False
        return card.level > int(filter)

    def levelLower(filter: str, card: Card):
        '''Returns true if the cards level is less than the filter.
        Returns false if the card is not a signi, lrig, or assist'''
        if type(card) not in (Signi, Lrig, Assist):
            return False
        return card.level < int(filter)

    # --- Tokenizer ---

    @staticmethod
    def tokenize(string: str) -> list:
        '''Converts a query string into a list of tokens.

        Token format: (type, value) where type is one of:
          PREDICATE, AND, OR, NOT, LPAREN, RPAREN

        Rules:
          '(' / ')'           → LPAREN / RPAREN
          'and' (any case)    → AND
          'or'  (any case)    → OR
          '-'  (standalone)   → NOT
          '-word'             → NOT + PREDICATE('word')
          everything else     → PREDICATE
        '''
        tokens = []
        i = 0
        n = len(string)
        while i < n:
            while i < n and string[i] == ' ':
                i += 1
            if i >= n:
                break
            if string[i] == '(':
                tokens.append(('LPAREN', None))
                i += 1
                continue
            if string[i] == ')':
                tokens.append(('RPAREN', None))
                i += 1
                continue
            j = i
            while j < n and string[j] not in (' ', '(', ')'):
                j += 1
            word = string[i:j]
            i = j
            if word.lower() == 'and':
                tokens.append(('AND', None))
            elif word.lower() == 'or':
                tokens.append(('OR', None))
            elif word == '-':
                tokens.append(('NOT', None))
            elif word.startswith('-'):
                tokens.append(('NOT', None))
                tokens.append(('PREDICATE', word[1:]))
            else:
                tokens.append(('PREDICATE', word))
        return tokens

    # --- Recursive-descent parser ---
    #
    # Grammar:
    #   expr     = or_expr
    #   or_expr  = and_expr ('or' and_expr)*
    #   and_expr = not_expr ('and'? not_expr)*   ← 'and' is optional (implicit AND)
    #   not_expr = 'NOT' not_expr | primary
    #   primary  = '(' expr ')' | PREDICATE
    #
    # Each _parse_xxx(tokens, pos) returns (ast_node, new_pos).

    @staticmethod
    def _parse_expr(tokens: list, pos: int) -> tuple:
        return SearchEngine._parse_or(tokens, pos)

    @staticmethod
    def _parse_or(tokens: list, pos: int) -> tuple:
        left, p = SearchEngine._parse_and(tokens, pos)
        while p < len(tokens) and tokens[p][0] == 'OR':
            p += 1
            right, p = SearchEngine._parse_and(tokens, p)
            left = ('OR', left, right)
        return left, p

    @staticmethod
    def _parse_and(tokens: list, pos: int) -> tuple:
        left, p = SearchEngine._parse_not(tokens, pos)
        if left is None:
            return None, pos
        while p < len(tokens):
            ttype = tokens[p][0]
            if ttype in ('OR', 'RPAREN'):
                break
            # Consume optional explicit 'and'; implicit AND skips this
            next_pos = p + 1 if ttype == 'AND' else p
            if next_pos >= len(tokens):
                break
            right, p2 = SearchEngine._parse_not(tokens, next_pos)
            if right is None:
                break
            left = ('AND', left, right)
            p = p2
        return left, p

    @staticmethod
    def _parse_not(tokens: list, pos: int) -> tuple:
        if pos < len(tokens) and tokens[pos][0] == 'NOT':
            child, p = SearchEngine._parse_not(tokens, pos + 1)
            return ('NOT', child), p
        return SearchEngine._parse_primary(tokens, pos)

    @staticmethod
    def _parse_primary(tokens: list, pos: int) -> tuple:
        if pos >= len(tokens):
            return None, pos
        ttype, tval = tokens[pos]
        if ttype == 'LPAREN':
            expr, p = SearchEngine._parse_expr(tokens, pos + 1)
            if p < len(tokens) and tokens[p][0] == 'RPAREN':
                return expr, p + 1
            return expr, p
        if ttype == 'PREDICATE':
            return SearchEngine._build_predicate_node(tval), pos + 1
        return None, pos

    @staticmethod
    def _build_predicate_node(value: str) -> tuple:
        '''Converts a predicate string (e.g. "type:signi", "level>3", "tama")
        into a leaf AST node: ('PREDICATE', fn, filter_value).'''
        splitter = None
        if ':' in value:
            splitter = ':'
        elif '>' in value:
            splitter = '>'
        elif '<' in value:
            splitter = '<'
        elif '=' in value:
            splitter = '='

        if splitter:
            idx = value.index(splitter)
            action = value[:idx]
            filter_val = value[idx + 1:]
            key = action + splitter
            fn = SearchEngine.FILTER_MAP.get(key)
            if fn:
                return ('PREDICATE', fn, filter_val)
            return ('PREDICATE', lambda f, c: False, filter_val)

        return ('PREDICATE', SearchEngine.nameFunc, value)

    # --- AST evaluator ---

    @staticmethod
    def _evaluate(node, card: Card) -> bool:
        if node is None:
            return True
        ntype = node[0]
        if ntype == 'AND':
            return SearchEngine._evaluate(node[1], card) and SearchEngine._evaluate(node[2], card)
        if ntype == 'OR':
            return SearchEngine._evaluate(node[1], card) or SearchEngine._evaluate(node[2], card)
        if ntype == 'NOT':
            return not SearchEngine._evaluate(node[1], card)
        if ntype == 'PREDICATE':
            return node[1](node[2], card)
        return True

    # --- Public API ---

    @staticmethod
    def search(string: str, db: list) -> list:
        '''Filters cards using a query string with and/or/not operators and grouping.

        Supported operators:
          field1 field2              implicit AND (both must match)
          field1 and field2          explicit AND
          field1 or field2           OR (either must match)
          -field1                    NOT (field must not match)
          -(field1 or field2)        NOT applied to a group
          (field1 or field2) and f3  grouping with parentheses

        Supported filter predicates:
          type:  class:  level:  text:  color:  is:  has:
          power>  power<  power=  level>  level<
        '''
        string = string.strip()
        if not string:
            return db
        tokens = SearchEngine.tokenize(string)
        if not tokens:
            return db
        ast, _ = SearchEngine._parse_expr(tokens, 0)
        return [card for card in db if SearchEngine._evaluate(ast, card)]


# Populated after class definition so method references resolve correctly.
SearchEngine.FILTER_MAP = {
    'type:':   SearchEngine.typeFunc,
    'class:':  SearchEngine.classFunc,
    'level:':  SearchEngine.levelFunc,
    'text:':   SearchEngine.textFunc,
    'is:':     SearchEngine.dissonaFunc,
    'has:':    SearchEngine.lifeburstFunc,
    'color:':  SearchEngine.colorEqualFunc,
    'power>':  SearchEngine.powerGreaterFunc,
    'power<':  SearchEngine.powerLesserFunc,
    'power=':  SearchEngine.powerEqual,
    'level>':  SearchEngine.levelGreater,
    'level<':  SearchEngine.levelLower,
}
