// Configuration
const API_BASE = 'http://localhost:5000';
const PRODUCT_SERVICE = `${API_BASE}/api/products`;
const ORDER_SERVICE = `${API_BASE}/api/orders`;
const USER_SERVICE = `${API_BASE}/api/users`;

// State Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isLoginMode = true;
let allProducts = [];

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    updateCartUI();
    setupEventListeners();
    updateAccountUI();
});

// Event Listeners Setup
function setupEventListeners() {
    // Auth Modal
    document.querySelector('.close').onclick = () => closeAuthModal();
    document.getElementById('authForm').onsubmit = handleAuth;
    
    // Search and Filter
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    
    // Mobile Menu
    document.querySelector('.hamburger').addEventListener('click', toggleMobileMenu);
}

// ==================== PRODUCTS ====================

async function loadProducts() {
    try {
        const response = await fetch(`${PRODUCT_SERVICE}`);
        const data = await response.json();
        
        if (data.success) {
            allProducts = data.products;
            displayProducts(allProducts);
        } else {
            showNotification('Failed to load products', 'error');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error loading products', 'error');
    }
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<div class="empty-message">No products found</div>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">${getProductEmoji(product.category)}</div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <div class="product-name">${product.name}</div>
                <div class="product-rating">★★★★★ (${product.rating || 100})</div>
                <div class="product-price">₹${product.price}</div>
                <div class="product-actions">
                    <button class="btn-add-cart" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    let filtered = allProducts;
    
    if (searchTerm) {
        filtered = filtered.filter(p => p.name.toLowerCase().includes(searchTerm));
    }
    
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }
    
    displayProducts(filtered);
}

function getProductEmoji(category) {
    const emojis = {
        'clothing': '👕',
        'shoes': '👟',
        'accessories': '⌚',
        'default': '🎁'
    };
    return emojis[category] || emojis['default'];
}

// ==================== CART ====================

function addToCart(id, name, price) {
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id, name, price, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
    showNotification(`${name} added to cart!`, 'success');
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

function updateQuantity(id, change) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(id);
        } else {
            saveCart();
            updateCartUI();
        }
    }
}

function updateCartUI() {
    // Update cart count
    document.getElementById('cart-count').textContent = `(${cart.length})`;
    
    // Update cart items
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-message">Your cart is empty</div>';
        document.getElementById('subtotal').textContent = '₹0';
        document.getElementById('tax').textContent = '₹0';
        document.getElementById('total').textContent = '₹0';
        return;
    }
    
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">₹${item.price}</div>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div>₹${item.price * item.quantity}</div>
            <button class="btn-remove" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');
    
    // Update totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = Math.round(subtotal * 0.1);
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = `₹${subtotal}`;
    document.getElementById('tax').textContent = `₹${tax}`;
    document.getElementById('total').textContent = `₹${total}`;
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

async function checkout() {
    if (!currentUser) {
        loginClick();
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    try {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = Math.round(subtotal * 0.1);
        const total = subtotal + tax;
        
        const orderData = {
            userId: currentUser.id,
            items: cart,
            subtotal,
            tax,
            total,
            status: 'pending'
        };
        
        const response = await fetch(`${ORDER_SERVICE}/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            cart = [];
            saveCart();
            updateCartUI();
            loadOrders();
            showNotification('Order placed successfully!', 'success');
            scrollToSection('orders');
        } else {
            showNotification('Order failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Checkout error:', error);
        showNotification('Error processing order', 'error');
    }
}

// ==================== AUTHENTICATION ====================

function loginClick() {
    document.getElementById('authModal').style.display = 'block';
    isLoginMode = true;
    document.getElementById('authTitle').textContent = 'Login';
    document.getElementById('authToggle').innerHTML = "Don't have account? <a href='#' onclick='toggleAuthMode()'>Sign Up</a>";
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').textContent = isLoginMode ? 'Login' : 'Sign Up';
    document.getElementById('authToggle').innerHTML = isLoginMode 
        ? "Don't have account? <a href='#' onclick='toggleAuthMode()'>Sign Up</a>"
        : "Already have account? <a href='#' onclick='toggleAuthMode()'>Login</a>";
}

async function handleAuth(e) {
    e.preventDefault();
    
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    
    if (!email || !password) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    try {
        const endpoint = isLoginMode ? 'login' : 'register';
        const response = await fetch(`${USER_SERVICE}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            closeAuthModal();
            updateAccountUI();
            loadOrders();
            showNotification(isLoginMode ? 'Logged in successfully!' : 'Account created!', 'success');
            document.getElementById('authForm').reset();
        } else {
            showNotification(result.message || 'Authentication failed', 'error');
        }
    } catch (error) {
        console.error('Auth error:', error);
        showNotification('Authentication error', 'error');
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAccountUI();
    cart = [];
    saveCart();
    updateCartUI();
    showNotification('Logged out successfully', 'success');
}

function updateAccountUI() {
    const accountContent = document.getElementById('accountContent');
    
    if (currentUser) {
        accountContent.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar">👤</div>
                <div class="user-info">
                    <div style="font-weight: bold; font-size: 1.1rem;">${currentUser.name || 'User'}</div>
                    <div class="user-email">${currentUser.email}</div>
                </div>
                <button class="btn-primary btn-logout" onclick="logout()">Logout</button>
            </div>
        `;
    } else {
        accountContent.innerHTML = '<button class="btn-primary" onclick="loginClick()">Login / Sign Up</button>';
    }
}

// ==================== ORDERS ====================

async function loadOrders() {
    if (!currentUser) {
        document.getElementById('ordersContainer').innerHTML = 
            '<div class="empty-message">Please login to view orders</div>';
        return;
    }
    
    try {
        const response = await fetch(`${ORDER_SERVICE}/user/${currentUser.id}`);
        const data = await response.json();
        
        if (data.success && data.orders.length > 0) {
            displayOrders(data.orders);
        } else {
            document.getElementById('ordersContainer').innerHTML = 
                '<div class="empty-message">No orders yet. <a href="#products">Start shopping!</a></div>';
        }
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function displayOrders(orders) {
    const container = document.getElementById('ordersContainer');
    
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-id">Order #${order.id}</div>
            <div class="order-date">${new Date(order.date || Date.now()).toLocaleDateString()}</div>
            <div class="order-status status-${order.status}">${order.status.toUpperCase()}</div>
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        ${item.name} x${item.quantity} - ₹${item.price * item.quantity}
                    </div>
                `).join('')}
            </div>
            <div class="order-total">Total: ₹${order.total}</div>
        </div>
    `).join('');
}

// ==================== UTILITIES ====================

function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification show ${type}`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.style.display = navMenu.style.display === 'block' ? 'none' : 'block';
}

// Smooth scroll on page load
window.addEventListener('click', (event) => {
    const modal = document.getElementById('authModal');
    if (event.target === modal) {
        closeAuthModal();
    }
});

