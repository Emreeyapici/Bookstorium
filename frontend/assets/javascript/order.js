// Order Page JavaScript
// Load cart data and handle order completion

// Global Variables
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
let isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
let selectedShipping = 15.00; // Default shipping cost

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeOrderPage();
    loadOrderItems();
    calculateTotals();
    attachEventListeners();
    prefillUserData();
});

// Initialize Order Page
function initializeOrderPage() {
    // Redirect if cart is empty
    if (cart.length === 0) {
        alert('Sepetiniz boş! Ana sayfaya yönlendiriliyorsunuz.');
        window.location.href = 'index.html';
        return;
    }
    
    // Redirect if not logged in
    if (!isLoggedIn) {
        alert('Sipariş vermek için giriş yapmalısınız!');
        window.location.href = 'index.html';
        return;
    }
    
    console.log('Order page initialized for:', currentUser.name);
}

// Load order items into summary
function loadOrderItems() {
    const orderItemsContainer = document.getElementById('orderItems');
    let itemsHTML = '';
    
    cart.forEach(item => {
        const itemTotal = parseFloat(item.price.replace('₺', '').replace(',', '.')) * item.quantity;
        itemsHTML += `
            <div class="order-item">
                <div class="order-item-info">
                    <div class="order-item-title">${item.title}</div>
                    <div class="order-item-quantity">${item.quantity} adet</div>
                </div>
                <div class="order-item-price">₺${itemTotal.toFixed(2)}</div>
            </div>
        `;
    });
    
    orderItemsContainer.innerHTML = itemsHTML;
}

// Calculate totals
function calculateTotals() {
    const subtotal = cart.reduce((total, item) => {
        const price = parseFloat(item.price.replace('₺', '').replace(',', '.'));
        return total + (price * item.quantity);
    }, 0);
    
    const shipping = selectedShipping;
    const total = subtotal + shipping;
    
    document.getElementById('subtotal').textContent = `₺${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = `₺${shipping.toFixed(2)}`;
    document.getElementById('total').textContent = `₺${total.toFixed(2)}`;
}

// Prefill user data
function prefillUserData() {
    if (currentUser) {
        document.getElementById('customerName').value = currentUser.name || '';
        document.getElementById('customerEmail').value = currentUser.email || '';
    }
}

// Attach event listeners
function attachEventListeners() {
    // Payment method change
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', handlePaymentMethodChange);
    });
    
    // Delivery option change
    document.querySelectorAll('.delivery-option').forEach(option => {
        option.addEventListener('click', handleDeliveryOptionChange);
    });
    
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', formatCardNumber);
    }
    
    // Card expiry formatting
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
        cardExpiryInput.addEventListener('input', formatCardExpiry);
    }
    
    // City change for districts
    const citySelect = document.getElementById('city');
    if (citySelect) {
        citySelect.addEventListener('change', handleCityChange);
    }
    
    // Form validation on input
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', validateField);
    });
}

// Handle payment method change
function handlePaymentMethodChange(e) {
    const creditCardDetails = document.getElementById('creditCardDetails');
    
    if (e.target.value === 'creditCard') {
        creditCardDetails.style.display = 'block';
        // Make card fields required
        document.getElementById('cardNumber').required = true;
        document.getElementById('cardName').required = true;
        document.getElementById('cardExpiry').required = true;
        document.getElementById('cardCvv').required = true;
    } else {
        creditCardDetails.style.display = 'none';
        // Remove card field requirements
        document.getElementById('cardNumber').required = false;
        document.getElementById('cardName').required = false;
        document.getElementById('cardExpiry').required = false;
        document.getElementById('cardCvv').required = false;
    }
}

// Handle delivery option change
function handleDeliveryOptionChange(e) {
    // Remove active class from all options
    document.querySelectorAll('.delivery-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Add active class to clicked option
    e.currentTarget.classList.add('active');
    
    // Update shipping cost
    const shippingText = e.currentTarget.querySelector('span').textContent;
    selectedShipping = parseFloat(shippingText.replace('₺', ''));
    calculateTotals();
}

// Format card number input
function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    if (formattedValue.length > 19) formattedValue = formattedValue.substring(0, 19);
    e.target.value = formattedValue;
}

// Format card expiry input
function formatCardExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

// Handle city change
function handleCityChange(e) {
    const districtSelect = document.getElementById('district');
    const districts = {
        'istanbul': ['Beşiktaş', 'Kadıköy', 'Üsküdar', 'Şişli', 'Beyoğlu'],
        'ankara': ['Çankaya', 'Keçiören', 'Yenimahalle', 'Mamak', 'Sincan'],
        'izmir': ['Konak', 'Karşıyaka', 'Bornova', 'Buca', 'Bayraklı'],
        'bursa': ['Osmangazi', 'Nilüfer', 'Yıldırım', 'Mudanya', 'Gemlik'],
        'antalya': ['Muratpaşa', 'Kepez', 'Konyaaltı', 'Aksu', 'Döşemealtı']
    };
    
    const selectedCity = e.target.value;
    districtSelect.innerHTML = '<option value="">İlçe Seçin</option>';
    
    if (districts[selectedCity]) {
        districts[selectedCity].forEach(district => {
            const option = document.createElement('option');
            option.value = district.toLowerCase();
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    }
}

// Validate individual field
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove existing validation classes
    field.classList.remove('is-valid', 'is-invalid');
    
    if (field.required && !value) {
        field.classList.add('is-invalid');
        return false;
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            field.classList.add('is-invalid');
            return false;
        }
    }
    
    // Phone validation
    if (field.type === 'tel' && value) {
        const phoneRegex = /^[0-9]{10,11}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            field.classList.add('is-invalid');
            return false;
        }
    }
    
    // TC validation
    if (field.id === 'customerTc' && value) {
        if (value.length !== 11 || !/^[0-9]+$/.test(value)) {
            field.classList.add('is-invalid');
            return false;
        }
    }
    
    field.classList.add('is-valid');
    return true;
}

// Validate entire form
function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Complete order
function completeOrder() {
    // Validate form
    if (!validateForm()) {
        showToast('Lütfen tüm gerekli alanları doğru şekilde doldurun!', 'error');
        return;
    }
    // Gerçek sipariş kaydı
    const orderData = {
        id: generateOrderId(),
        user: currentUser ? currentUser.email : '',
        customer: {
            name: document.getElementById('customerName').value,
            email: document.getElementById('customerEmail').value,
            phone: document.getElementById('customerPhone').value,
            tc: document.getElementById('customerTc').value
        },
        address: {
            city: document.getElementById('city').value,
            district: document.getElementById('district').value,
            postalCode: document.getElementById('postalCode').value,
            address: document.getElementById('address').value
        },
        payment: {
            method: document.querySelector('input[name="paymentMethod"]:checked').value,
            cardNumber: document.getElementById('cardNumber').value ? 
                       '**** **** **** ' + document.getElementById('cardNumber').value.slice(-4) : null
        },
        shipping: {
            method: document.querySelector('.delivery-option.active strong').textContent,
            cost: selectedShipping
        },
        items: [...cart],
        subtotal: cart.reduce((total, item) => {
            const price = parseFloat(item.price.replace('₺', '').replace(',', '.'));
            return total + (price * item.quantity);
        }, 0),
        shippingCost: selectedShipping,
        total: cart.reduce((total, item) => {
            const price = parseFloat(item.price.replace('₺', '').replace(',', '.'));
            return total + (price * item.quantity);
        }, 0) + selectedShipping,
        note: document.getElementById('orderNote').value,
        date: new Date().toISOString(),
        status: 'Onaylandı'
    };
    // Siparişi kaydet
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(orderData);
    localStorage.setItem('orders', JSON.stringify(orders));
    // Sepeti temizle
    localStorage.removeItem('cart');
    showToast('Siparişiniz başarıyla alındı!', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Generate order ID
function generateOrderId() {
    return 'ORD' + Date.now().toString().slice(-8);
}

// Toast notification system
function showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }
    
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
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });
    
    toast.show();
    
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

// Export for global access
window.completeOrder = completeOrder; 