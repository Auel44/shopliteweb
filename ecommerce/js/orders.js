// js/orders.js — Group 63 E-Commerce

async function initOrdersPage() {
  const container = document.getElementById("orders-list");
  if (!container) return;

  // 1. Check Authentication
  if (!Auth.isLoggedIn()) {
    container.innerHTML = `
      <div class="empty-orders">
        <div class="empty-icon">🔒</div>
        <h2>Please Log In</h2>
        <p>You need to be logged in to view your order history.</p>
        <a href="auth.html" class="btn-primary" style="margin-top: 1rem;">Go to Login</a>
      </div>
    `;
    return;
  }

  try {
    const data = await OrdersAPI.getMyOrders();
    const orders = data.orders;

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div class="empty-orders">
          <div class="empty-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders with ShopLite yet.</p>
          <a href="shop.html" class="btn-primary" style="margin-top: 1rem;">Start Shopping</a>
        </div>
      `;
      return;
    }

    renderOrders(orders, container);
  } catch (err) {
    console.error("Orders Error:", err);
    container.innerHTML = `
      <div class="empty-orders">
        <div class="empty-icon">❌</div>
        <h2>Failed to Load Orders</h2>
        <p>${err.message || "Please try again later."}</p>
        <button class="btn-primary" onclick="location.reload()" style="margin-top: 1rem;">Retry</button>
      </div>
    `;
  }
}

function renderOrders(orders, container) {
  container.innerHTML = orders.map(order => {
    const date = new Date(order.createdAt).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric'
    });
    
    const itemsCount = order.items.reduce((sum, i) => sum + i.qty, 0);
    
    return `
      <div class="order-card" id="order-${order.order_ref}">
        <div class="order-header">
          <div class="order-meta">
            <span class="order-id">Ref: ${order.order_ref}</span>
            <div class="order-date">${date} • ${itemsCount} Item(s)</div>
          </div>
          <span class="order-status status-${order.status || 'pending'}">
            ${order.status || 'pending'}
          </span>
        </div>
        <div class="order-body">
          <div class="order-items-summary">
            ${order.items.map(item => `
              <div class="order-item-mini">
                <span>${item.qty}x ${item.name}</span>
                <span>₵${(item.price * item.qty).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div class="order-footer">
          <div class="order-shipping">
            <small style="color:var(--clr-text-muted)">Payment: Cash on Delivery</small>
          </div>
          <div class="order-total-wrap">
            <span class="order-total-label">Total: </span>
            <span class="order-total-val">₵${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
