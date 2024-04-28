from card import *
import json
class db:
    __slots__ = ('allCards')
    def __init__(self) -> None:
        self.allCards = db.createallCards()
    def costConverter(string:str) -> Cost:
        #very bad pracitice don't feel like doing a converter
        match string:
            case '\u300aW\u300b\u00d7\uff12\n\u300aC\u300b\u00d7\uff13':
                return Cost(3,2,0,0,0,0)
            case '\u300aB\u300b\u00d7\uff12\n\u300aC\u300b\u00d7\uff12':
                return Cost(2,0,2,0,0,0)
            case '':
                return  Cost(0,0,0,0,0,0)
            case '\u300aC\u300b\u00d7\uff10':
                return Cost(0,0,0,0,0,0) #0 colorless
            case '\u300aC\u300b\u00d7\uff11':
                return Cost(1,0,0,0,0,0) #0 colorless
            case '\u300aC\u300b\u00d7\uff12':
                return Cost(2,0,0,0,0,0) #2 colorless
            case '\u300aC\u300b\u00d7\uff13':
                return Cost(3,0,0,0,0,0) #3 colorless
            case '\u300aC\u300b\u00d7\uff14':
                return Cost(4,0,0,0,0,0) #4 colorless
            case '\u300aC\u300b\u00d7\uff15':
                return Cost(5,0,0,0,0,0) #5 colorless
            case '\u300aC\u300b\u00d7\uff16':
                return Cost(6,0,0,0,0,0) #6 colorless
            case '\u300aC\u300b\u00d7\uff17':
                return Cost(7,0,0,0,0,0) #7 colorless
            case '\u300aC\u300b\u00d7\uff18':
                return Cost(8,0,0,0,0,0) #8 colorless
            
            case '\u300aW\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff12':
                return Cost(2,1,0,0,0,0)
            case '\u300aG\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff12':
                return Cost(2,0,0,1,0,0)
            case '\u300aW\u300b\u00d7\uff10':
                return Cost(0,0,0,0,0,0) #0 white
            case '\u300aW\u300b\u00d7\uff11':
                return Cost(1,0,0,0,0,0) #1 white
            case '\u300aW\u300b\u00d71':
                return Cost(1,0,0,0,0,0) #1 white
            case '\u300aW\u300b\u00d7\uff12':
                return Cost(2,0,0,0,0,0) #2 white
            case '\u300aW\u300b\u00d7\uff13':
                return Cost(3,0,0,0,0,0) #3 white
            
            case '\u300aG\u300b\u00d7\uff10':
                return Cost(0,0,0,0,0,0) #0 white
            case '\u300aG\u300b\u00d7\uff11':
                return Cost(1,0,0,0,0,0) #1 white
            case '\u300aG\u300b\u00d71':
                return Cost(1,0,0,0,0,0) #1 white
            case '\u300aG\u300b\u00d7\uff12':
                return Cost(2,0,0,0,0,0) #2 white
            case '\u300aG\u300b\u00d7\uff13':
                return Cost(3,0,0,0,0,0) #3 white
            
            
            
            
            case '\u300aB\u300b\u00d7\uff10':
                return Cost(0,0,0,0,0,0) #1 black
            case '\u300aB\u300b\u00d7\uff11':
                return Cost(0,0,1,0,0,0) #1 black
            case '\u300aB\u300b\u00d7\uff12':
                return Cost(0,0,2,0,0,0) #1 black
            case '\u300aB\u300b\u00d7\uff13':
                return Cost(0,0,3,0,0,0) #1 black
            case '\u300aB\u300b\u00d7\uff12\r\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,0,2,0,0,0)





            case '\u300aR\u300b\u00d7\uff10':
                return Cost(0,0,0,0,0,0) #0 red
            case '\u300aR\u300b\u00d7\uff11':
                return Cost(1,0,0,0,0,0) #0 red
            case '\u300aR\u300b\u00d7\uff12':
                return Cost(2,0,0,0,0,0) #2 red
            case '\u300aR\u300b\u00d7\uff13':
                return Cost(3,0,0,0,0,0) #3 red
            case '\u300aR\u300b\u00d7\uff14':
                return Cost(4,0,0,0,0,0) #4 red
            case '\u300aR\u300b\u00d7\uff15':
                return Cost(5,0,0,0,0,0) #5 red
            case '\u300aR\u300b\u00d7\uff16':
                return Cost(6,0,0,0,0,0) #6 red
            case '\u300aR\u300b\u00d7\uff17':
                return Cost(7,0,0,0,0,0) #7 red
            case '\u300aR\u300b\u00d7\uff18':
                return Cost(8,0,0,0,0,0) #8 red
            
            case '\u300aU\u300b\u00d7\uff10':
                return Cost(0,0,0,0,0,0) #0 blue
            case '\u300aU\u300b\u00d7\uff11':
                return Cost(1,0,0,0,0,0) #1 blue
            case '\u300aU\u300b\u00d7\uff12':
                return Cost(2,0,0,0,0,0) #2 blue
            case '\u300aU\u300b\u00d7\uff13':
                return Cost(3,0,0,0,0,0) #3 blue
            case '\u300aU\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,0,0,0,0,1)
            case '\u300aG\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,0,0,1,0,0)
            case '\u300aB\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,0,1,0,0,0)
            case '\u300aG\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,0,0,1,0,0)
            case '\u300aW\u300b\u00d7\uff11\r\n\u300aU\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,1,0,0,0,1)
            case '\u300aR\u300b\u00d7\uff11\r\n\u300aW\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,1,0,0,1,0)
            case '\u300aU\u300b\u00d7\uff11\r\n\u300aB\u300b\u00d7\uff11':
                return Cost(0,0,1,0,0,1)
            case '\u300aG\u300b\u00d7\uff11\r\n\u300aW\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,1,0,1,0,0)
            case '\u300aB\u300b\u00d7\uff11\r\n\u300aG\u300b\u00d7\uff11':
                return Cost(0,0,1,1,0,0)
            case '\u300aW\u300b\u00d7\uff11\r\n\u300aB\u300b\u00d7\uff11':
                return Cost(0,1,1,0,0,0)
            case '\u300aR\u300b\u00d7\uff11\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,0,0,0,1,0)
            case '\u300aW\u300b\u00d7\uff11\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,1,0,0,0,0)
            case '\u300aB\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff12':
                return Cost(2,0,1,0,0,0)
            case '\u300aW\u300b\u00d7\uff12\r\n\u300aC\u300b\u00d7\uff11':
                return Cost(2,1,0,0,0,0)
            case '\u306f\u3057\u3082\u3068\u306a\u304a\u3084':
                return Cost(1,0,0,0,0,0)
            case '\u300aR\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,0,0,0,1,0)
            case '\u300aW\u300b\u00d7\uff11\r\n\u300aC\u300b\u00d7\uff11':
                return Cost(1,1,0,0,0,0)
            case '\u300aB\u300b\u00d71':
                return Cost(0,0,2,0,0,0)
            case '\u300aR\u300b\u00d7\uff11\r\n\u300aB\u300b\u00d7\uff11':
                return Cost(0,0,1,0,1,0)
        raise ValueError(f"Cost code: '{string}' is not implemented")
            
            
        
    def timeConverter(string:str) -> Timing:
        match string:
            case "Main Phase":
                return Timing.main
            case "Main Phase\r\nAttack Phase":
                return Timing.main_attack
            case "Attack Phase":
                return Timing.attack
            case "Main Phase\r\nSpell Cut-In":
                return Timing.main_spell
            case "Main Phase\nAttack Phase":
                return Timing.main_attack
        raise Exception("Error reading play timing: "+repr(string))

    def colorConverter(string:str) -> list:
        colorList:list = []
        if string.__contains__('W'):
            colorList.append(Color.white)
        if string.__contains__('U'):
            colorList.append(Color.blue)
        if string.__contains__('C'):
            colorList.append(Color.colorless)
        if string.__contains__('B'):
            colorList.append(Color.black)
        if string.__contains__('R'):
            colorList.append(Color.red)
        if string.__contains__('G'):
            colorList.append(Color.blue)
        return colorList
    def limitConverter(string:str):
        match string:
            case '+ 1':
                return 1
    def cardParser(card:dict) -> Card:
        int = card["ID"]
        name = card["name"]
        cardText = card["content"]
        artist = card["artist"]
        set = card["product_type"]
        color =  db.colorConverter(card["color"])
        image = card['image']
        subtype = ''
        try:
            subtype = card['subtype']
            return Card(int,set,name,color,CardType.piece,artist,cardText,image,subtype)
        except: 
            return Card(int,set,name,color,CardType.piece,artist,cardText,image,'')
        


    def pieceParser(card:dict) -> Piece:
        cardparsed = db.cardParser(card)
        cardparsed:Card
        cost = db.costConverter(card["cost"])
        timing = db.timeConverter(card["guard_coin_timing"])
        return Piece(cardparsed.id,cardparsed.set,cardparsed.name,cardparsed.color,CardType.piece,cardparsed.artist,cardparsed.textBox,cost,timing,cardparsed.image)

    def signiParser(card:dict):
        cardparsed = db.cardParser(card)
        power = card["power"]
        level = int(card["level"])
        lifeburst = card['power_text']
        clas = card['LRIG_SIGNI_type']
        return Signi(cardparsed.id,cardparsed.set,cardparsed.name,cardparsed.color,CardType.signi,cardparsed.artist,cardparsed.textBox,power,lifeburst,level,cardparsed.image,clas,cardparsed.subtype)
    def assistParser(card:dict):
        cardparsed = db.cardParser(card)
        cost = db.costConverter(card["cost"])
        timing = db.timeConverter(card["guard_coin_timing"])
        limit = db.limitConverter(card['limits'])
        level = int(card['level'])
        return Assist(cardparsed.id,cardparsed.set,cardparsed.name,cardparsed.color,CardType.assist,cardparsed.artist,cardparsed.textBox,limit,level,cost,timing,cardparsed.image)
    def lrigParser(card:dict):
        cardparsed = db.cardParser(card)
        cost = db.costConverter(card["cost"])
        limit = db.limitConverter(card['limits'])
        level = int(card['level'])
        return Lrig(cardparsed.id,cardparsed.set,cardparsed.name,cardparsed.color,CardType.lrig,cardparsed.artist,cardparsed.textBox,limit,level,cost,cardparsed.image)
    def spellParser(card:dict):
        cardparsed = db.cardParser(card)
        cost = db.costConverter(card["cost"])
        return Spell(cardparsed.id,cardparsed.set,cardparsed.name,cardparsed.color,CardType.spell,cardparsed.artist,cardparsed.textBox,cost,cardparsed.image,cardparsed.subtype)





    def createallCards(allCards:list = '') -> list:
        if (allCards == ''):
            allCards = []
        allCards:list
        namesUsed:set = set()
        with open('sample.json','r') as file:
            jFile = json.load(file)
            for index,card in enumerate(jFile):
                if (card["name"] in namesUsed):
                    continue
                namesUsed.add(card["name"])
                type = card['card_type']
                match type:
                    case "PIECE":
                        allCards.append(db.pieceParser(card))
                    case "ASSIST LRIG":
                        allCards.append(db.assistParser(card))
                    case "SPELL":
                        allCards.append(db.spellParser(card))
                    case "SIGNI":
                        allCards.append(db.signiParser(card))
                    case "LRIG":
                        allCards.append(db.lrigParser(card))
                    

        return allCards

if (__name__ == "__main__"):
   l = db.createallCards()
   l:list
   print(l.__len__())
    
    