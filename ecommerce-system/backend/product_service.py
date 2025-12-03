from flask import Flask, jsonify, request
from flask_cors import CORS
import json
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory database
products_db = [
    {"id": 1, "name": "T-shirt", "price": 499, "category": "clothing", "rating": 95},
    {"id": 2, "name": "Shoes", "price": 1299, "category": "shoes", "rating": 92},
    {"id": 3, "name": "Watch", "price": 899, "category": "accessories", "rating": 98},
    {"id": 4, "name": "Jacket", "price": 1999, "category": "clothing", "rating": 89},
    {"id": 5, "name": "Sneakers", "price": 1599, "category": "shoes", "rating": 94},
    {"id": 6, "name": "Sunglasses", "price": 799, "category": "accessories", "rating": 91},
    {"id": 7, "name": "Jeans", "price": 1199, "category": "clothing", "rating": 88},
    {"id": 8, "name": "Boots", "price": 1899, "category": "shoes", "rating": 96},
]

@app.route('/api/products', methods=['GET'])
def get_products():
    """Get all products"""
    return jsonify({
        "success": True,
        "products": products_db
    })

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get single product"""
    product = next((p for p in products_db if p['id'] == product_id), None)
    if product:
        return jsonify({"success": True, "product": product})
    return jsonify({"success": False, "message": "Product not found"}), 404

@app.route('/api/products', methods=['POST'])
def create_product():
    """Create new product"""
    data = request.json
    new_id = max([p['id'] for p in products_db]) + 1 if products_db else 1
    product = {
        "id": new_id,
        "name": data.get('name'),
        "price": data.get('price'),
        "category": data.get('category'),
        "rating": data.get('rating', 85)
    }
    products_db.append(product)
    return jsonify({"success": True, "product": product}), 201

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update product"""
    product = next((p for p in products_db if p['id'] == product_id), None)
    if not product:
        return jsonify({"success": False, "message": "Product not found"}), 404
    
    data = request.json
    product.update(data)
    return jsonify({"success": True, "product": product})

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete product"""
    global products_db
    products_db = [p for p in products_db if p['id'] != product_id]
    return jsonify({"success": True})

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({"status": "Product Service is healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=False)
