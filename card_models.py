class Timing:
    attack = 'attack'
    main = 'main'
    spell = 'spell'
    main_attack = 'main/attack'
    main_spell = 'main/spell'
    main_attack_spell = 'main/attack/spell'
    attack_spell = 'attack/spell'
    other = 'other'
class Color:
    blue = 'blue'
    green = 'green'
    white = 'white'
    red = 'red'
    black = 'black'
    colorless = 'colorless'
class CardType:
    signi = 'signi'
    lrig = 'lrig'
    piece = 'piece'
    spell = 'spell'
    assist = 'assist'

class Set:
    p12 = 'placeholder'

class Cost:
    __slots__ = ('color','colorMap','totalCost')
    def __init__(self,colorless: int,white:int,black:int,green:int,red:int,blue:int) -> None:
        colorMap = {'colorless' : colorless, 'white' : white, 'black' : black, 'green' : green, 'red' : red, 'blue' : blue}
        contains = set()
        count = 0
        for color in colorMap.keys():
            if (colorMap[color] > 0):
                contains.add(color)
            count+= colorMap[color]
        self.color = contains
        self.colorMap = colorMap
        self.totalCost = count
    def __str__(self):
        return f'total cost: {self.totalCost}\nbreakdown: {self.colorMap}'
    
    
    
class Card:
    __slots__ = ('id','set','name','color','cardType','artist','textBox','image','subtype')
    def __init__(self,id:int,set:Set,name:str,color:list,cardType: CardType,artist:str,textBox: str,image: str,subtype:str) -> None: #color is a set
        self.id = id
        self.artist = artist
        self.set = set
        self.cardType = cardType
        self.name = name
        self.color = color
        self.textBox = textBox
        self.image = image
        self.subtype = subtype
    def __str__(self):
       return f'{self.name} is a {self.cardType}  that has colors {self.color}.\nIt is from the set {self.set}.\nTextBox: {self.textBox}\nIt\'s artist is {self.artist}'



class Signi(Card):
    __slots__ = ('power','lifeburst','level','clas')
    def __init__(self,id:int,set:Set,name:str,color:list,cardType: CardType,artist:str,textBox:str,power:int,lifeburst:str,level:int,image:str,clas:str,subtype:str):
        super().__init__(id,set,name,color,cardType,artist,textBox,image,subtype)
        self.power = power
        self.lifeburst = lifeburst
        self.level = level
        self.clas = clas
    def __str__(self):
        return f'{super().__str__()}\nLevel: {self.level}\nBurst: {self.lifeburst}\nPower: {self.power}'
class Resona(Signi):
    def __init__(self, id, set, name, color, cardType, artist, textBox, power, lifeburst, level, image, clas, subtype):
        super().__init__(id, set, name, color, cardType, artist, textBox, power, lifeburst, level, image, clas, subtype)
    def __str__(self):
        return f'{super().__str__()}\nLevel: {self.level}\nBurst: {self.lifeburst}\nPower: {self.power}'

class Piece(Card):
    __slots__ = ('cost','timing')
    def __init__(self, id: int, set: Set, name: str, color: list, cardType: CardType, artist: str,textBox:str,cost:Cost,timing: Timing.main,image:str) -> None:
        super().__init__(id, set, name, color, cardType, artist,textBox,image,'')
        self.cost = cost
        self.timing = timing
    def __str__(self):
        return f'{super().__str__()}\n{self.cost}\nUse timing: {self.timing}'
class Art(Card):
    __slots__ = ('cost','timing')
    def __init__(self, id: int, set: Set, name: str, color: list, cardType: CardType, artist: str,textBox:str,cost:Cost,timing: Timing.main,image:str) -> None:
        super().__init__(id, set, name, color, cardType, artist,textBox,image,'')
        self.cost = cost
        self.timing = timing
    def __str__(self):
        return f'{super().__str__()}\n{self.cost}\nUse timing: {self.timing}'
    
class Spell(Card):
    __slots__ = ('cost','lifeburst')
    def __init__(self, id: int, set: Set, name: str, color, cardType: CardType, artist: str, textBox: str,cost: Cost,image:str,subtype:str,lifeburst:str) -> None:
        super().__init__(id, set, name, color, cardType, artist, textBox,image,subtype)
        self.cost = cost
        self.lifeburst = lifeburst

    def __str__(self):
        return f'{super().__str__()}\n{self.cost}'
    
class Lrig(Card):
    def __init__(self, id: int, set: Set, name: str, color, cardType: CardType, artist: str, textBox: str,limit:int,level:int,cost:Cost,image:str) -> None:
        super().__init__(id, set, name, color, cardType, artist, textBox,image,'')
        self.limit = limit
        self.level = level
        self.cost = cost
    def __str__(self):
        return f'{super().__str__()}\n{self.cost}\nlevel: {self.level}\n'
    
class Assist(Card):
    def __init__(self, id: int, set: Set, name: str, color, cardType: CardType, artist: str, textBox: str,limit:int,level:int,cost:Cost,timing: Timing,image:str) -> None:
        super().__init__(id, set, name, color, cardType, artist, textBox,image,'')
        self.limit = limit
        self.level = level
        self.cost = cost
        self.timing = timing
    def __str__(self):
        return f'{super().__str__()}\n{self.cost}\nlevel: {self.level}\n{self.cost}'

def main():
    #print(Card(0,Set.p12,'bob',[Color.blue,Color.green],CardType.lrig,'joe'))
    #print(Signi(0,Set.p12,'bob',[Color.blue,Color.green],CardType.signi,'joe',12000,'bounce one signi',3))
    #t= Cost(0,0,0,0,0,0,0)
    #print(Piece(0,Set.p12,'bob',[Color.blue,Color.green],CardType.signi,'joe','flavor text',Cost(2,0,0,1,0,0),Timing().main))
    #print(Spell(0,Set.p12,'bob',[Color.blue,Color.green],CardType.signi,'joe','flavor text',Cost(2,0,0,1,0,0)))
    print(Lrig(0,Set.p12,"Tama",Color.white,CardType.lrig,"joe","dash",5,3,Cost(0,2,0,0,0,0)))
    
if (__name__ == '__main__'):
    main()
        
