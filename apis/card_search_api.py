import card_xml_parser as t
from flask_restful import Resource
from flask_restful import request
from flask_restful import reqparse
from flask import send_from_directory
from flask import abort
from card_xml_parser import db
from search_engine import SearchEngine

class Test(Resource):
    def __init__(self) -> None:
        super().__init__()
        self.allcards_images = [ x.image for x in db().allCards]
        self.allcards = db().allCards
    def get(self,name,offset):
        
        if (name == 'RANDOMPLSDONOTGUESSPLS'):

            return self.allcards_images[offset : offset + 16]
        list = []
        for item in SearchEngine.search(name,self.allcards):
            list.append(item.image)
        for item in list:
            print(item)
        return list[offset : offset + 16]

