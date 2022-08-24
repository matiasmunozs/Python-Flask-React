"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
import os
from flask import Flask, request, jsonify, url_for, send_from_directory, render_template
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from api.utils import APIException, generate_sitemap
from api.models import db, User
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands

from flask_jwt_extended import JWTManager, create_access_token, get_jwt_identity, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta




#from models import Person

ENV = os.getenv("FLASK_ENV")
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../public/')
app = Flask(__name__)
app.url_map.strict_slashes = False

# database condiguration
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type = True)
db.init_app(app)

jwt= JWTManager(app)

app.config['JWT_SECRET_KEY']= 'dc7d98009d61ac52e4d1b64de55b7165' #secret-key https://www.md5.cz/

# Allow CORS requests to this API
CORS(app)

# add the admin
setup_admin(app)

# add the admin
setup_commands(app)

# Add all endpoints form the API with a "api" prefix
app.register_blueprint(api, url_prefix='/api')

# Handle/serialize errors like a JSON object
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# generate sitemap with all your endpoints
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# any other endpoint will try to serve it like a static file
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0 # avoid cache memory
    return response



@app.route('/api/register', methods=['POST'])
def register():
    
    name = request.json.get('name',"")
    email = request.json.get('email')
    password = request.json.get('password')

    user = User.query.filter_by(email=email).first()
    if user: return jsonify({"msg":"email ya esta en uso"}),400

    user=User()
    user.name =name
    user.email = email
    user.password = generate_password_hash(password)
    user.save()

    return jsonify({"msg":"usuario registrado, por favor inicie session"}), 201


@app.route('/api/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')

    user = User.query.filter_by(email=email, isActive=True).first()
    if not user:
        return jsonify({"msg":"Usuario/Contraseña no coinciden"}), 400

    if not check_password_hash(user.password, password): 
        return jsonify({"msg":"Usuario/Contraseña no coinciden"}), 400

    #expire = datetime.timedelta(days=3)

    #print(expire)

    access_token  = create_access_token(identity=user.email)

    data ={
        "access_token":access_token,
        "user": user.serialize()

    }

    return jsonify(data), 200


@app.route('/api/users',methods=['GET'])
@jwt_required()
def users():
    users = User.query.all()
    users = list(map(lambda user: user.serialize(), users))
    return jsonify(users), 200

@app.route('/api/private', methods=['GET'])
@jwt_required()
def private():
    identity = get_jwt_identity()
    user = User.query.filter_by(email=identity).first()
    return jsonify({"identity":identity, "user": user.serialize}), 200

# this only runs if `$ python src/main.py` is executed
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)
