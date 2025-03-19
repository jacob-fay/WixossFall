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
    
    def downloadImageTetrus(self,name):
            '''https://raw.githubusercontent.com/TetrusAO/Wixoss-TCG-Cockatrice-Plugin/master/pics/CUSTOM/Tawil%20(WX12).jpeg'''
            url = f'''https://raw.githubusercontent.com/TetrusAO/Wixoss-TCG-Cockatrice-Plugin/master/pics/CUSTOM/{name}'''
            img_data = requests.get(url).content
            with open(f'cards/{name}', 'wb') as handler:
                handler.write(img_data)
    def get(self,name):
        if isfile(f'cards/{name}'):
            return send_from_directory('cards',name)
      
        if '[EN]' in name:
            self.downloadImageEN(name)
        elif '(' in  name:
             self.downloadImageTetrus(name)
        else:
             self.downloadImageJP(name)
        return send_from_directory('cards',name)
