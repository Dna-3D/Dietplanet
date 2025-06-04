// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // --- Firebase Configuration ---
    const firebaseConfig = {
        apiKey: "AIzaSyBYGSztBT2Rabu4d-qJoHgGi2oy2lb3-Ww",
        authDomain: "diet-planet-b76c0.firebaseapp.com",
        projectId: "diet-planet-b76c0",
        storageBucket: "diet-planet-b76c0.appspot.com",
        messagingSenderId: "320397699105",
        appId: "1:320397699105:web:3a70a5916e547ce5155b60"
    };
    // Initialize Firebase
    firebase.initializeApp(firebaseConfig); // SDKs are now in HTML
    const auth = firebase.auth();           // SDKs are now in HTML
    const db = firebase.firestore();        // SDKs are now in HTML

    console.log("Dietplanet script loaded. Firebase initialized.");

    // --- Global Variables & State ---
    let cart = [];
    let products = [ // Sample products, will be replaced by Firebase data
        { id: "1", name: "Pizza Margherita", description: "Classic cheese and tomato pizza.", price: 15000.00, imageUrl: "https://via.placeholder.com/300x200?text=Pizza+Margherita" },
        { id: "2", name: "Pepperoni Pizza", description: "Loaded with pepperoni.", price: 18000.00, imageUrl: "https://via.placeholder.com/300x200?text=Pepperoni+Pizza" },
        { id: "3", name: "Chicken Snack Box", description: "Crispy chicken pieces with dip.", price: 12000.00, imageUrl: "https://via.placeholder.com/300x200?text=Chicken+Snack+Box" }
    ];
    let carouselSlidesData = [ // Sample slides, will be replaced by Firebase data
        { imageUrl: "https://via.placeholder.com/1200x400?text=Delicious+Pizza+Offer", altText: "Ad 1", link: "#" },
        { imageUrl: "https://via.placeholder.com/1200x400?text=Tasty+Snacks+Here", altText: "Ad 2", link: "#" }
    ];
    let currentUser = null; // To store logged-in user info
    let isAdmin = false; // To check if current user is admin

    // --- UI Elements (Common) ---
    const loginLink = document.getElementById('login-link');
    const adminLink = document.getElementById('admin-link'); // For customer page
    const authModal = document.getElementById('auth-modal');
    const authCloseBtn = document.getElementById('auth-close-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignupLink = document.getElementById('show-signup');
    const showLoginLink = document.getElementById('show-login');
    const checkoutInfoModal = document.getElementById('checkout-info-modal');
    const checkoutInfoCloseBtn = document.getElementById('checkout-info-close-btn');
    const themeToggle = document.getElementById('theme-toggle');


    // --- Theme Toggle Logic ---
    function applyTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.body.classList.remove('light-mode');
            if (themeToggle) themeToggle.checked = false;
        }
    }

    function toggleTheme() {
        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('dietplanetTheme', 'dark');
            applyTheme('dark');
        } else {
            localStorage.setItem('dietplanetTheme', 'light');
            applyTheme('light');
        }
    }

    if (themeToggle) {
        themeToggle.addEventListener('change', toggleTheme);
    }

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('dietplanetTheme') || 'dark'; // Default to dark
    applyTheme(savedTheme);
document.addEventListener('DOMContentLoaded', () => {
    // ... (Your existing theme switcher, carousel, etc. code) ...

    // Hamburger Menu Toggle
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const navList = document.getElementById('nav-list'); // The ID we added to the <ul>

    if (hamburgerMenu && navList) {
        hamburgerMenu.addEventListener('click', () => {
            navList.classList.toggle('active'); // Toggles the 'active' class on the ul
            hamburgerMenu.classList.toggle('open'); // Toggles 'open' for hamburger animation
            // Optional: Prevent body scrolling when menu is open
            document.body.classList.toggle('no-scroll');
        });

        // Optional: Close mobile menu when a navigation link is clicked
        navList.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navList.classList.remove('active');
                hamburgerMenu.classList.remove('open');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // Optional: Add CSS for no-scroll to style.css
    // body.no-scroll {
    //     overflow: hidden;
    // }

    // ... (Rest of your existing script.js code) ...
});

    // --- Customer Page Specific UI & Logic ---
    if (document.body.contains(document.getElementById('product-list'))) { // Changed from product-grid
        const cartCountEl = document.getElementById('cart-count');
        const productListEl = document.getElementById('product-list'); // Changed from productGrid
        const cartItemsEl = document.getElementById('cart-items');
        const cartTotalEl = document.getElementById('cart-total');
        const checkoutBtn = document.getElementById('checkout-btn');
        const carouselBanner = document.querySelector('.carousel-banner');
        let currentSlideIndex = 0;

        // Carousel Logic
        function renderCarousel() {
            if (!carouselBanner) return;
            carouselBanner.innerHTML = ''; // Clear existing
            carouselSlidesData.forEach((slide, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.classList.add('carousel-slide');
                if (index === 0) slideDiv.classList.add('active');
                const img = document.createElement('img');
                img.src = slide.imageUrl;
                img.alt = slide.altText;
                if (slide.link && slide.link !== "#") {
                    const anchor = document.createElement('a');
                    anchor.href = slide.link;
                    anchor.appendChild(img);
                    slideDiv.appendChild(anchor);
                } else {
                    slideDiv.appendChild(img);
                }
                carouselBanner.appendChild(slideDiv);
            });

            if (carouselSlidesData.length > 1) {
                const prevButton = document.createElement('button');
                prevButton.classList.add('carousel-control', 'prev');
                prevButton.innerHTML = '<';
                prevButton.addEventListener('click', () => navigateCarousel(-1));
                carouselBanner.appendChild(prevButton);

                const nextButton = document.createElement('button');
                nextButton.classList.add('carousel-control', 'next');
                nextButton.innerHTML = '>';
                nextButton.addEventListener('click', () => navigateCarousel(1));
                carouselBanner.appendChild(nextButton);
                showSlide(currentSlideIndex);
            } else if (carouselSlidesData.length === 1) {
                 showSlide(0); // Show the single slide
            }
        }

        function showSlide(index) {
            const slides = carouselBanner.querySelectorAll('.carousel-slide');
            if (!slides || slides.length === 0) return;
            slides.forEach(s => s.classList.remove('active'));
            slides[index].classList.add('active');
        }

        function navigateCarousel(direction) {
            const slides = carouselBanner.querySelectorAll('.carousel-slide');
            currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
            showSlide(currentSlideIndex);
        }
        // Auto-play carousel (optional)
        // setInterval(() => navigateCarousel(1), 5000);


        // Product Listing Logic
        function renderProducts() {
            if (!productListEl) return;
            productListEl.innerHTML = ''; // Clear existing products
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.classList.add('product-item');
                productDiv.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <div class="product-details">
                        <h3>${product.name}</h3>
                        <p>${product.description}</p>
                        <p class="price">₦${product.price.toFixed(2)}</p>
                        <div class="product-actions">
                            <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                            <button class="whatsapp-order-btn" data-name="${product.name}" data-price="${product.price.toFixed(2)}">Order via WhatsApp</button>
                        </div>
                    </div>
                `;
                productListEl.appendChild(productDiv);
            });

            // Add event listeners to new buttons
            document.querySelectorAll('.add-to-cart-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productId = e.target.dataset.id;
                    addToCart(productId);
                });
            });
            document.querySelectorAll('.whatsapp-order-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const productName = e.target.dataset.name;
                    const productPrice = e.target.dataset.price;
                    const message = `Hi Dietplanet, I'd like to order ${productName} (₦${productPrice}).`; // Naira symbol
                    window.open(`https://wa.me/2349135371742?text=${encodeURIComponent(message)}`, '_blank');
                });
            });
        }

        // Cart Logic
        function addToCart(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;

            const cartItem = cart.find(item => item.id === productId);
            if (cartItem) {
                cartItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            updateCartDisplay();
            // TODO: Persist cart (e.g., localStorage or Firebase for logged-in users)
            console.log("Cart:", cart);
        }

        function updateCartDisplay() {
            if (!cartItemsEl || !cartCountEl || !cartTotalEl) return;

            cartCountEl.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
            if (cart.length === 0) {
                cartItemsEl.innerHTML = '<p>Your cart is empty.</p>';
                cartTotalEl.textContent = '0.00';
                return;
            }

            cartItemsEl.innerHTML = '';
            let total = 0;
            cart.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('cart-item');
                itemDiv.innerHTML = `
                    <span>${item.name} (x${item.quantity})</span>
                    <span>₦${(item.price * item.quantity).toFixed(2)}</span>
                `;
                // TODO: Add remove from cart button
                cartItemsEl.appendChild(itemDiv);
                total += item.price * item.quantity;
            });
            cartTotalEl.textContent = total.toFixed(2);
        }

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (cart.length === 0) {
                    alert("Your cart is empty. Please add items to your cart before proceeding to checkout.");
                    return;
                }
                if (currentUser) {
                    openCheckoutInfoModal();
                } else {
                    alert('Please login or sign up to proceed to checkout.');
                    openAuthModal('login');
                }
            });
        }

        // Checkout Info Modal Logic
        const checkoutNameEl = document.getElementById('checkout-name');
        const checkoutPhoneEl = document.getElementById('checkout-phone');
        const checkoutAddressEl = document.getElementById('checkout-address');
        const paymentOnDeliveryBtn = document.getElementById('payment-on-delivery-btn');
        const payViaWhatsappBtn = document.getElementById('pay-via-whatsapp-btn');

        function openCheckoutInfoModal() {
            if (checkoutInfoModal) {
                if(currentUser && currentUser.displayName) checkoutNameEl.value = currentUser.displayName;
                // Potential: if(currentUser && currentUser.phoneNumber) checkoutPhoneEl.value = currentUser.phoneNumber;
                checkoutAddressEl.value = ''; // Clear address each time
                checkoutInfoModal.style.display = 'block';
            }
        }
        if(checkoutInfoCloseBtn) {
            checkoutInfoCloseBtn.addEventListener('click', () => {
                if(checkoutInfoModal) checkoutInfoModal.style.display = 'none';
            });
        }

        if(paymentOnDeliveryBtn) {
            paymentOnDeliveryBtn.addEventListener('click', () => {
                const name = checkoutNameEl.value.trim();
                const phone = checkoutPhoneEl.value.trim();
                const address = checkoutAddressEl.value.trim();

                if (!name || !phone || !address) {
                    alert("Please fill in all delivery details.");
                    return;
                }

                const orderItems = cart.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price
                }));
                const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                db.collection('orders').add({
                    userId: currentUser.uid,
                    userName: name, // Use the name from the form
                    userEmail: currentUser.email,
                    phone,
                    address,
                    items: orderItems,
                    totalAmount: parseFloat(totalAmount.toFixed(2)), // Store as number
                    currency: 'NGN', // Add currency
                    paymentMethod: 'Pay on Delivery',
                    status: 'Pending',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then((docRef) => {
                    alert(`Order placed successfully (ID: ${docRef.id})!\nTotal: ₦${totalAmount.toFixed(2)}\nPayment: On Delivery.\nWe will contact you on ${phone} regarding delivery to ${address}.`);
                    cart = [];
                    updateCartDisplay();
                    if(checkoutInfoModal) checkoutInfoModal.style.display = 'none';
                }).catch(error => {
                    console.error("Error placing order: ", error);
                    alert("There was an error placing your order. Please try again.");
                });
            });
        }

        if(payViaWhatsappBtn) {
            payViaWhatsappBtn.addEventListener('click', () => {
                const name = checkoutNameEl.value.trim();
                const phone = checkoutPhoneEl.value.trim();
                const address = checkoutAddressEl.value.trim();

                if (!name || !phone || !address) {
                    alert("Please fill in all delivery details before proceeding to WhatsApp.");
                    return;
                }

                const orderItemsText = cart.map(item => `${item.name} (x${item.quantity}) - ₦${(item.price * item.quantity).toFixed(2)}`).join('\n'); // Naira
                const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);

                let message = `Hi Dietplanet, I'd like to place an order for delivery.\n\n`;
                message += `Order Details:\n${orderItemsText}\n`;
                message += `Total: ₦${totalAmount}\n\n`; // Naira
                message += `Delivery Information:\n`;
                message += `Name: ${name}\n`;
                message += `Phone: ${phone}\n`;
                message += `Address: ${address}\n\n`;
                message += `I would like to complete payment via WhatsApp. Please provide payment details.`;
                
                // Optionally, save a PENDING order to Firebase before redirecting
                // This helps track initiated orders even if WhatsApp chat isn't completed by user
                const orderItems = cart.map(item => ({ id: item.id, name: item.name, quantity: item.quantity, price: item.price }));
                db.collection('orders').add({
                    userId: currentUser.uid,
                    userName: name, userEmail: currentUser.email, phone,  address,
                    items: orderItems, totalAmount: parseFloat(totalAmount), currency: 'NGN', paymentMethod: 'Pending WhatsApp Payment', status: 'Pending WhatsApp',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                }).then(docRef => {
                     console.log("Pending WhatsApp order logged with ID: ", docRef.id);
                }).catch(error => {
                    console.error("Error logging pending WhatsApp order: ", error);
                });


                window.open(`https://wa.me/2349135371742?text=${encodeURIComponent(message)}`, '_blank');
                
                alert("You will be redirected to WhatsApp to complete your order and payment. Your cart will be cleared.");
                cart = [];
                updateCartDisplay();
                if(checkoutInfoModal) checkoutInfoModal.style.display = 'none';
            });
        }

        // Initial Renders for customer page
        renderCarousel();
        renderProducts();
        updateCartDisplay();
    }


    // --- Admin Page Specific UI & Logic ---
    if (document.body.contains(document.getElementById('admin-content'))) {
        const adminAuthSection = document.getElementById('admin-auth');
        const adminContentSection = document.getElementById('admin-content');
        const adminLoginEmailEl = document.getElementById('admin-login-email');
        const adminLoginPasswordEl = document.getElementById('admin-login-password');
        const adminLoginSubmitBtn = document.getElementById('admin-login-submit-btn');
        const adminLogoutLink = document.getElementById('admin-logout-link');

        // Carousel Management (Admin)
        const carouselForm = document.getElementById('carousel-form');
        const currentCarouselSlidesEl = document.getElementById('current-carousel-slides');
        const carouselImageUrlEl = document.getElementById('carousel-image-url');
        const carouselAltTextEl = document.getElementById('carousel-alt-text');
        const carouselLinkEl = document.getElementById('carousel-link');

        // Product Management (Admin)
        const productForm = document.getElementById('product-form');
        const currentProductsListEl = document.getElementById('current-products-list');
        const productIdEl = document.getElementById('product-id');
        const productNameEl = document.getElementById('product-name');
        const productDescriptionEl = document.getElementById('product-description');
        const productPriceEl = document.getElementById('product-price');
        const productImageURLEl = document.getElementById('product-image-url');
        const saveProductBtn = document.getElementById('save-product-btn');
        const clearProductFormBtn = document.getElementById('clear-product-form-btn');


        function checkAdminAuth() {
            // TODO: Replace with actual Firebase admin check
            // For now, simulate admin login state (e.g. via localStorage or a simple flag)
            // if (auth.currentUser && /* check if admin role */) {
            if (localStorage.getItem('dietplanet_isAdmin') === 'true') {
                isAdmin = true;
                currentUser = { email: localStorage.getItem('dietplanet_adminEmail') || "admin@example.com" }; // Mock user
                adminAuthSection.style.display = 'none';
                adminContentSection.style.display = 'block';
                loadAdminData();
            } else {
                isAdmin = false;
                adminAuthSection.style.display = 'block';
                adminContentSection.style.display = 'none';
            }
        }

        if (adminLoginSubmitBtn) {
            adminLoginSubmitBtn.addEventListener('click', () => {
                const email = adminLoginEmailEl.value;
                const password = adminLoginPasswordEl.value;
                // TODO: Implement Firebase Admin Authentication
                // For now, simple check (replace with secure Firebase auth)
                if (email === "dietplanetnigeria@gmail.com" && password === "Dietplanetalien7") { // Updated admin email and password
                    alert("Admin login successful (Placeholder - use Firebase Auth for real app)!");
                    localStorage.setItem('dietplanet_isAdmin', 'true');
                    localStorage.setItem('dietplanet_adminEmail', email);
                    checkAdminAuth();
                } else {
                    alert("Admin login failed. (Placeholder)");
                }
            });
        }

        if (adminLogoutLink) {
            adminLogoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                // TODO: Firebase sign out
                // auth.signOut().then(() => { ... });
                localStorage.removeItem('dietplanet_isAdmin');
                localStorage.removeItem('dietplanet_adminEmail');
                currentUser = null;
                isAdmin = false;
                alert("Admin logged out.");
                checkAdminAuth(); // This will show login form
                // Optionally redirect to home or login page
                // window.location.href = 'index.html';
            });
        }

        function loadAdminData() {
            if (!isAdmin) return;
            // TODO: Load data from Firebase
            renderAdminCarouselSlides();
            renderAdminProducts();
        }

        // Carousel Management Functions (Admin)
        function renderAdminCarouselSlides() {
            if (!currentCarouselSlidesEl) return;
            currentCarouselSlidesEl.innerHTML = '';
            carouselSlidesData.forEach((slide, index) => {
                const slideDiv = document.createElement('div');
                slideDiv.classList.add('slide-item');
                slideDiv.innerHTML = `
                    <img src="${slide.imageUrl}" alt="${slide.altText}" style="width:100px; height:auto; margin-right:10px;">
                    <span>${slide.altText} (${slide.link || 'No link'})</span>
                    <div class="admin-actions">
                        <button class="edit-btn" data-index="${index}">Edit</button>
                        <button class="delete-btn" data-index="${index}">Delete</button>
                    </div>
                `;
                // TODO: Add event listeners for edit/delete
                currentCarouselSlidesEl.appendChild(slideDiv);
            });
        }

        if (carouselForm) {
            carouselForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newSlide = {
                    imageUrl: carouselImageUrlEl.value,
                    altText: carouselAltTextEl.value,
                    link: carouselLinkEl.value || '#'
                };
                // TODO: Save to Firebase
                // For now, update local array
                carouselSlidesData.push(newSlide); // Or update if editing
                alert('Carousel slide added/updated (locally). Firebase needed for persistence.');
                renderAdminCarouselSlides();
                carouselForm.reset();
            });
        }

        // Product Management Functions (Admin)
        function renderAdminProducts() {
            if (!currentProductsListEl) return;
            currentProductsListEl.innerHTML = '';
            products.forEach((product, index) => {
                const productDiv = document.createElement('div');
                productDiv.classList.add('product-admin-item');
                productDiv.innerHTML = `
                    <img src="${product.imageUrl}" alt="${product.name}">
                    <div class="product-admin-item-info">
                        <strong>${product.name}</strong> - ₦${product.price.toFixed(2)}<br>
                        <small>${product.description.substring(0, 50)}...</small>
                    </div>
                    <div class="admin-actions">
                        <button class="edit-btn" data-id="${product.id}">Edit</button>
                        <button class="delete-btn" data-id="${product.id}">Delete</button>
                    </div>
                `;
                productDiv.querySelector('.edit-btn').addEventListener('click', () => loadProductForEdit(product.id));
                productDiv.querySelector('.delete-btn').addEventListener('click', () => deleteProduct(product.id));
                currentProductsListEl.appendChild(productDiv);
            });
        }

        function loadProductForEdit(productId) {
            const product = products.find(p => p.id === productId);
            if (product) {
                productIdEl.value = product.id;
                productNameEl.value = product.name;
                productDescriptionEl.value = product.description;
                productPriceEl.value = product.price;
                productImageURLEl.value = product.imageUrl;
                saveProductBtn.textContent = 'Update Product';
                clearProductFormBtn.style.display = 'inline-block';
                productNameEl.focus();
            }
        }

        function deleteProduct(productId) {
            if (confirm('Are you sure you want to delete this product?')) {
                // TODO: Delete from Firebase
                products = products.filter(p => p.id !== productId);
                alert('Product deleted (locally). Firebase needed for persistence.');
                renderAdminProducts();
                clearProductForm();
            }
        }
        
        function clearProductForm() {
            productForm.reset();
            productIdEl.value = '';
            saveProductBtn.textContent = 'Add Product';
            clearProductFormBtn.style.display = 'none';
        }

        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const productData = {
                    id: productIdEl.value || Date.now().toString(), // Generate ID if new
                    name: productNameEl.value,
                    description: productDescriptionEl.value,
                    price: parseFloat(productPriceEl.value),
                    imageUrl: productImageURLEl.value
                };

                if (productIdEl.value) { // Updating existing product
                    const index = products.findIndex(p => p.id === productIdEl.value);
                    if (index > -1) products[index] = productData;
                    alert('Product updated (locally). Firebase needed for persistence.');
                } else { // Adding new product
                    products.push(productData);
                    alert('Product added (locally). Firebase needed for persistence.');
                }
                // TODO: Save to Firebase (add or update)
                renderAdminProducts();
                clearProductForm();
            });
        }
        if(clearProductFormBtn) {
            clearProductFormBtn.addEventListener('click', clearProductForm);
        }

        // Initial check for admin authentication
        checkAdminAuth();
    }


    // --- Authentication Modal Logic (Common) ---
    if (loginLink && authModal && authCloseBtn) { // Use authCloseBtn
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            openAuthModal('login');
        });
        authCloseBtn.addEventListener('click', () => { // Use authCloseBtn
            authModal.style.display = 'none';
        });
        // Close modal if clicked outside content
        window.addEventListener('click', (event) => {
            if (event.target === authModal) {
                authModal.style.display = 'none';
            }
            if (checkoutInfoModal && event.target === checkoutInfoModal) { // Also for checkout info modal
                checkoutInfoModal.style.display = 'none';
            }
        });
    }

    function openAuthModal(formToShow = 'login') {
        if (!authModal || !loginForm || !signupForm) return;
        if (formToShow === 'login') {
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        } else {
            loginForm.style.display = 'none';
            signupForm.style.display = 'block';
        }
        authModal.style.display = 'block';
    }

    if (showSignupLink) showSignupLink.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('signup'); });
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('login'); });

    // Customer Login/Signup Logic
    if (loginForm && loginForm.querySelector('#login-submit-btn')) {
        loginForm.querySelector('#login-submit-btn').addEventListener('click', () => {
            const email = loginForm.querySelector('#login-email').value;
            const password = loginForm.querySelector('#login-password').value;
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    currentUser = userCredential.user;
                    // Basic admin check (improve with custom claims or Firestore role for production)
                    if (currentUser.email === "dietplanetnigeria@gmail.com") {
                        isAdmin = true;
                        localStorage.setItem('dietplanet_isAdmin', 'true');
                        localStorage.setItem('dietplanet_adminEmail', currentUser.email);
                    } else {
                        isAdmin = false;
                    }
                    updateUIAfterAuth();
                    authModal.style.display = 'none';
                    alert(`Welcome back, ${currentUser.displayName || currentUser.email}!`);
                })
                .catch((error) => {
                    alert(`Login Error: ${error.message}`);
                });
        });
    }

    if (signupForm && signupForm.querySelector('#signup-submit-btn')) {
        signupForm.querySelector('#signup-submit-btn').addEventListener('click', () => {
            const email = signupForm.querySelector('#signup-email').value;
            const password = signupForm.querySelector('#signup-password').value;
            const confirmPassword = signupForm.querySelector('#signup-confirm-password').value;
            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return;
            }
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    currentUser = userCredential.user;
                    isAdmin = false; // New users are not admins
                    updateUIAfterAuth();
                    authModal.style.display = 'none';
                    alert(`Welcome, ${currentUser.email}! Your account has been created.`);
                    // TODO: Optionally, create a user document in Firestore here
                    // db.collection('users').doc(currentUser.uid).set({ email: currentUser.email, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
                })
                .catch((error) => {
                    alert(`Signup Error: ${error.message}`);
                });
        });
    }

    let loginLinkElement = document.getElementById('login-link'); // Keep a reference that can be updated

    function updateUIAfterAuth() {
        if (!loginLinkElement) loginLinkElement = document.getElementById('login-link'); // Ensure it's fresh

        if (currentUser) {
            loginLinkElement.textContent = `Logout (${currentUser.displayName || currentUser.email.split('@')[0]})`;
            
            // Re-attach event listener by cloning to avoid stale closures or multiple listeners
            const newLoginLink = loginLinkElement.cloneNode(true);
            loginLinkElement.parentNode.replaceChild(newLoginLink, loginLinkElement);
            loginLinkElement = newLoginLink;
            loginLinkElement.addEventListener('click', handleLogout);

            if (isAdmin && adminLink) {
                adminLink.style.display = 'inline-block';
            } else if (adminLink) {
                adminLink.style.display = 'none';
            }
        } else {
            loginLinkElement.textContent = 'Login';

            const newLoginLink = loginLinkElement.cloneNode(true);
            loginLinkElement.parentNode.replaceChild(newLoginLink, loginLinkElement);
            loginLinkElement = newLoginLink;
            loginLinkElement.addEventListener('click', (e) => { e.preventDefault(); openAuthModal('login'); });

            if (adminLink) adminLink.style.display = 'none';
        }
    }


    function handleLogout(e) {
        if (e) e.preventDefault();
        auth.signOut().then(() => {
            currentUser = null;
            isAdmin = false;
            localStorage.removeItem('dietplanet_isAdmin');
            localStorage.removeItem('dietplanet_adminEmail');
            alert("You have been logged out.");
            updateUIAfterAuth();
            if (document.body.contains(document.getElementById('admin-content'))) {
                checkAdminAuth();
            }
        }).catch((error) => {
            console.error("Logout error:", error);
            alert("Error logging out. Please try again.");
        });
    }

    // Firebase Auth State Listener
    auth.onAuthStateChanged(user => {
        if (user) {
            currentUser = user;
            // More robust admin check needed for production (e.g., custom claims or Firestore role)
            if (user.email === "dietplanetnigeria@gmail.com") {
                isAdmin = true;
                localStorage.setItem('dietplanet_isAdmin', 'true');
                localStorage.setItem('dietplanet_adminEmail', user.email);
            } else {
                // Check persisted admin state only if current user is not the hardcoded admin
                // This allows an admin to be logged in on admin page, and a different user on customer page
                isAdmin = (localStorage.getItem('dietplanet_isAdmin') === 'true' && localStorage.getItem('dietplanet_adminEmail') === user.email);
            }
            console.log("User logged in:", user.email, "Is Admin:", isAdmin);
        } else {
            currentUser = null;
            isAdmin = false; // If no user, definitely not admin for the current view
            // Don't clear localStorage admin flags here, as admin might be on admin page
            // and customer logs out on another tab. Admin page checkAdminAuth handles its own state.
            console.log("User logged out or not logged in.");
        }
        updateUIAfterAuth();
        loadDataFromFirebase(); // Load data that might depend on auth state

        if (document.body.contains(document.getElementById('admin-content'))) {
            checkAdminAuth(); // Re-check admin section visibility on admin page
        }
    });

    // --- Firebase Data Loading ---
    function loadDataFromFirebase() {
        console.log("Attempting to load data from Firebase...");
        // Load products from Firebase
        db.collection('products').onSnapshot(snapshot => {
            const firebaseProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (firebaseProducts.length > 0) {
                products = firebaseProducts;
            } // else keep sample data if Firebase returns empty (or handle error)
            if (document.body.contains(document.getElementById('product-list'))) renderProducts();
            if (document.body.contains(document.getElementById('admin-content')) && isAdmin) renderAdminProducts();
        }, err => {
            console.error("Error fetching products: ", err);
            // Fallback to sample data if products array is still the initial sample and Firebase failed
            if (products.length > 0 && document.body.contains(document.getElementById('product-list'))) {
                 console.log("Using sample product data due to Firebase error or empty collection.");
                 renderProducts();
            }
        });

        // Load carousel slides from Firebase
        db.collection('carouselSlides').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
            const firebaseSlides = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (firebaseSlides.length > 0) {
                carouselSlidesData = firebaseSlides;
            } // else keep sample data
            if (document.body.contains(document.getElementById('product-list'))) renderCarousel();
            if (document.body.contains(document.getElementById('admin-content')) && isAdmin) renderAdminCarouselSlides();
        }, err => {
            console.error("Error fetching carousel slides: ", err);
            if (carouselSlidesData.length > 0 && document.body.contains(document.getElementById('product-list'))) {
                console.log("Using sample carousel data due to Firebase error or empty collection.");
                renderCarousel();
            }
        });
        
        // Initial render with sample data if Firebase is slow (already covered by onSnapshot logic)
        if (document.body.contains(document.getElementById('product-list'))) {
            if (products.length > 0 && !db.collection('products').onSnapshot) renderProducts(); // Only if no listener attached yet
            if (carouselSlidesData.length > 0 && !db.collection('carouselSlides').onSnapshot) renderCarousel();
        }
        if (document.body.contains(document.getElementById('admin-content'))) {
            checkAdminAuth(); // Ensures admin page updates if already loaded
        }
    }

    // Initial call to update UI based on any existing auth state (e.g. persisted login)
    // auth.onAuthStateChanged will also call this, but this ensures immediate UI update on load.
    // updateUIAfterAuth(); // This might be redundant if onAuthStateChanged fires immediately.
    // loadDataFromFirebase(); // Data loading is now primarily triggered by onAuthStateChanged.

});
