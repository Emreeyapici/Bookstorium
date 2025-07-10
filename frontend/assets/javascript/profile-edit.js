// Bookstorium - Profile Edit JS

document.addEventListener('DOMContentLoaded', function() {
    // Check login
    const isLoggedIn = JSON.parse(localStorage.getItem('isLoggedIn')) || false;
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
    let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || [];

    if (!isLoggedIn || !currentUser) {
        window.location.href = 'index.html';
        return;
    }

    // Find full user info
    const userIndex = registeredUsers.findIndex(u => u.email === currentUser.email);
    if (userIndex === -1) {
        window.location.href = 'index.html';
        return;
    }
    const user = registeredUsers[userIndex];

    // Fill form
    document.getElementById('editName').value = user.name || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editAddress').value = user.address || '';

    // Form submit
    document.getElementById('profileEditForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('editName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const password = document.getElementById('editPassword').value;
        const address = document.getElementById('editAddress').value.trim();

        if (!name || !email || !address) {
            showToast('Lütfen tüm alanları doldurun!', 'error');
            return;
        }
        // Email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showToast('Geçerli bir e-posta adresi girin!', 'error');
            return;
        }
        // If email changed, check for duplicate
        if (email !== user.email && registeredUsers.some(u => u.email === email)) {
            showToast('Bu e-posta zaten kayıtlı!', 'error');
            return;
        }
        // If password entered, check length
        if (password && password.length < 6) {
            showToast('Şifre en az 6 karakter olmalı!', 'error');
            return;
        }
        // Update user
        user.name = name;
        user.email = email;
        user.address = address;
        if (password) user.password = password;
        // Update registeredUsers
        registeredUsers[userIndex] = user;
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        // Update currentUser if email or name changed
        localStorage.setItem('currentUser', JSON.stringify({
            name: user.name,
            email: user.email,
            loginTime: currentUser.loginTime || new Date().toISOString()
        }));
        showToast('Profiliniz başarıyla güncellendi!', 'success');
        // Optionally clear password field
        document.getElementById('editPassword').value = '';
    });
});

// Simple toast (Bootstrap 5 compatible)
function showToast(message, type = 'info') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }
    const toastId = 'toast-' + Date.now();
    const color = type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info';
    const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center text-white bg-${color} border-0" role="alert">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas ${icon} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        </div>
    `;
    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
    toast.show();
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
} 