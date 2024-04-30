from flask import Flask
from flask_restful import Resource, Api
from flask_cors import CORS
from apis.cardImages import Test
app = Flask(__name__) #create Flask instance
CORS(app) #Enable CORS on Flask server to work with Nodejs pages
api = Api(app) #api router
api.add_resource(Test,'/test/<string:name>/<int:offset>')

if __name__ == '__main__':
    
    print("Loading db")
    print("Starting flask")
    app.run(debug=True,host='129.21.67.19',port=5000), #starts Flask
    