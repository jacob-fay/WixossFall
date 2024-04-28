import jsonToCards as t
from flask_restful import Resource
from flask_restful import request
from flask_restful import reqparse
from flask import abort
from jsonToCards import db
from regex import Regex
class Test(Resource):
    allcards = db().allCards
    def get(self,name,offset):
        print(name)
        if (name == 'RANDOMPLSDONOTGUESSPLS'):
            name = ''
        list = []
        for item in Regex.regex(name,self.allcards):
            list.append(item.image)
        print(list)
        return list[offset : offset + 16]

