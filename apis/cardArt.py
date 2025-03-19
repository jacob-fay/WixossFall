import jsonToCards as t
from flask_restful import Resource
from flask_restful import request
from flask_restful import reqparse
from flask import send_from_directory
from flask import abort
from jsonToCards import db
from regex import Regex
from os.path import isfile
import requests
class Cardart(Resource):
    def downloadImageJP(self,name):
        '''https://www.takaratomy.co.jp/products/wixoss/img/card/SPK02/SPK02-11C.jpg'''
        url = f'''https://www.takaratomy.co.jp/products/wixoss/img/card/{name.split('-')[0]}/{name}'''
        img_data = requests.get(url).content
        with open(f'cards/{name}', 'wb') as handler:
            handler.write(img_data)



    def downloadImageEN(self,name):
            '''"https://www.takaratomy.co.jp/products/en.wixoss/card/thumb/WXDi-P03-041[EN].jpg'''
            url = f'''https://www.takaratomy.co.jp/products/en.wixoss/card/thumb/{name}'''
            img_data = requests.get(url).content
            with open(f'cards/{name}', 'wb') as handler:
                handler.write(img_data)
    def get(self,name):
        if isfile(f'cards/{name}'):
            return send_from_directory('cards',name)
        if  name.find('[EN]') == -1:
            self.downloadImageJP(name)
        elif name.find('[EN]'):
            self.downloadImageEN(name)
        return send_from_directory('cards',name)
