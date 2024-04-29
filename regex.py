from card import *
class Regex:
    def typeFunc(filter,card:Card):
        typeMap = {'signi' : Signi, 'spell' : Spell, 'lrig':Lrig,'assist':Assist,'piece':Piece}
        return typeMap[filter] == type(card)


    def nameFunc(filter,card:Card):
        return card.name.__contains__(filter)
    def classFunc(filter,card:Signi):
        if type(card) != Signi:
            return False
        return card.clas.__contains__(filter)
    def levelFunc(filter,card):
        if type(card) != Signi and type(card) != Lrig and type(card) != Assist:
            return False
        return card.level == int(filter)
    def textFunc(filter,card:Card):
        return card.textBox.__contains__(filter)
    def powerGreaterFunc(filter,card:Card):
        if type(card) != Signi:
            return False
        card:Signi
        return int(card.power) > int(filter)
    def powerLesserFunc(filter,card:Card):
        if type(card) != Signi:
            return False
        card:Signi
        return int(card.power) < int(filter)
    def dissonaFunc(filter:str,card:Card):
        return card.subtype.lower() == 'dissona'
    def lifeburstFunc(filter:str,card:Card):
        if type(card) != Signi and type(card) != Spell:
            return False
        return card.lifeburst != ""
    def regex(string:str, db: list):
        usedFunctions = []
        usedNegitivefilter = []
        space_seperated = string.split(" ")
        
        #function mapping for ":"
        functionMap = {hash('type') : [usedFunctions,Regex.typeFunc]}
        functionMap[hash('class')] = [usedFunctions,Regex.classFunc]
        functionMap[hash('level')] = [usedFunctions,Regex.levelFunc]
        functionMap[hash('text')] = [usedFunctions,Regex.textFunc]
        functionMap[hash('-type')] = [usedNegitivefilter,Regex.classFunc]
        functionMap[hash('-class')] = [usedNegitivefilter,Regex.classFunc]
        functionMap[hash('-level')] = [usedNegitivefilter,Regex.levelFunc]
        functionMap[hash('-text')] = [usedNegitivefilter,Regex.textFunc]
        functionMap[hash('is')] = [usedFunctions,Regex.dissonaFunc]
        functionMap[hash('-is')] = [usedNegitivefilter,Regex.dissonaFunc]
        functionMap[hash('has')] = [usedFunctions,Regex.lifeburstFunc]
        functionMap[hash('-has')] = [usedNegitivefilter,Regex.lifeburstFunc]

        #function map for power filtering
        powerMap = {}
        powerMap[hash('power>')] = [usedFunctions,Regex.powerGreaterFunc]
        powerMap[hash('power<')] = [usedFunctions,Regex.powerGreaterFunc]
        powerMap[hash('power>')] = [usedNegitivefilter,Regex.powerLesserFunc]
        powerMap[hash('power<')] = [usedNegitivefilter,Regex.powerLesserFunc]
        
        for command in space_seperated:
           
            if command.__contains__(":"):
                action = command.split(":")[0]
                filter = command.split(':')[1]
                usedOrNegFilter:list = functionMap[hash(action)][0]
                usedOrNegFilter.append([filter,functionMap[hash(action)][1]])
            elif command.__contains__(">"):
                action = command.split(">")[0]
                filter = command.split('>')[1]
                usedOrNegFilter:list = powerMap[hash(action+'>')][0]
                usedOrNegFilter.append([filter,functionMap[hash(action+'>')][1]])
            
            elif command.__contains__("<"):
                action = command.split("<")[0]
                filter = command.split('<')[1]
                usedOrNegFilter:list = powerMap[hash(action+'<')][0]
                usedOrNegFilter.append([filter,functionMap[hash(action+'<')][1]])
                    
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
