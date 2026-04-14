export class Timing {
    static attack = 'attack';
    static main = 'main';
    static spell = 'spell';
    static main_attack = 'main/attack';
    static main_spell = 'main/spell';
    static main_attack_spell = 'main/attack/spell';
    static attack_spell = 'attack/spell';
    static other = 'other';
}

export class Color {
    static blue = 'blue';
    static green = 'green';
    static white = 'white';
    static red = 'red';
    static black = 'black';
    static colorless = 'colorless';
}

export class CardType {
    static signi = 'signi';
    static lrig = 'lrig';
    static piece = 'piece';
    static spell = 'spell';
    static assist = 'assist';
}

export class Cost {
    constructor(colorless, white, black, green, red, blue) {
        this.colorMap = { colorless, white, black, green, red, blue };
        this.color = new Set();
        this.totalCost = 0;
        for (const [key, val] of Object.entries(this.colorMap)) {
            if (val > 0) this.color.add(key);
            this.totalCost += val;
        }
    }

    toString() {
        return `total cost: ${this.totalCost}\nbreakdown: ${JSON.stringify(this.colorMap)}`;
    }
}

export class Card {
    constructor(id, set, name, color, cardType, artist, textBox, image, subtype) {
        this.id = id;
        this.set = set;
        this.name = name;
        this.color = color;
        this.cardType = cardType;
        this.artist = artist;
        this.textBox = textBox;
        this.image = image;
        this.subtype = subtype;
    }

    toString() {
        return `${this.name} is a ${this.cardType} that has colors ${this.color}.\nIt is from the set ${this.set}.\nTextBox: ${this.textBox}\nIt's artist is ${this.artist}`;
    }
}

export class Signi extends Card {
    constructor(id, set, name, color, cardType, artist, textBox, power, lifeburst, level, image, clas, subtype) {
        super(id, set, name, color, cardType, artist, textBox, image, subtype);
        this.power = power;
        this.lifeburst = lifeburst;
        this.level = level;
        this.clas = clas;
    }

    toString() {
        return `${super.toString()}\nLevel: ${this.level}\nBurst: ${this.lifeburst}\nPower: ${this.power}`;
    }
}

export class Resona extends Signi {}export class Piece extends Card {
    constructor(id, set, name, color, cardType, artist, textBox, cost, timing, image) {
        super(id, set, name, color, cardType, artist, textBox, image, '');
        this.cost = cost;
        this.timing = timing;
    }

    toString() {
        return `${super.toString()}\n${this.cost}\nUse timing: ${this.timing}`;
    }
}

export class Art extends Card {
    constructor(id, set, name, color, cardType, artist, textBox, cost, timing, image) {
        super(id, set, name, color, cardType, artist, textBox, image, '');
        this.cost = cost;
        this.timing = timing;
    }

    toString() {
        return `${super.toString()}\n${this.cost}\nUse timing: ${this.timing}`;
    }
}

export class Spell extends Card {
    constructor(id, set, name, color, cardType, artist, textBox, cost, image, subtype, lifeburst) {
        super(id, set, name, color, cardType, artist, textBox, image, subtype);
        this.cost = cost;
        this.lifeburst = lifeburst;
    }

    toString() {
        return `${super.toString()}\n${this.cost}`;
    }
}

export class Lrig extends Card {
    constructor(id, set, name, color, cardType, artist, textBox, limit, level, cost, image) {
        super(id, set, name, color, cardType, artist, textBox, image, '');
        this.limit = limit;
        this.level = level;
        this.cost = cost;
    }

    toString() {
        return `${super.toString()}\n${this.cost}\nlevel: ${this.level}`;
    }
}

export class Assist extends Card {
    constructor(id, set, name, color, cardType, artist, textBox, limit, level, cost, timing, image) {
        super(id, set, name, color, cardType, artist, textBox, image, '');
        this.limit = limit;
        this.level = level;
        this.cost = cost;
        this.timing = timing;
    }

    toString() {
        return `${super.toString()}\n${this.cost}\nlevel: ${this.level}`;
    }
}
