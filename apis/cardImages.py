import jsonToCards as t
from flask_restful import Resource
from flask_restful import request
from flask_restful import reqparse
from flask import abort
from jsonToCards import db
from regex import Regex
class Test(Resource):
    def __init__(self) -> None:
        super().__init__()
        self.allcards_images = [ x.image for x in db().allCards]
        self.allcards = db().allCards
    def get(self,name,offset):
        if (name == 'RANDOMPLSDONOTGUESSPLS'):
            return self.allcards_images[offset : offset + 16]
        list = []
        for item in Regex.regex(name,self.allcards):
            list.append(item.image)
        return list[offset : offset + 16]

