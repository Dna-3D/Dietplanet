// Theme management
let currentTheme = localStorage.getItem('theme') || 'light';

function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) {
        themeIcon.className = currentTheme === 'light' ? 'bi bi-moon-fill' : 'bi bi-sun-fill';
    }
}

// Authentication state management
var authInitialized = false;

function updateAuthUI() {
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        if (currentUser) {
            loginBtn.textContent = 'Logout';
            loginBtn.onclick = logout;
        } else {
            loginBtn.textContent = 'Login';
            loginBtn.onclick = showAuth;
        }
    }
}

function showAuth() {
    window.location.href = 'auth.html';
}

function logout() {
    if (window.signOutUser) {
        window.signOutUser().then((result) => {
            if (result.success) {
                currentUser = null;
                updateAuthUI();
                showMessage('Logged out successfully', 'success');
            } else {
                showMessage('Error logging out', 'danger');
            }
        });
    } else {
        currentUser = null;
        localStorage.removeItem('user');
        updateAuthUI();
        showMessage('Logged out successfully', 'success');
    }
}

// Cart functionality
function toggleCart() {
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    updateCartDisplay();
    cartModal.show();
}

function proceedToCheckout() {
    const cart = getCart();
    if (cart.length === 0) {
        showMessage('Your cart is empty', 'warning');
        return;
    }
    
    if (!currentUser) {
        showMessage('Please login to proceed with checkout', 'info');
        showAuth();
        return;
    }
    
    // Hide cart modal and show checkout modal
    const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
    if (cartModal) {
        cartModal.hide();
    }
    
    setTimeout(() => {
        showCheckoutModal();
    }, 500);
}

function showCheckoutModal() {
    const cart = getCart();
    updateCheckoutDisplay();
    
    const checkoutModal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    checkoutModal.show();
}

function payOnDelivery() {
    const cart = getCart();
    const address = document.getElementById('delivery-address')?.value;
    const phone = document.getElementById('phone-number')?.value;
    
    if (!address || !phone) {
        showMessage('Please fill in delivery address and phone number', 'warning');
        return;
    }
    
    const orderDetails = cart.map(item => `${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}`).join('\n');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const customerInfo = currentUser?.email || 'Guest';
    const message = `New Order - Pay on Delivery\n\nCustomer: ${customerInfo}\nPhone: ${phone}\nAddress: ${address}\n\nOrder Details:\n${orderDetails}\n\nTotal: ₦${total.toLocaleString()}`;
    
    const whatsappUrl = `https://wa.me/2349135371742?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    clearCart();
    showMessage('Order sent! We will contact you shortly.', 'success');
    
    const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
    if (checkoutModal) {
        checkoutModal.hide();
    }
}

function payThroughWhatsApp() {
    const cart = getCart();
    const address = document.getElementById('delivery-address')?.value;
    const phone = document.getElementById('phone-number')?.value;
    
    if (!address || !phone) {
        showMessage('Please fill in delivery address and phone number', 'warning');
        return;
    }
    
    const orderDetails = cart.map(item => `${item.name} x${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}`).join('\n');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const customerInfo = currentUser?.email || 'Guest';
    const message = `New Order - Pay via WhatsApp\n\nCustomer: ${customerInfo}\nPhone: ${phone}\nAddress: ${address}\n\nOrder Details:\n${orderDetails}\n\nTotal: ₦${total.toLocaleString()}\n\nPlease send payment details for this order.`;
    
    const whatsappUrl = `https://wa.me/2349135371742?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    clearCart();
    showMessage('Order sent! Please follow payment instructions.', 'success');
    
    const checkoutModal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
    if (checkoutModal) {
        checkoutModal.hide();
    }
}

// Notification system
function showMessage(message, type = 'info') {
    createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `alert alert-${getBootstrapType(type)} alert-dismissible fade show toast-notification`;
    toast.style.cssText = 'position: fixed; top: 80px; right: 20px; z-index: 1060; min-width: 300px; max-width: 400px;';
    
    toast.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi ${getIcon(type)} me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, 5000);
}

function getBootstrapType(type) {
    const typeMap = {
        'success': 'success',
        'error': 'danger',
        'warning': 'warning',
        'info': 'info'
    };
    return typeMap[type] || 'info';
}

function getIcon(type) {
    const iconMap = {
        'success': 'bi-check-circle-fill',
        'error': 'bi-exclamation-triangle-fill',
        'warning': 'bi-exclamation-triangle-fill',
        'info': 'bi-info-circle-fill'
    };
    return iconMap[type] || 'bi-info-circle-fill';
}

function createToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; top: 0; right: 0; z-index: 1060; padding: 20px;';
        document.body.appendChild(container);
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme
    initializeTheme();
    
    // Setup theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Load user from localStorage
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateAuthUI();
        } catch (error) {
            console.error('Error loading saved user:', error);
            localStorage.removeItem('user');
        }
    }
    
    // Initialize cart display
    if (typeof updateCartDisplay === 'function') {
        updateCartDisplay();
    }
    
    // Create toast container
    createToastContainer();
    
    console.log('Diet Planet website initialized successfully');
});

// Auth page specific functions
function initializeAuthPage() {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupBtn = document.getElementById('show-signup');
    const showLoginBtn = document.getElementById('show-login');
    const googleSigninBtn = document.getElementById('google-signin-btn');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }
    
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', function() {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
            showSignupBtn.style.display = 'none';
        });
    }
    
    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', function() {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
            showSignupBtn.style.display = 'block';
        });
    }
    
    if (googleSigninBtn) {
        googleSigninBtn.addEventListener('click', handleGoogleSignin);
    }
    
    console.log('Auth page initialized');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        showAuthMessage('Please fill in all fields', 'danger');
        return;
    }
    
    // Use Firebase auth if available
    if (window.signInWithEmail) {
        window.signInWithEmail(email, password).then((result) => {
            if (result.success) {
                currentUser = result.user;
                showAuthMessage('Login successful!', 'success');
                setTimeout(() => {
                    const cart = getCart ? getCart() : [];
                    if (cart.length > 0) {
                        window.location.href = 'index.html#checkout';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            } else {
                showAuthMessage(result.error, 'danger');
            }
        });
    } else {
        // Fallback authentication
        currentUser = {
            uid: 'demo_' + Date.now(),
            email: email,
            name: email.split('@')[0]
        };
        localStorage.setItem('user', JSON.stringify(currentUser));
        showAuthMessage('Login successful!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const phone = document.getElementById('signup-phone')?.value;
    
    if (!name || !email || !password) {
        showAuthMessage('Please fill in all required fields', 'danger');
        return;
    }
    
    // Use Firebase auth if available
    if (window.createAccountWithEmail) {
        window.createAccountWithEmail(email, password, name).then((result) => {
            if (result.success) {
                currentUser = result.user;
                showAuthMessage('Account created successfully!', 'success');
                setTimeout(() => {
                    const cart = getCart ? getCart() : [];
                    if (cart.length > 0) {
                        window.location.href = 'index.html#checkout';
                    } else {
                        window.location.href = 'index.html';
                    }
                }, 1500);
            } else {
                showAuthMessage(result.error, 'danger');
            }
        });
    } else {
        // Fallback authentication
        currentUser = {
            uid: 'demo_' + Date.now(),
            email: email,
            name: name,
            phone: phone
        };
        localStorage.setItem('user', JSON.stringify(currentUser));
        showAuthMessage('Account created successfully!', 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    }
}

function handleGoogleSignin() {
    if (window.loginWithGoogle) {
        window.loginWithGoogle();
    } else {
        showAuthMessage('Google sign-in not available', 'warning');
    }
}

function showAuthMessage(message, type) {
    const messagesContainer = document.getElementById('auth-messages');
    if (messagesContainer) {
        messagesContainer.innerHTML = `
            <div class="alert alert-${getBootstrapType(type)} alert-dismissible fade show">
                <i class="bi ${getIcon(type)} me-2"></i>
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
    }
}

// Check if on auth page and initialize
if (window.location.pathname.includes('auth.html')) {
    document.addEventListener('DOMContentLoaded', initializeAuthPage);
}

// Export functions to global scope
window.showMessage = showMessage;
window.toggleCart = toggleCart;
window.proceedToCheckout = proceedToCheckout;
window.payOnDelivery = payOnDelivery;
window.payThroughWhatsApp = payThroughWhatsApp;
window.showAuth = showAuth;
window.logout = logout;