from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime
import hashlib

app = Flask(__name__)
CORS(app)

# In-memory database
users_db = []
next_user_id = 1

def hash_password(password):
    """Simple password hashing"""
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/api/users/register', methods=['POST'])
def register():
    """Register new user"""
    global next_user_id
    data = request.json
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400
    
    # Check if user exists
    if any(u['email'] == email for u in users_db):
        return jsonify({"success": False, "message": "User already exists"}), 409
    
    user = {
        "id": next_user_id,
        "email": email,
        "password": hash_password(password),
        "name": email.split('@')[0],
        "created_at": datetime.now().isoformat()
    }
    
    users_db.append(user)
    next_user_id += 1
    
    return jsonify({
        "success": True,
        "message": "User created successfully",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name']
        }
    }), 201

@app.route('/api/users/login', methods=['POST'])
def login():
    """User login"""
    data = request.json
    
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"success": False, "message": "Email and password required"}), 400
    
    user = next((u for u in users_db if u['email'] == email), None)
    
    if not user or user['password'] != hash_password(password):
        return jsonify({"success": False, "message": "Invalid credentials"}), 401
    
    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name']
        }
    })

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get user details"""
    user = next((u for u in users_db if u['id'] == user_id), None)
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    return jsonify({
        "success": True,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name']
        }
    })

@app.route('/api/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    """Update user"""
    user = next((u for u in users_db if u['id'] == user_id), None)
    
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404
    
    data = request.json
    if 'name' in data:
        user['name'] = data['name']
    if 'password' in data:
        user['password'] = hash_password(data['password'])
    
    return jsonify({
        "success": True,
        "user": {
            "id": user['id'],
            "email": user['email'],
            "name": user['name']
        }
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({"status": "User Service is healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)
