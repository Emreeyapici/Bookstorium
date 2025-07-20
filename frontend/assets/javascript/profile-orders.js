document.addEventListener('DOMContentLoaded', function() {
    // Gerekli global değişkenleri ve sabitleri tanımlıyoruz
    const API_BASE_URL = 'http://24.199.93.37:8080/api';
    const isLoggedIn = JSON.parse(sessionStorage.getItem('isLoggedIn')) || false;
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser')) || null;


    const ordersContainer = document.getElementById('ordersList');

    // Kullanıcı giriş yapmamışsa, hata göster ve 3 saniye sonra ana sayfaya yönlendir
    if (!isLoggedIn || !currentUser) {
        ordersContainer.innerHTML = '<div class="alert alert-danger">Siparişlerinizi görmek için lütfen giriş yapın. Ana sayfaya yönlendiriliyorsunuz...</div>';
        setTimeout(() => { window.location.href = 'index.html'; }, 3000);
        return;
    }

    // Backend'den siparişleri çekme fonksiyonunu çağır
    fetchOrders();

    async function fetchOrders() {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/user/${currentUser.id}`);
            if (!response.ok) {
                throw new Error('Sipariş geçmişi yüklenemedi.');
            }
            const orders = await response.json();
            displayOrders(orders);
        } catch (error) {
            ordersContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        }
    }

    function displayOrders(orders) {
        const ordersContainer = document.getElementById('ordersList');
        if (orders.length === 0) {
            ordersContainer.innerHTML = '<div class="alert alert-info mt-3">Henüz hiç sipariş vermediniz.</div>';
            return;
        }

        ordersContainer.innerHTML = '';

        orders.forEach(order => {
            const orderCard = document.createElement('div');
            orderCard.className = 'card mb-4 shadow-sm';

            let itemsHtml = '';
            order.orderItems.forEach(item => {
                const itemTotal = item.priceAtPurchase * item.quantity;
                itemsHtml += `<li class="list-group-item d-flex justify-content-between">
                                <span>${item.book.title} (x${item.quantity})</span>
                                <span>₺${itemTotal.toFixed(2)}</span>
                            </li>`;
            });

            orderCard.innerHTML = `
                <div class="card-header bg-light d-flex justify-content-between align-items-center flex-wrap">
                    <div>
                        <strong class="text-primary">Sipariş No:</strong> #${order.id}
                    </div>
                    <div>
                        <strong class="text-muted">Tarih:</strong> ${new Date(order.orderDate).toLocaleDateString('tr-TR')}
                    </div>
                </div>
                <div class="card-body">
                    <h5 class="card-title">Sipariş Edilen Kitaplar</h5>
                    <ul class="list-group list-group-flush">
                        ${itemsHtml}
                    </ul>
                </div>
                <div class="card-footer d-flex justify-content-end bg-white">
                    <strong>Toplam Tutar: <span class="text-success fs-5">₺${order.totalAmount.toFixed(2)}</span></strong>
                </div>
            `;
            ordersContainer.appendChild(orderCard);
        });
    }
});