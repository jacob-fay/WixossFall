import card_xml_parser as t
from flask_restful import Resource
from flask_restful import request
from flask_restful import reqparse
from flask import send_from_directory
from flask import abort
from card_xml_parser import db
from os.path import isfile, basename
import re
import os
import requests
import boto3
from botocore.exceptions import BotoCoreError, ClientError
from dotenv import load_dotenv

load_dotenv()

SAFE_FILENAME_RE = re.compile(r'^[\w\-\[\]. ()]+$')

_r2_client = None
_r2_client_initialized = False

def _get_r2_client():
    '''Return a cached boto3 S3 client configured for Cloudflare R2, or None if env vars are missing.'''
    global _r2_client, _r2_client_initialized
    if _r2_client_initialized:
        return _r2_client
    _r2_client_initialized = True
    account_id = os.getenv('R2_ACCOUNT_ID')
    access_key = os.getenv('R2_ACCESS_KEY_ID')
    secret_key = os.getenv('R2_SECRET_ACCESS_KEY')
    if not all([account_id, access_key, secret_key]):
        return None
    _r2_client = boto3.client(
        's3',
        endpoint_url=f'https://{account_id}.r2.cloudflarestorage.com',
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        region_name='auto',
    )
    return _r2_client

def _upload_to_r2(local_path, name):
    '''Upload a local image file to the configured Cloudflare R2 bucket. No-op if not configured.'''
    bucket = os.getenv('R2_BUCKET_NAME')
    r2 = _get_r2_client()
    if r2 is None or not bucket:
        return
    try:
        r2.upload_file(local_path, bucket, name)
        print(f'[R2] Uploaded {name} to bucket {bucket}')
    except (BotoCoreError, ClientError) as e:
        print(f'[R2] Upload failed for {name}: {e}')

class Cardart(Resource):
    def _validate_name(self, name):
        '''Reject names that could cause path traversal or unexpected URL construction.'''
        safe = basename(name)
        if safe != name or not SAFE_FILENAME_RE.match(name):
            abort(400, 'Invalid filename format')

    def downloadImageJP(self,name):
        '''https://www.takaratomy.co.jp/products/wixoss/img/card/SPK02/SPK02-11C.jpg'''
        url = f'''https://www.takaratomy.co.jp/products/wixoss/img/card/{name.split('-')[0]}/{name}'''
        img_data = requests.get(url).content
        with open(f'cards/{name}', 'wb') as handler:
            handler.write(img_data)
        _upload_to_r2(f'cards/{name}', name)



    def downloadImageEN(self,name):
            '''"https://www.takaratomy.co.jp/products/en.wixoss/card/thumb/WXDi-P03-041[EN].jpg'''
            url = f'''https://www.takaratomy.co.jp/products/en.wixoss/card/thumb/{name}'''
            img_data = requests.get(url).content
            with open(f'cards/{name}', 'wb') as handler:
                handler.write(img_data)
            _upload_to_r2(f'cards/{name}', name)
    
    def downloadImageTetrus(self,name):
            '''https://raw.githubusercontent.com/TetrusAO/Wixoss-TCG-Cockatrice-Plugin/master/pics/CUSTOM/Tawil%20(WX12).jpeg'''
            url = f'''https://raw.githubusercontent.com/TetrusAO/Wixoss-TCG-Cockatrice-Plugin/master/pics/CUSTOM/{name}'''
            img_data = requests.get(url).content
            with open(f'cards/{name}', 'wb') as handler:
                handler.write(img_data)
            _upload_to_r2(f'cards/{name}', name)

    def get(self,name):
        self._validate_name(name)
        if isfile(f'cards/{name}'):
            return send_from_directory('cards',name)
      
        if '[EN]' in name:
            self.downloadImageEN(name)
        elif '(' in  name:
             self.downloadImageTetrus(name)
        else:
             self.downloadImageJP(name)
        return send_from_directory('cards',name)
