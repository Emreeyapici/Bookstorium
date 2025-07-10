// Siparişlerim Sayfası JS

document.addEventListener('DOMContentLoaded', function() {
    renderOrders();
});

function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const allOrders = JSON.parse(localStorage.getItem('orders')) || [];
    // Sadece giriş yapan kullanıcıya ait ve aktif siparişler
    const userOrders = currentUser ? allOrders.filter(o => o.user === currentUser.email && (o.status === 'Onaylandı' || o.status === 'Kargoya Verildi')) : [];
    if (!currentUser) {
        ordersList.innerHTML = '<div class="alert alert-warning text-center">Siparişlerinizi görmek için giriş yapmalısınız.</div>';
        return;
    }
    if (userOrders.length === 0) {
        ordersList.innerHTML = '<div class="alert alert-info text-center">Aktif siparişiniz yok.</div>';
        return;
    }
    let html = '<div class="list-group">';
    userOrders.slice().reverse().forEach(order => {
        html += `
            <a href="#" class="list-group-item list-group-item-action mb-3 shadow-sm rounded-3" data-bs-toggle="modal" data-bs-target="#orderDetailsModal" onclick="showOrderDetails('${order.id}')">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <span class="fw-bold">Sipariş No:</span> ${order.id}<br>
                        <span class="text-muted small">${formatDate(order.date)}</span>
                    </div>
                    <div>
                        <span class="badge bg-success me-2">${order.status}</span>
                        <span class="fw-bold">₺${order.total.toFixed(2)}</span>
                    </div>
                </div>
            </a>
        `;
    });
    html += '</div>';
    ordersList.innerHTML = html;
    window.userOrders = userOrders;
}

function showOrderDetails(orderId) {
    const order = window.userOrders.find(o => o.id === orderId);
    if (!order) return;
    let itemsHtml = '';
    order.items.forEach(item => {
        itemsHtml += `<li>${item.title} <span class="text-muted">x${item.quantity}</span> <span class="float-end">₺${(item.price * item.quantity).toFixed(2)}</span></li>`;
    });
    document.getElementById('orderDetailsBody').innerHTML = `
        <div class="mb-3">
            <strong>Sipariş No:</strong> ${order.id}<br>
            <strong>Tarih:</strong> ${formatDate(order.date)}<br>
            <strong>Durum:</strong> <span class="badge bg-success">${order.status}</span><br>
            <strong>Adres:</strong> ${order.address.address}, ${order.address.district}, ${order.address.city}, ${order.address.postalCode}<br>
            <strong>Kargo:</strong> ${order.shipping.method} (₺${order.shipping.cost})<br>
            <strong>Not:</strong> ${order.note || '-'}
        </div>
        <ul class="list-group mb-3">
            ${itemsHtml}
        </ul>
        <div class="text-end">
            <strong>Toplam Tutar: ₺${order.total.toFixed(2)}</strong>
        </div>
    `;
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

window.showOrderDetails = showOrderDetails; 