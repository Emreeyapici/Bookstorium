// Bookstorium - Main JavaScript File
// Developed for e-commerce functionality

// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
let isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    updateCartDisplay();
    updateFavoritesDisplay();
    updateUserInterface();
    attachEventListeners();
});

// Initialize Application
function initializeApp() {
    console.log('Bookstorium App Initialized');
    
    // Create demo user for testing
    createDemoUser();
    
    // Update displays
    updateCartBadge();
    updateFavoritesBadge();
    
    // Check login status
    if (isLoggedIn && currentUser) {
        updateUserDropdown();
    }
}

// Event Listeners
function attachEventListeners() {
    // Add to cart buttons
    document.querySelectorAll('.btn-modern').forEach(button => {
        if (button.innerHTML.includes('Sepete Ekle')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const card = this.closest('.card');
                const productData = extractProductData(card);
                addToCart(productData);
            });
        }
    });

    // Add to favorites buttons
    document.querySelectorAll('.btn-outline-danger').forEach(button => {
        if (button.innerHTML.includes('fa-heart')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const card = this.closest('.card');
                const productData = extractProductData(card);
                toggleFavorite(productData);
                this.classList.toggle('btn-danger');
                this.classList.toggle('btn-outline-danger');
            });
        }
    });

    // Login form submission
    document.querySelector('#loginModal .btn[style*="background-color"]').addEventListener('click', handleLogin);
    
    // Signup form submission
    document.querySelector('#signupModal .btn[style*="background-color"]').addEventListener('click', handleSignup);
    
    // Delete account
    document.querySelector('#deleteAccountModal .btn-danger').addEventListener('click', handleDeleteAccount);
    
    // Search functionality
    document.querySelector('form .btn-outline-light').addEventListener('click', handleSearch);
    
    // Clear cart and place order buttons will be handled dynamically in updateCartDisplay()
}

// Extract Product Data from Card
function extractProductData(card) {
    const title = card.querySelector('.card-title').textContent;
    const price = card.querySelector('.price').textContent;
    const image = card.querySelector('.card-img-top').src;
    const description = card.querySelector('.card-text').textContent;
    
    return {
        id: generateProductId(title),
        title: title,
        price: price,
        image: image,
        description: description,
        quantity: 1
    };
}

// Generate unique product ID
function generateProductId(title) {
    return title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Cart Functions
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
        showToast(`${product.title} sepete eklendi! (${existingItem.quantity} adet)`, 'success');
    } else {
        cart.push(product);
        showToast(`${product.title} sepete eklendi!`, 'success');
    }
    
    updateCartStorage();
    updateCartDisplay();
    updateCartBadge();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartStorage();
    updateCartDisplay();
    updateCartBadge();
    showToast('Ürün sepetten kaldırıldı!', 'info');
}

function updateCartQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartStorage();
            updateCartDisplay();
            updateCartBadge();
        }
    }
}

function clearCart() {
    cart = [];
    updateCartStorage();
    updateCartDisplay();
    updateCartBadge();
    showToast('Sepet temizlendi!', 'info');
}

function updateCartStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartDisplay() {
    const cartDropdown = document.querySelector('#cartDropdown').nextElementSibling;
    
    if (cart.length === 0) {
        cartDropdown.innerHTML = `
            <li><h6 class="dropdown-header">Sepetim</h6></li>
            <li><div class="cart-empty">Sepetiniz boş</div></li>
        `;
        return;
    }

    let cartHTML = '<li><h6 class="dropdown-header">Sepetim</h6></li>';
    
    cart.forEach(item => {
        cartHTML += `
            <li>
                <div class="cart-item">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <div class="cart-item-title">${item.title}</div>
                            <div class="cart-item-price">${item.price} × ${item.quantity} adet</div>
                        </div>
                        <div class="d-flex align-items-center">
                            <div class="quantity-controls">
                                <button class="quantity-btn quantity-btn-minus" onclick="updateCartQuantity('${item.id}', -1)">−</button>
                                <span class="quantity-display">${item.quantity}</span>
                                <button class="quantity-btn quantity-btn-plus" onclick="updateCartQuantity('${item.id}', 1)">+</button>
                            </div>
                            <button class="remove-btn" onclick="removeFromCart('${item.id}')" title="Sepetten kaldır">×</button>
                        </div>
                    </div>
                </div>
            </li>
        `;
    });

    const total = calculateCartTotal();
    cartHTML += `
        <li><hr class="dropdown-divider"></li>
        <li>
            <div class="cart-total">
                Toplam: ₺${total.toFixed(2)}
            </div>
        </li>
        <li>
            <div class="cart-actions">
                <button class="cart-action-btn cart-order-btn" onclick="placeOrder()">
                    <i class="fas fa-check-circle me-1"></i>Sipariş Ver
                </button>
                <button class="cart-action-btn cart-clear-btn" onclick="clearCart()">
                    <i class="fas fa-trash me-1"></i>Temizle
                </button>
            </div>
        </li>
    `;
    
    cartDropdown.innerHTML = cartHTML;
}

function updateCartBadge() {
    const cartBadge = document.querySelector('#cartDropdown .badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartBadge) {
        cartBadge.textContent = totalItems;
    }
}

// Favorites Functions
function toggleFavorite(product) {
    const existingIndex = favorites.findIndex(item => item.id === product.id);
    
    if (existingIndex > -1) {
        favorites.splice(existingIndex, 1);
        showToast(`${product.title} favorilerden kaldırıldı!`, 'info');
    } else {
        favorites.push(product);
        showToast(`${product.title} favorilere eklendi!`, 'success');
    }
    
    updateFavoritesStorage();
    updateFavoritesDisplay();
    updateFavoritesBadge();
}

function toggleFavoriteFromDropdown(productId) {
    const product = favorites.find(item => item.id === productId);
    if (product) {
        toggleFavorite(product);
        
        // Also update the heart button on the product card if visible
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            const cardProduct = extractProductData(card);
            if (cardProduct.id === productId) {
                const heartButton = card.querySelector('.btn-outline-danger');
                if (heartButton) {
                    heartButton.classList.add('btn-outline-danger');
                    heartButton.classList.remove('btn-danger');
                }
            }
        });
    }
}

function updateFavoritesStorage() {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function updateFavoritesDisplay() {
    const favoritesDropdown = document.querySelector('#favoritesDropdown').nextElementSibling;
    
    if (favorites.length === 0) {
        favoritesDropdown.innerHTML = `
            <li><h6 class="dropdown-header">Favori Kitaplarım</h6></li>
            <li><div class="cart-empty">Favori kitabınız yok</div></li>
        `;
        return;
    }

    let favoritesHTML = '<li><h6 class="dropdown-header">Favori Kitaplarım</h6></li>';
    
    favorites.forEach(item => {
        favoritesHTML += `
            <li>
                <div class="favorite-item">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="flex-grow-1">${item.title}</span>
                        <button class="favorite-remove-btn" onclick="toggleFavoriteFromDropdown('${item.id}')" title="Favorilerden kaldır">
                            <i class="fas fa-heart-broken"></i>
                        </button>
                    </div>
                </div>
            </li>
        `;
    });
    
    favoritesHTML += `
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item text-center" href="#">
            <i class="fas fa-heart me-2"></i>Tüm Favorileri Gör
        </a></li>
    `;
    
    favoritesDropdown.innerHTML = favoritesHTML;
}

function updateFavoritesBadge() {
    const favoritesBadge = document.querySelector('#favoritesDropdown .badge');
    if (favoritesBadge) {
        favoritesBadge.textContent = favorites.length;
    }
}

// User Management Functions
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    if (!email || !password) {
        showToast('Lütfen tüm alanları doldurun!', 'error');
        return;
    }
    
    // Find registered user
    const registeredUser = registeredUsers.find(user => 
        user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );
    
    if (registeredUser) {
        currentUser = {
            email: registeredUser.email,
            name: registeredUser.name,
            loginTime: new Date().toISOString()
        };
        
        isLoggedIn = true;
        localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Close modal and clear form
        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        modal.hide();
        document.getElementById('loginEmail').value = '';
        document.getElementById('loginPassword').value = '';
        document.getElementById('rememberMe').checked = false;
        
        updateUserInterface();
        updateUserDropdown();
        showToast(`Hoş geldiniz, ${currentUser.name}!`, 'success');
    } else {
        showToast('E-posta veya şifre hatalı! Lütfen kayıt olun.', 'error');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;
    const acceptTerms = document.getElementById('acceptTerms').checked;
    
    if (!name || !email || !password || !passwordConfirm) {
        showToast('Lütfen tüm alanları doldurun!', 'error');
        return;
    }
    
    if (password !== passwordConfirm) {
        showToast('Şifreler eşleşmiyor!', 'error');
        return;
    }
    
    if (!acceptTerms) {
        showToast('Kullanım şartlarını kabul etmelisiniz!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('Şifre en az 6 karakter olmalıdır!', 'error');
        return;
    }
    
    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showToast('Geçerli bir e-posta adresi girin!', 'error');
        return;
    }
    
    // Check if user already exists
    const existingUser = registeredUsers.find(user => 
        user.email.toLowerCase() === email.toLowerCase()
    );
    
    if (existingUser) {
        showToast('Bu e-posta adresi zaten kayıtlı! Giriş yapmayı deneyin.', 'error');
        return;
    }
    
    // Create new user and save to registered users
    const newUser = {
        name: name,
        email: email,
        password: password,
        signupTime: new Date().toISOString()
    };
    
    registeredUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    // Automatically log in the new user
    currentUser = {
        name: newUser.name,
        email: newUser.email,
        signupTime: newUser.signupTime
    };
    
    isLoggedIn = true;
    localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Close modal and clear form
    const modal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
    modal.hide();
    document.getElementById('signupName').value = '';
    document.getElementById('signupEmail').value = '';
    document.getElementById('signupPassword').value = '';
    document.getElementById('signupPasswordConfirm').value = '';
    document.getElementById('acceptTerms').checked = false;
    
    updateUserInterface();
    updateUserDropdown();
    showToast(`Hesabınız oluşturuldu! Hoş geldiniz, ${currentUser.name}!`, 'success');
}

function handleDeleteAccount(e) {
    e.preventDefault();
    const password = document.getElementById('deletePassword').value;
    const confirmDelete = document.getElementById('confirmDelete').checked;
    
    if (!password) {
        showToast('Lütfen şifrenizi girin!', 'error');
        return;
    }
    
    if (!confirmDelete) {
        showToast('Hesap silme onayını işaretleyin!', 'error');
        return;
    }
    
    // Verify current user's password
    const registeredUser = registeredUsers.find(user => 
        user.email.toLowerCase() === currentUser.email.toLowerCase()
    );
    
    if (!registeredUser || registeredUser.password !== password) {
        showToast('Şifre hatalı!', 'error');
        return;
    }
    
    // Remove user from registered users
    registeredUsers = registeredUsers.filter(user => 
        user.email.toLowerCase() !== currentUser.email.toLowerCase()
    );
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
    
    // Clear all user data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('cart');
    localStorage.removeItem('favorites');
    
    isLoggedIn = false;
    currentUser = null;
    cart = [];
    favorites = [];
    
    // Close modal and clear form
    const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAccountModal'));
    modal.hide();
    document.getElementById('deletePassword').value = '';
    document.getElementById('confirmDelete').checked = false;
    
    updateUserInterface();
    updateCartDisplay();
    updateFavoritesDisplay();
    updateCartBadge();
    updateFavoritesBadge();
    showToast('Hesabınız başarıyla silindi!', 'info');
    
    // Reload page after 2 seconds
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    isLoggedIn = false;
    currentUser = null;
    
    updateUserInterface();
    showToast('Başarıyla çıkış yaptınız!', 'info');
    
    // Reload page to reset dropdown menus
    setTimeout(() => {
        window.location.reload();
    }, 1500);
}

function updateUserInterface() {
    const userDropdown = document.querySelector('#userDropdown');
    if (isLoggedIn && currentUser) {
        userDropdown.innerHTML = `<i class="fas fa-user"></i> ${currentUser.name}`;
    } else {
        userDropdown.innerHTML = `<i class="fas fa-user"></i> Hesap`;
    }
}

function updateUserDropdown() {
    // Update user dropdown menu based on login status
    const dropdownMenu = document.querySelector('#userDropdown').nextElementSibling;
    
    if (isLoggedIn && currentUser) {
        dropdownMenu.innerHTML = `
            <li><h6 class="dropdown-header">Hoş Geldiniz, ${currentUser.name}!</h6></li>
            <li><a class="dropdown-item" href="profile-edit.html">
              <i class="fas fa-user-edit"></i> Profil Düzenle</a></li>
            <li><a class="dropdown-item" href="profile-orders.html">
              <i class="fas fa-list-alt"></i> Siparişlerim</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" onclick="logout()">
              <i class="fas fa-sign-out-alt"></i> Çıkış Yap</a></li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#deleteAccountModal">
              <i class="fas fa-user-times"></i> Hesap Sil</a></li>
        `;
    }
}

// Search Function
function handleSearch(e) {
    e.preventDefault();
    const searchTerm = document.querySelector('input[type="search"]').value.toLowerCase();
    
    if (!searchTerm) {
        showToast('Lütfen arama terimi girin!', 'error');
        return;
    }
    
    // Simple search implementation
    const cards = document.querySelectorAll('.product-card');
    let foundCount = 0;
    
    cards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const description = card.querySelector('.card-text').textContent.toLowerCase();
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.closest('.col-sm-6').style.display = 'block';
            foundCount++;
        } else {
            card.closest('.col-sm-6').style.display = 'none';
        }
    });
    
    showToast(`${foundCount} ürün bulundu: "${searchTerm}"`, 'info');
}

// Order Functions
function placeOrder() {
    if (cart.length === 0) {
        showToast('Sepetiniz boş!', 'error');
        return;
    }
    
    if (!isLoggedIn) {
        showToast('Sipariş vermek için giriş yapmalısınız!', 'error');
        return;
    }
    
    // Redirect to order page
    window.location.href = 'order.html';
}

function calculateCartTotal() {
    return cart.reduce((total, item) => {
        const price = parseFloat(item.price.replace('₺', '').replace(',', '.'));
        return total + (price * item.quantity);
    }, 0);
}

function generateOrderId() {
    return 'ORD' + Date.now().toString().slice(-8);
}

// Toast Notification System
function showToast(message, type = 'info') {
    // Create toast container if not exists
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }
    
    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${getToastColor(type)} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${getToastIcon(type)} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    // Initialize and show toast
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

function getToastColor(type) {
    const colors = {
        'success': 'success',
        'error': 'danger',
        'info': 'info',
        'warning': 'warning'
    };
    return colors[type] || 'info';
}

function getToastIcon(type) {
    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-exclamation-circle',
        'info': 'fa-info-circle',
        'warning': 'fa-exclamation-triangle'
    };
    return icons[type] || 'fa-info-circle';
}

// Utility Functions
function formatPrice(price) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY'
    }).format(price);
}

// Export functions for global access
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleFavorite = toggleFavorite;
window.toggleFavoriteFromDropdown = toggleFavoriteFromDropdown;
window.logout = logout;
window.clearCart = clearCart;
window.placeOrder = placeOrder;

// Create demo user for testing (only if no users exist)
function createDemoUser() {
    if (registeredUsers.length === 0) {
        const demoUser = {
            name: 'Demo Kullanıcı',
            email: 'demo@bookstorium.com',
            password: '123456',
            signupTime: new Date().toISOString()
        };
        registeredUsers.push(demoUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        console.log('Demo kullanıcı oluşturuldu: demo@bookstorium.com / 123456');
    }
}