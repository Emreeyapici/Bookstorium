// ======================================================
//             GLOBAL DEĞİŞKENLER VE SABİTLER
// ======================================================
const API_BASE_URL = 'http://24.199.93.37:8080/api';

// Bu değişkenler, kullanıcının o anki oturum bilgilerini tutar.
// Sayfa yenilendiğinde sessionStorage'dan (geçici hafıza) okunur.
let isLoggedIn = JSON.parse(sessionStorage.getItem('isLoggedIn')) || false;
let currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;

// Bu değişkenler, backend'den yüklendikten sonra doldurulur.
let cart = [];
let favorites = []; // Favoriler gereksinimini yapana kadar bu satır kalabilir.

// ======================================================
//             ANA BAŞLANGIÇ NOKTASI
// ======================================================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// ======================================================
//             UYGULAMA BAŞLATMA VE OLAY DİNLEYİCİLER
// ======================================================
function initializeApp() {
    console.log('Bookstorium App Başlatıldı');

    loadBooksFromBackend();
    updateUserInterface();
    attachEventListeners();
    updateUserDropdown(); // BU SATIRI 'if' BLOĞUNUN DIŞINA, YUKARIYA TAŞIDIK.

    if (isLoggedIn && currentUser) {
        // Bu fonksiyonlar sadece giriş yapmış kullanıcılar için çalışmalı
        fetchCartAndDisplay();
        fetchFavoritesAndDisplay();
    } else {
        // Bunlar da giriş yapmamış kullanıcılar için
        updateCartDisplay();
        updateFavoritesDisplay();
    }
}

function attachEventListeners() {
    // Statik (her zaman var olan) butonların dinleyicileri
    document.querySelector('#loginModal .btn[style*="background-color"]').addEventListener('click', handleLogin);
    document.querySelector('#signupModal .btn[style*="background-color"]').addEventListener('click', handleSignup);
    document.querySelector('form .btn-outline-light[type="submit"]').addEventListener('click', handleSearch);
    document.querySelector('#deleteAccountModal .btn-danger').addEventListener('click', handleDeleteAccount);
}


// ======================================================
//             BACKEND BAĞLANTILI FONKSİYONLAR
// ======================================================

async function loadBooksFromBackend() {
    console.log("Backend'e kitap listesi için istek gönderiliyor...");
    try {
        const response = await fetch(`${API_BASE_URL}/books`);
        if (!response.ok) throw new Error('Kitaplar yüklenemedi.');

        const booksFromDb = await response.json();
        console.log("Backend'den kitaplar başarıyla alındı:", booksFromDb);
        displayBooksFromBackend(booksFromDb);
    } catch (error) {
        console.error("Kitaplar çekilirken bir hata oluştu:", error);
        const bookListRow = document.getElementById('book-list-row');
        if(bookListRow) {
            bookListRow.innerHTML = `<p class="text-danger">${error.message}</p>`;
        }
    }
}

async function fetchCartAndDisplay() {
    if (!isLoggedIn || !currentUser?.id) {
        cart = [];
        updateCartDisplay();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/${currentUser.id}`);
        if (!response.ok) throw new Error('Sepet verisi alınamadı.');

        cart = await response.json();
        console.log('Sepet güncellendi:', cart);
        updateCartDisplay();
    } catch (error) {
        console.error('Sepet getirme hatası:', error);
        showToast('Sepetiniz yüklenemedi.', 'error');
    }
}

// ======================================================
//             KULLANICI YÖNETİMİ (Üyelik)
// ======================================================

async function handleSignup(e) {
    e.preventDefault();
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const newUser = await response.json();
        if (!response.ok) throw new Error(newUser.message || 'Kayıt başarısız oldu.');

        const modal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
        if (modal) modal.hide();

        showToast(`Hoş geldiniz, ${name}! Hesabınız oluşturuldu.`, 'success');
        handleLogin(null, { email, password });

    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function handleLogin(e, credentials = null) {
    if(e) e.preventDefault();

    const email = credentials?.email || document.getElementById('loginEmail').value;
    const password = credentials?.password || document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const userData = await response.json();
        if (!response.ok) throw new Error(userData.message || 'Giriş başarısız.');

        currentUser = { id: userData.id, name: userData.name, email: userData.email };
        isLoggedIn = true;
        sessionStorage.setItem('isLoggedIn', 'true');
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));

        const modal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        if (modal) modal.hide();

        updateUserInterface();
        updateUserDropdown();

        // Önce sepeti, SONRA favorileri (ve favorilerden sonra kitapları) getir.
        fetchCartAndDisplay();
        fetchFavoritesAndDisplay();

        showToast(`Tekrar hoş geldiniz, ${currentUser.name}!`, 'success');

    } catch (error) {
        showToast(error.message, 'error');
    }
}

function logout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('currentUser');
    isLoggedIn = false;
    currentUser = null;
    cart = [];
    favorites = [];

    updateUserInterface();
    updateUserDropdown();
    updateCartDisplay();
    updateFavoritesDisplay();


    // Çıkış yapıldığında, ana sayfadaki kitap listesini de sıfırlayıp yeniden yüklüyoruz.
    // Bu, kırmızı kalmış kalp butonlarının sıfırlanmasını sağlar.
    loadBooksFromBackend();

    showToast('Başarıyla çıkış yaptınız!', 'info');
}


async function handleDeleteAccount(e) {
    e.preventDefault();
    const confirmDelete = document.getElementById('confirmDelete').checked;

    if (!isLoggedIn || !currentUser?.id) {
        showToast('Bu işlem için giriş yapmış olmalısınız.', 'error');
        return;
    }

    if (!confirmDelete) {
        showToast('Hesap silme onayını işaretlemelisiniz!', 'error');
        return;
    }

    const userIdToDelete = currentUser.id;
    console.log(`${userIdToDelete} ID'li kullanıcı siliniyor...`);

    try {
        const response = await fetch(`${API_BASE_URL}/auth/user/${userIdToDelete}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Hesap silinirken bir hata oluştu.');
        }

        // Silme işlemi backend'de başarılı olduysa, şimdi frontend'de çıkış yapıyoruz.
        showToast('Hesabınız başarıyla kalıcı olarak silindi.', 'success');

        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAccountModal'));
        if(modal) modal.hide();

        // Logout fonksiyonumuz zaten oturumu temizleyip arayüzü güncelliyor.
        logout();

    } catch (error) {
        console.error('Hesap silme hatası:', error);
        showToast(error.message, 'error');
    }
}

// ======================================================
//             SEPET FONKSİYONLARI
// ======================================================

async function addToCart(bookId) {
    if (!isLoggedIn || !currentUser?.id) {
        showToast('Sepete ürün eklemek için lütfen giriş yapın.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/${currentUser.id}/add/${bookId}`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Ürün sepete eklenemedi.');

        const addedItem = await response.json();
        showToast(`'${addedItem.book.title}' sepete eklendi!`, 'success');
        fetchCartAndDisplay();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

async function removeFromCart(cartItemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/item/${cartItemId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Ürün sepetten silinemedi.');

        showToast('Ürün sepetten kaldırıldı.', 'success');
        fetchCartAndDisplay();
    } catch (error) {
        showToast(error.message, 'error');
    }
}
async function clearCart() {
    if (!isLoggedIn || !currentUser?.id) {
        showToast('Bu işlem için giriş yapmalısınız.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/${currentUser.id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Sepet temizlenemedi.');

        showToast('Sepetiniz tamamen temizlendi.', 'success');
        fetchCartAndDisplay(); // Arayüzü güncelle
    } catch (error) {
        showToast(error.message, 'error');
    }
}
async function updateCartQuantity(cartItemId, newQuantity) {
    try {
        const response = await fetch(`${API_BASE_URL}/cart/item/${cartItemId}/update?quantity=${newQuantity}`, {
            method: 'PUT'
        });
        if (!response.ok) throw new Error('Miktar güncellenemedi.');

        showToast('Sepetiniz güncellendi.', 'success');
        fetchCartAndDisplay();
    } catch (error) {
        showToast(error.message, 'error');
    }
}
async function placeOrder() {
    if (!isLoggedIn || !currentUser?.id) {
        showToast('Sipariş vermek için lütfen giriş yapın.', 'error');
        return;
    }

    if (cart.length === 0) {
        showToast('Sipariş vermek için sepetinizde ürün olmalı.', 'error');
        return;
    }

    const userId = currentUser.id;
    console.log(`${userId} ID'li kullanıcı sipariş veriyor...`);

    try {
        const response = await fetch(`${API_BASE_URL}/orders/${userId}`, {
            method: 'POST'
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Sipariş oluşturulurken bir hata oluştu.');
        }

        const newOrder = await response.json();
        console.log('Sipariş başarıyla oluşturuldu:', newOrder);

        showToast('Siparişiniz başarıyla alındı!', 'success');

        // Sipariş başarılı olduğu için, frontend'deki sepeti de temizleyip
        // arayüzü güncelliyoruz. Backend sepeti zaten temizledi, burası arayüzü senkronize etmek için.
        cart = [];
        updateCartDisplay();

    } catch (error) {
        console.error('Sipariş verme hatası:', error);
        showToast(error.message, 'error');
    }
}
// ======================================================
//             FAVORİ FONKSİYONLARI
// ======================================================

async function toggleFavorite(bookId) { // buttonElement parametresini kaldırdık
    if (!isLoggedIn || !currentUser?.id) {
        showToast('Favorilere eklemek için lütfen giriş yapın.', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/favorites/${currentUser.id}/toggle/${bookId}`, { method: 'POST' });
        const result = await response.json();
        if (!response.ok) throw new Error('İşlem sırasında bir hata oluştu.');

        if (result.isFavorited) {
            showToast('Kitap favorilere eklendi!', 'success');
        } else {
            showToast('Kitap favorilerden çıkarıldı.', 'info');
        }

        // Favori durumu değiştiği için, hem favori listesini hem de
        // ana sayfadaki kitap listesini (buton renkleri için) yeniden yükle.
        fetchFavoritesAndDisplay();

    } catch (error) {
        showToast(error.message, 'error');
    }
}
// ======================================================
//        YENİ FAVORİ GÖRÜNTÜLEME FONKSİYONLARI
// ======================================================

// KULLANICININ FAVORİLERİNİ BACKEND'DEN ÇEKEN VE EKRANI GÜNCELLEYEN ANA FONKSİYON
async function fetchFavoritesAndDisplay() {
    if (!isLoggedIn || !currentUser?.id) {
        favorites = [];
        updateFavoritesDisplay();
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/favorites/${currentUser.id}`);
        if (!response.ok) throw new Error('Favori verisi alınamadı.');

        favorites = await response.json(); // Global favori listesini doldur
        console.log('Favoriler güncellendi:', favorites);
        updateFavoritesDisplay();


        // Favoriler yüklendikten SONRA kitapları yükle ki,
        // displayBooks fonksiyonu favorileri doğru görsün.
        loadBooksFromBackend();

    } catch (error) {
        console.error('Favori getirme hatası:', error);
    }
}

// EKRANDAKİ FAVORİLER MENÜSÜNÜ GÜNCELLEYEN FONKSİYON
function updateFavoritesDisplay() {
    const favoritesDropdown = document.querySelector('#favoritesDropdown').nextElementSibling;
    updateFavoritesBadge();

    if (favorites.length === 0) {
        favoritesDropdown.innerHTML = `<li><div class="dropdown-item text-center">Favoriniz yok</div></li>`;
        return;
    }

    let favoritesHTML = '<li><h6 class="dropdown-header">Favorilerim</h6></li>';
    favorites.forEach(item => {
        favoritesHTML += `
            <li>
                <div class="dropdown-item d-flex justify-content-between align-items-center">
                    <span>${item.book.title}</span>
                </div>
            </li>
        `;
    });
    favoritesDropdown.innerHTML = favoritesHTML;
}

// EKRANDAKİ FAVORİ İKONUNUN SAYACINI GÜNCELLEYEN FONKSİYON
function updateFavoritesBadge() {
    const favoritesBadge = document.querySelector('#favoritesDropdown .badge');
    if (favoritesBadge) {
        favoritesBadge.textContent = favorites.length;
    }
}
// ======================================================
//             ARAMA FONKSİYONU
// ======================================================
async function handleSearch(e) {
    e.preventDefault();
    const searchTerm = document.querySelector('input[type="search"]').value;

    if (!searchTerm) {
        loadBooksFromBackend();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/books/search?query=${encodeURIComponent(searchTerm)}`);
        if (!response.ok) throw new Error('Arama sırasında bir hata oluştu.');

        const foundBooks = await response.json();
        showToast(`${foundBooks.length} ürün bulundu.`, 'info');
        displayBooksFromBackend(foundBooks);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// ======================================================
//             ARAYÜZ GÜNCELLEME FONKSİYONLARI
// ======================================================

function displayBooksFromBackend(books) {
    const bookListRow = document.getElementById('book-list-row');
    bookListRow.innerHTML = '';

    if (books.length === 0) {
        bookListRow.innerHTML = '<div class="col-12"><p>Gösterilecek kitap bulunamadı.</p></div>';
        return;
    }

    books.forEach(book => {
        const isFavorite = favorites.some(favItem => favItem.book.id === book.id);
        const favoriteBtnClass = isFavorite ? 'btn-danger' : 'btn-outline-danger';

        const bookColumn = document.createElement('div');
        bookColumn.className = 'col-sm-6 col-md-4 col-lg-3 d-flex';
        bookColumn.innerHTML = `
            <div class="card product-card h-100 w-100">
              <img src="${book.imageUrl || 'assets/images/Book-image.png'}" class="card-img-top" alt="${book.title}" style="height:250px; width:100%; object-fit:contain; padding-top: 15px;">
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">${book.title}</h5>
                <p class="card-text">${book.author}</p>
                <p class="price">₺${book.price ? book.price.toFixed(2) : 'N/A'}</p>
                <div class="d-flex gap-2 mt-auto">
                  <button class="btn btn-modern flex-fill add-to-cart-btn" data-book-id="${book.id}">
                    <i class="fas fa-shopping-cart"></i> Sepete Ekle
                  </button>
                  <button class="btn ${favoriteBtnClass} favorite-btn" data-book-id="${book.id}">
                    <i class="fas fa-heart"></i>
                  </button>
                </div>
              </div>
            </div>
        `;
        bookListRow.appendChild(bookColumn);
    });

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() { addToCart(this.dataset.bookId); });
    });

    // Favori butonu dinleyicisini güncelledik. Artık butonu yollamıyor.
    document.querySelectorAll('.favorite-btn').forEach(button => {
        button.addEventListener('click', function() {
            toggleFavorite(this.dataset.bookId);
        });
    });
}

function updateCartDisplay() {
    const cartDropdown = document.querySelector('#cartDropdown').nextElementSibling;
    updateCartBadge();

    if (cart.length === 0) {
        cartDropdown.innerHTML = `<li><div class="dropdown-item text-center">Sepetiniz boş</div></li>`;
        return;
    }

    let cartHTML = '<li><h6 class="dropdown-header">Sepetim</h6></li><li><hr class="dropdown-divider"></li>';
    let totalAmount = 0;

    cart.forEach(item => {
        const itemTotal = item.book.price * item.quantity;
        totalAmount += itemTotal;
        cartHTML += `
            <li>
                <div class="dropdown-item d-flex justify-content-between align-items-center">
                    <span class="me-2">${item.book.title} (x${item.quantity})</span>
                    <div class="d-flex align-items-center">
                        <span class="me-3 fw-bold">₺${itemTotal.toFixed(2)}</span>
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="mx-2">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})">+</button>
                        <button class="btn btn-sm btn-outline-danger ms-2 py-0 px-2" onclick="removeFromCart(${item.id})" title="Sepetten Kaldır">×</button>
                    </div>
                </div>
            </li>
        `;
    });

    cartHTML += `
        <li><hr class="dropdown-divider"></li>
        <li>
            <div class="dropdown-item d-flex justify-content-between">
                <strong>Toplam:</strong>
                <strong class="text-success">₺${totalAmount.toFixed(2)}</strong>
            </div>
        </li>
        <li><hr class="dropdown-divider"></li>
        <li>
            <div class="cart-actions d-flex p-2">
                <button class="btn btn-success btn-sm flex-fill me-1" onclick="placeOrder()">
                    <i class="fas fa-check-circle me-1"></i>Siparişi Tamamla
                </button>
                <button class="btn btn-danger btn-sm flex-fill ms-1" onclick="clearCart()">
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

function updateUserInterface() {
    const userDropdown = document.querySelector('#userDropdown');
    if (isLoggedIn && currentUser) {
        userDropdown.innerHTML = `<i class="fas fa-user"></i> ${currentUser.name}`;
    } else {
        userDropdown.innerHTML = `<i class="fas fa-user"></i> Hesap`;
    }
}

function updateUserDropdown() {
    const dropdownMenu = document.querySelector('#userDropdown').nextElementSibling;
    if (isLoggedIn && currentUser) {
        dropdownMenu.innerHTML = `
            <li><h6 class="dropdown-header">Hoş Geldiniz, ${currentUser.name}!</h6></li>
            <li><a class="dropdown-item" href="#"><i class="fas fa-user-edit"></i> Profil Düzenle</a></li>
            <li><a class="dropdown-item" href="profile-orders.html">
              <i class="fas fa-list-alt"></i> Siparişlerim</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Çıkış Yap</a></li>
            <li><a class="dropdown-item text-danger" href="#" data-bs-toggle="modal" data-bs-target="#deleteAccountModal"><i class="fas fa-user-times"></i> Hesabı Sil</a></li>
        `;
    } else {
         dropdownMenu.innerHTML = `
            <li><h6 class="dropdown-header">Hoş Geldiniz!</h6></li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#loginModal"><i class="fas fa-sign-in-alt"></i> Giriş Yap</a></li>
            <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#signupModal"><i class="fas fa-user-plus"></i> Üye Ol</a></li>
        `;
    }
}

// ======================================================
//             YARDIMCI FONKSİYONLAR (Toast vb.)
// ======================================================

function showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }
    const toastId = 'toast-' + Date.now();
    const toastColors = { success: 'success', error: 'danger', info: 'primary' };
    const toastIcons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${toastColors[type] || 'info'} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body"><i class="fas ${toastIcons[type] || 'fa-info-circle'} me-2"></i>${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
}