// Shopping cart functionality

// Get cart from localStorage
function getCart() {
    try {
        const cart = localStorage.getItem('futopizza_cart');
        return cart ? JSON.parse(cart) : [];
    } catch (error) {
        console.error('Error loading cart:', error);
        return [];
    }
}

// Save cart to localStorage
function saveCart(cart) {
    try {
        localStorage.setItem('futopizza_cart', JSON.stringify(cart));
        updateCartDisplay();
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

// Add item to cart
function addToCart(id, name, price) {
    const cart = getCart();
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: id,
            name: name,
            price: price,
            quantity: 1
        });
    }
    
    saveCart(cart);
    showMessage(`${name} added to cart!`, 'success');
}

// Remove item from cart
function removeFromCart(id) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== id);
    saveCart(updatedCart);
    
    // Update cart display if modal is open
    const cartModal = document.getElementById('cartModal');
    if (cartModal && cartModal.classList.contains('show')) {
        updateCartDisplay();
    }
}

// Update item quantity
function updateQuantity(id, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(id);
        return;
    }
    
    const cart = getCart();
    const item = cart.find(item => item.id === id);
    
    if (item) {
        item.quantity = newQuantity;
        saveCart(cart);
        
        // Update cart display if modal is open
        const cartModal = document.getElementById('cartModal');
        if (cartModal && cartModal.classList.contains('show')) {
            updateCartDisplay();
        }
    }
}

// Clear entire cart
function clearCart() {
    localStorage.removeItem('futopizza_cart');
    updateCartDisplay();
}

// Get cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Get cart item count
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
}

// Update cart display (badges, modal content)
function updateCartDisplay() {
    const cart = getCart();
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count badge
    if (cartCount) {
        const totalItems = getCartItemCount();
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'inline' : 'none';
    }
    
    // Update cart items in modal
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center py-4">
                    <i class="bi bi-cart-x display-1 text-muted"></i>
                    <p class="text-muted mt-2">Your cart is empty</p>
                    <a href="menu.html" class="btn btn-primary">Browse Menu</a>
                </div>
            `;
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item d-flex justify-content-between align-items-center mb-3 p-3 border rounded">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${item.name}</h6>
                        <small class="text-muted">₦${item.price.toLocaleString()} each</small>
                    </div>
                    <div class="d-flex align-items-center">
                        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity('${item.id}', ${item.quantity - 1})" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="bi bi-dash"></i>
                        </button>
                        <span class="mx-3 fw-bold">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">
                            <i class="bi bi-plus"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger ms-3" onclick="removeFromCart('${item.id}')" title="Remove item">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                    <div class="ms-3 text-end">
                        <strong>₦${(item.price * item.quantity).toLocaleString()}</strong>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Update cart total
    if (cartTotal) {
        const total = getCartTotal();
        cartTotal.textContent = total.toLocaleString();
    }
    
    // Update checkout modal if it exists
    updateCheckoutDisplay();
}

// Update checkout display
function updateCheckoutDisplay() {
    const cart = getCart();
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    if (checkoutItems) {
        checkoutItems.innerHTML = cart.map(item => `
            <div class="d-flex justify-content-between align-items-center mb-2 p-2 border-bottom">
                <div>
                    <strong>${item.name}</strong><br>
                    <small class="text-muted">₦${item.price.toLocaleString()} x ${item.quantity}</small>
                </div>
                <div class="text-end">
                    <strong>₦${(item.price * item.quantity).toLocaleString()}</strong>
                </div>
            </div>
        `).join('');
    }
    
    if (checkoutTotal) {
        const total = getCartTotal();
        checkoutTotal.textContent = total.toLocaleString();
    }
}

// Cart persistence across page loads
document.addEventListener('DOMContentLoaded', function() {
    updateCartDisplay();
});

// Listen for storage changes (cart updates from other tabs)
window.addEventListener('storage', function(e) {
    if (e.key === 'futopizza_cart') {
        updateCartDisplay();
    }
});

// Export functions to global scope
window.getCart = getCart;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.clearCart = clearCart;
window.getCartTotal = getCartTotal;
window.getCartItemCount = getCartItemCount;
window.updateCartDisplay = updateCartDisplay;

// Quick add to cart with confirmation
function quickAddToCart(id, name, price) {
    addToCart(id, name, price);
    
    // Show quick notification
    const notification = document.createElement('div');
    notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
    notification.style.cssText = 'top: 80px; right: 20px; z-index: 1060; min-width: 300px;';
    notification.innerHTML = `
        <strong>${name}</strong> added to cart!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Export quick add function
window.quickAddToCart = quickAddToCart;