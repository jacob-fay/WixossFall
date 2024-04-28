from time import sleep
import requests
import json
#from requests_html import HTMLSession
import pandas as pd

def jpGrapCard(set: str,cardnum: str):
     cardtextBase = 'https://www.takaratomy.co.jp/products/wixoss/card_list.php?card=card_detail&card_no=WXDi-P'
     html = requests.get(f'{cardtextBase}{set}-{cardnum}')
     name = html.text.split('<p class="cardName">')[1].split('<br class="sp">')[0]
     symble = html.text.split('class="cardSkill">')[1].split('alt="')[1].split('"')[0]
     text = html.text.split('class="cardSkill">')[1].split('alt="')[1].split('">')[1].split("/div")
     

     print(text)
def grabCardsbySet(set:str, cardNum: str):
    cardtextBase = 'https://www.takaratomy.co.jp/products/en.wixoss/card/itemsearch.php?card_no=WXDi-D'
    cardImageBase = 'https://www.takaratomy.co.jp/products/en.wixoss/card/thumb/WXDi-P'
    text = requests.get(f'{cardtextBase}{set}-{cardNum}[EN]')
    dic:dict = json.loads(text.text)
    items = dic['items'][0]
    #downloadImage(f'{cardImageBase}{set}-{cardNum}[EN].jpg',items['ID'])
    items['image'] = f'{cardImageBase}{set}-{cardNum}[EN].jpg'
    with open('sample.json', 'a') as file:
        file.write(',')
        json.dump(items,file)
    
    return items['content']
def downloadImage(url,id):
    img_data = requests.get(url).content
    with open(f'images/{id}.jpg', 'wb') as handler:
        handler.write(img_data)

def loopForEntireSet(set,lastID):
 
    for num in range(1,lastID+1):
        print(f'{num}.')
        grabCardsbySet(set,str(num).zfill(3))
        #sleep(1)
    with open('sample.json', 'a') as file:
        file.write(',')
def loopforAllsets():
    setnumber = [200,200,200,200,200]
    set = 12
    for num in setnumber:
        loopForEntireSet(str(set).zfill(2),num)
        set +=1
        #sleep(1)


if (__name__ == '__main__'):
    loopForEntireSet('09',500)
    #jpGrapCard('00','010')
    
