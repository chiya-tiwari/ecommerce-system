from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory database
orders_db = []
next_order_id = 1

@app.route('/api/orders/create', methods=['POST'])
def create_order():
    """Create new order"""
    global next_order_id
    data = request.json
    
    if not data.get('userId') or not data.get('items'):
        return jsonify({"success": False, "message": "Invalid order data"}), 400
    
    order = {
        "id": next_order_id,
        "userId": data['userId'],
        "items": data['items'],
        "subtotal": data.get('subtotal', 0),
        "tax": data.get('tax', 0),
        "total": data.get('total', 0),
        "status": "pending",
        "date": datetime.now().isoformat(),
        "createdAt": datetime.now().isoformat()
    }
    
    orders_db.append(order)
    next_order_id += 1
    
    return jsonify({
        "success": True,
        "message": "Order created successfully",
        "order": order
    }), 201

@app.route('/api/orders/user/<int:user_id>', methods=['GET'])
def get_user_orders(user_id):
    """Get orders for user"""
    user_orders = [o for o in orders_db if o['userId'] == user_id]
    
    return jsonify({
        "success": True,
        "orders": user_orders
    })

@app.route('/api/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get single order"""
    order = next((o for o in orders_db if o['id'] == order_id), None)
    
    if not order:
        return jsonify({"success": False, "message": "Order not found"}), 404
    
    return jsonify({
        "success": True,
        "order": order
    })

@app.route('/api/orders/<int:order_id>', methods=['PUT'])
def update_order(order_id):
    """Update order status"""
    order = next((o for o in orders_db if o['id'] == order_id), None)
    
    if not order:
        return jsonify({"success": False, "message": "Order not found"}), 404
    
    data = request.json
    if 'status' in data:
        order['status'] = data['status']
    
    return jsonify({
        "success": True,
        "order": order
    })

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def cancel_order(order_id):
    """Cancel order"""
    global orders_db
    order = next((o for o in orders_db if o['id'] == order_id), None)
    
    if not order:
        return jsonify({"success": False, "message": "Order not found"}), 404
    
    if order['status'] != 'pending':
        return jsonify({"success": False, "message": "Cannot cancel non-pending order"}), 400
    
    orders_db = [o for o in orders_db if o['id'] != order_id]
    
    return jsonify({"success": True, "message": "Order cancelled"})

@app.route('/api/orders', methods=['GET'])
def get_all_orders():
    """Get all orders"""
    return jsonify({
        "success": True,
        "orders": orders_db
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({"status": "Order Service is healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=False)
