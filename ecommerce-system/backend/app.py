from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

ENV = os.getenv('FLASK_ENV', 'production')

if ENV == 'production':
    PRODUCT_SERVICE = 'http://product-service:5001'
    USER_SERVICE = 'http://user-service:5002'
    ORDER_SERVICE = 'http://order-service:5003'
else:
    PRODUCT_SERVICE = 'http://localhost:5001'
    USER_SERVICE = 'http://localhost:5002'
    ORDER_SERVICE = 'http://localhost:5003'

@app.route('/')
def home():
    return jsonify({"message": "API Gateway", "services": {"products": "/api/products", "users": "/api/users", "orders": "/api/orders"}})

@app.route('/api/products')
def get_products():
    try:
        resp = requests.get(f'{PRODUCT_SERVICE}/api/products', timeout=5)
        return resp.json()
    except:
        return {"success": False, "error": "Service unavailable"}, 503

@app.route('/api/users/login', methods=['POST'])
def login():
    try:
        resp = requests.post(f'{USER_SERVICE}/api/users/login', json=request.json, timeout=5)
        return resp.json()
    except:
        return {"success": False, "error": "Service unavailable"}, 503

@app.route('/api/users/register', methods=['POST'])
def register():
    try:
        resp = requests.post(f'{USER_SERVICE}/api/users/register', json=request.json, timeout=5)
        return resp.json()
    except:
        return {"success": False, "error": "Service unavailable"}, 503

@app.route('/api/users/<int:user_id>')
def get_user(user_id):
    try:
        resp = requests.get(f'{USER_SERVICE}/api/users/{user_id}', timeout=5)
        return resp.json()
    except:
        return {"success": False, "error": "Service unavailable"}, 503

@app.route('/api/orders/create', methods=['POST'])
def create_order():
    try:
        resp = requests.post(f'{ORDER_SERVICE}/api/orders/create', json=request.json, timeout=5)
        return resp.json()
    except:
        return {"success": False, "error": "Service unavailable"}, 503

@app.route('/api/orders/user/<int:user_id>')
def get_user_orders(user_id):
    try:
        resp = requests.get(f'{ORDER_SERVICE}/api/orders/user/{user_id}', timeout=5)
        return resp.json()
    except:
        return {"success": False, "error": "Service unavailable"}, 503

@app.route('/api/orders/<int:order_id>')
def get_order(order_id):
    try:
        resp = requests.get(f'{ORDER_SERVICE}/api/orders/{order_id}', timeout=5)
        return resp.json()
    except:
        return {"success": False, "error": "Service unavailable"}, 503

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, use_reloader=False)
