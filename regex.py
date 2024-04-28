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
    def regex(string:str, db: list):
        #BREAKS IF SAME FILTER IS USED PLS DON'T DO THIS
        usedFunctions = []
        usedNegitivefilter = []
        space_seperated = string.split(" ")
        for command in space_seperated:
            if command.__contains__(":") or command.__contains__(">")  or command.__contains__("<"):
                
                if command.__contains__(":"):
                    action = command.split(":")[0]
                    filter = command.split(':')[1]
                
                    match action:
                        case 'type':
                            usedFunctions.append([filter, Regex.typeFunc])
                        case 'class':
                            usedFunctions.append([filter,Regex.classFunc])
                        case 'level':
                             usedFunctions.append([filter,Regex.levelFunc])
                        case '-type':
                            usedNegitivefilter.append([filter, Regex.typeFunc])
                        case '-class':
                            usedNegitivefilter.append([filter, Regex.classFunc])
                        case '-level':
                            usedNegitivefilter.append([filter, Regex.levelFunc])
                        case 'text':
                             usedFunctions.append([filter,Regex.textFunc])
                        case '-text':
                             usedNegitivefilter.append([filter, Regex.textFunc])
                        case 'is':
                            match filter:
                                case 'dissona':
                                    
                                    usedFunctions.append([filter,Regex.dissonaFunc])
                                case '-dissona':
                                    usedNegitivefilter.append([filter,Regex.dissonaFunc])


                elif command.__contains__(">"):
                    action = command.split(">")[0]
                    filter = command.split('>')[1]
                    match action:
                        case 'power':
                             usedFunctions.append([filter, Regex.powerGreaterFunc])
                        case '-power':
                             usedNegitivefilter.append([filter, Regex.powerGreaterFunc])
                
                elif command.__contains__("<"):
                    action = command.split("<")[0]
                    filter = command.split('<')[1]
                    match action:
                        case 'power':
                             usedFunctions.append([filter, Regex.powerLesserFunc])
                        case '-power':
                             usedNegitivefilter.append([filter, Regex.powerLesserFunc])
                        
            else:
                print('test')
                usedFunctions.append([command,  Regex.nameFunc])

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
