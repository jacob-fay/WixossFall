from card import *
class Regex:
    def typeFunc(filter,card:Card):
        '''Returns true if the filter matches the card type of the card'''
        typeMap = {'signi' : Signi, 'spell' : Spell, 'lrig':Lrig,'assist':Assist,'piece':Piece}
        return typeMap[filter] == type(card)
    def nameFunc(filter,card:Card):
        '''Returns true if the filter is contained inside the cards name'''
        return card.name.__contains__(filter)
    def classFunc(filter,card:Signi):
        '''Returns true if the filter is contained within the cards class\n
            Returns False if the card is not a Signi'''
        if type(card) != Signi:
            return False
        return card.clas.__contains__(filter)
    def levelFunc(filter,card):
        '''Returns true if the filter matches the cards level\n
            Returns false if the card is not a signi, lrig, or assist'''
        if type(card) != Signi and type(card) != Lrig and type(card) != Assist:
            return False
        return card.level == int(filter)
    def textFunc(filter,card:Card):
        '''Returns true if the cards textbox is contained inside of the card'''
        return card.textBox.__contains__(filter)
    def powerGreaterFunc(filter,card:Card):
        '''Returns true if the filter has greater power then the cards power\n
        Returns false if the card is not a signi'''
        if type(card) != Signi:
            return False
        card:Signi
        return int(card.power) > int(filter)
    def powerLesserFunc(filter,card:Card):
        '''Returns true if the filter has lesser power then the cards power\n
        Returns false if the card is not a signi'''
        if type(card) != Signi:
            return False
        card:Signi
        return int(card.power) < int(filter)
    def powerEqual(filter,card:Card):
        '''Returns true if the filter has equal power then the cards power\n
        Returns false if the card is not a signi'''
        if type(card) != Signi:
            return False
        card:Signi
        return int(card.power) == int(filter)
    def dissonaFunc(filter:str,card:Card):
        '''Returns true if the filter has the subtype of dissona'''
        return card.subtype.lower() == 'dissona'
    def lifeburstFunc(filter:str,card:Card):
        '''Returns true if the card does not have an empty lifeburst\n
            Returns false if the card is not a signi or spell'''
        if type(card) != Signi and type(card) != Spell:
            return False
        return card.lifeburst != ""
    def costEqualFunc(filter:str,card:Card):
        '''Returns true if the filter is contained within the cards color'''
        for color in card.color:
            if filter.lower() == color.lower():
                return True
        return False
    def registerFunc(command:str,splitter:str,functionMap:dict):
        '''Takes a command and then adds that command to the corrasponding list defined by the functionMap'''
        action = command.split(splitter)[0]
        filter = command.split(splitter)[1]
        usedOrNegFilter:list = functionMap[hash(action+splitter)][0]
        usedOrNegFilter.append([filter,functionMap[hash(action+splitter)][1]])
    def regex(string:str, db: list):
        '''Takes the entire user input and a list of cards and then returns a list of cards that matches the regex'''
        usedFunctions = []
        usedNegitivefilter = []
        space_seperated = string.split(" ")
        
        #function mapping for ":"
        functionMap = {hash('type:') : [usedFunctions,Regex.typeFunc]}
        functionMap[hash('class:')] = [usedFunctions,Regex.classFunc]
        functionMap[hash('level:')] = [usedFunctions,Regex.levelFunc]
        functionMap[hash('text:')] = [usedFunctions,Regex.textFunc]
        functionMap[hash('-type:')] = [usedNegitivefilter,Regex.classFunc]
        functionMap[hash('-class:')] = [usedNegitivefilter,Regex.classFunc]
        functionMap[hash('-level:')] = [usedNegitivefilter,Regex.levelFunc]
        functionMap[hash('-text:')] = [usedNegitivefilter,Regex.textFunc]
        functionMap[hash('is:')] = [usedFunctions,Regex.dissonaFunc]
        functionMap[hash('-is:')] = [usedNegitivefilter,Regex.dissonaFunc]
        functionMap[hash('has:')] = [usedFunctions,Regex.lifeburstFunc]
        functionMap[hash('-has:')] = [usedNegitivefilter,Regex.lifeburstFunc]
        functionMap[hash('power>')] = [usedFunctions,Regex.powerGreaterFunc]
        functionMap[hash('power<')] = [usedFunctions,Regex.powerGreaterFunc]
        functionMap[hash('power>')] = [usedNegitivefilter,Regex.powerLesserFunc]
        functionMap[hash('power<')] = [usedNegitivefilter,Regex.powerLesserFunc]
        functionMap[hash('power=')] = [usedFunctions,Regex.powerGreaterFunc]
        functionMap[hash('power=')] = [usedNegitivefilter,Regex.powerLesserFunc]
  

        for command in space_seperated:
           
            if command.__contains__(":"):
                Regex.registerFunc(command,':',functionMap)
            elif command.__contains__(">"):
                Regex.registerFunc(command,'>',functionMap)
            
            elif command.__contains__("<"):
                Regex.registerFunc(command,'<',functionMap)
            elif command.__contains__("="):
                Regex.registerFunc(command,'=',functionMap)

                    
            else:
                usedFunctions.append([command,Regex.nameFunc])

        match = []
        for card in db:
            mat = True
            card:Card
            for func in usedFunctions:
                if (not func[1](func[0],card)):
                    mat = False
                    break
            for func in usedNegitivefilter:
                if (func[1](func[0],card)):
                    mat = False
                    break
            
            if (mat == True):
                
                match.append(card)
        return match
