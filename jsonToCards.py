import xml.etree
import xml.etree.ElementTree
import xml.parsers
from card import *
import json
import xml
class db:
    __slots__ = ('allCards')
    def __init__(self) -> None:
        self.allCards = db.createallCards()
    def costConverter(string:str) -> Cost:
        if string is None:
            return Cost(0,0,0,0,0,0)
        elif (len(string) == 4 and string.find('-') != -1):
            return Cost(int(string[0]),0,0,0,0,0)
        try: 
            cost = string.split('- ')[1]
        except IndexError:
            cost = string
        black = cost.count('B')
        blue = cost.count('U')
        white = cost.count('W')
        green = cost.count('G')
        red = cost.count('R')
        colorless = cost[0]
        try:
            colorless = int(colorless)
            return Cost(colorless,white,black,green,red,blue)
        except:
            return Cost(0,white,black,green,red,blue)
        
            
            
        
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
            colorList.append(Color.green)
        return colorList
    def limitConverter(string:str):
        match string:
            case '+ 1':
                return 1
    def cardParser(card:dict) -> Card:
        int = 'none'
        name = card["name"]
        cardText = card["text"]
        artist = 'none'
        set = card["set"]
        color =  'none'
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
        cost = db.costConverter(card["manacost"])
        try:
            timing = db.timeConverter(card['text'].split('se Timing [')[1].split(']')[0])
        except IndexError:
            try:
                timing = db.timeConverter(card['text'].split('se Timing: [')[1].split(']')[0])
            except:
                timing = Timing.main
       
        return Piece(cardparsed.id,cardparsed.set,cardparsed.name,cardparsed.color,CardType.piece,cardparsed.artist,cardparsed.textBox,cost,timing,cardparsed.image)

    def signiParser(card:dict):
        cardparsed = db.cardParser(card)
        power = card["pt"]
        level = int(card["cmc"])
        burst:str = card['type']
        if 'SIGNI|LB' in burst:
            lifeburst = card['text'].split('[Life Burst]:')[0]
            lifeburst = card['text'].split('[Life Burst]:')[1]
        else:
            lifeburst = None
        clas = card['type'].split('- ')[1]
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
        cost = db.costConverter(card["manacost"])
        limit = db.limitConverter(card['loyalty'])
        level = int(card['cmc'])
        return Lrig(cardparsed.id,cardparsed.set,cardparsed.name,cardparsed.color,CardType.lrig,cardparsed.artist,cardparsed.textBox,limit,level,cost,cardparsed.image)
    def spellParser(card:dict):
        cardparsed = db.cardParser(card)
        cost = db.costConverter(card["manacost"])
        lifeburst = None
        return Spell(cardparsed.id,cardparsed.set,cardparsed.name,cardparsed.color,CardType.spell,cardparsed.artist,cardparsed.textBox,cost,cardparsed.image,cardparsed.subtype,lifeburst)





    def createallCards() -> list:
        
        allCards = list() 
        tree = xml.etree.ElementTree.parse('Wixoss TCG.xml')
        
        for card in tree.getroot().find('cards').findall('card'):
            tag_to_val = dict()
            for tag in card.find('prop'):
                    tag_to_val[tag.tag] =  tag.text
            for tag in card:
                
              
                tag_to_val[tag.tag] =  tag.text
                
               
            
                
            try:    
                type = tag_to_val['maintype']
            except KeyError:
                tag_to_val['token']
                continue
            image_urls = [set_elem.attrib['picURL'] for set_elem in card.findall("set") if 'picURL' in set_elem.attrib]
            for pic in image_urls:

                #tag_to_val['image'] = card.find('set').attrib.get('picURL').split('/')[-1]
                tag_to_val['image'] = pic.split('/')[-1]

                match type:
                    case "PIECE":
                        allCards.append(db.pieceParser(tag_to_val))
                    case "LRIG|ASSIST":
                        allCards.append(db.assistParser(tag_to_val))
                    case "SPELL":
                        allCards.append(db.spellParser(tag_to_val))
                    case "SIGNI":
                        allCards.append(db.signiParser(tag_to_val))
                    case "LRIG":
                        allCards.append(db.lrigParser(tag_to_val))
                    case "RESONA":
                        pass
                    case "ART":
                        pass
                
                 
            

            
          
                    

        return allCards

if (__name__ == "__main__"):
   l = db.createallCards()
   l:list
   print(l.__len__())
    
    