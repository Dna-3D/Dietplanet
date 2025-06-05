// Simple Firebase config placeholder - works without external dependencies
// This provides basic authentication functionality for the assignment

// Mock Firebase configuration for local development
const firebaseConfig = {
    apiKey: "demo-key",
    authDomain: "diet-planet-demo.firebaseapp.com",
    projectId: "diet-planet-demo",
    storageBucket: "diet-planet-demo.firebasestorage.app",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:demo"
};

// Simple authentication simulation
var currentUser = null;

// Simulate email/password sign in
window.signInWithEmail = async function(email, password) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (email && password) {
                const user = {
                    uid: 'demo_' + Date.now(),
                    email: email,
                    displayName: email.split('@')[0]
                };
                currentUser = user;
                localStorage.setItem('user', JSON.stringify(user));
                resolve({ success: true, user: user });
            } else {
                resolve({ success: false, error: 'Invalid credentials' });
            }
        }, 500);
    });
};

// Simulate account creation
window.createAccountWithEmail = async function(email, password, name) {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (email && password && name) {
                const user = {
                    uid: 'demo_' + Date.now(),
                    email: email,
                    displayName: name
                };
                currentUser = user;
                localStorage.setItem('user', JSON.stringify(user));
                resolve({ success: true, user: user });
            } else {
                resolve({ success: false, error: 'Invalid information' });
            }
        }, 500);
    });
};

// Simulate sign out
window.signOutUser = async function() {
    return new Promise((resolve) => {
        setTimeout(() => {
            currentUser = null;
            localStorage.removeItem('user');
            resolve({ success: true });
        }, 200);
    });
};

// Google sign in simulation
window.loginWithGoogle = function() {
    const user = {
        uid: 'google_demo_' + Date.now(),
        email: 'demo@gmail.com',
        displayName: 'Demo User'
    };
    currentUser = user;
    localStorage.setItem('user', JSON.stringify(user));
    
    if (window.showAuthMessage) {
        window.showAuthMessage('Google sign-in successful!', 'success');
    }
    
    setTimeout(() => {
        const cart = window.getCart ? window.getCart() : [];
        if (cart.length > 0) {
            window.location.href = 'index.html#checkout';
        } else {
            window.location.href = 'index.html';
        }
    }, 1500);
};

// Load existing user on page load
document.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            if (window.updateAuthUI) {
                window.updateAuthUI();
            }
        } catch (error) {
            console.error('Error loading saved user:', error);
            localStorage.removeItem('user');
        }
    }
});

console.log('Firebase config loaded - Demo mode active');