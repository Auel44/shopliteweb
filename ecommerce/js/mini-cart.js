// =============================================
// MINI-CART DRAWER — Group 63 E-Commerce
// =============================================

function initMiniCart() {
  // 1. Inject HTML if not present
  if (!document.getElementById("cart-drawer")) {
    const drawerHTML = `
      <div class="cart-drawer-overlay" id="cart-overlay"></div>
      <div class="cart-drawer" id="cart-drawer">
        <div class="drawer-header">
          <h3>Shopping Bag</h3>
          <button class="drawer-close" id="drawer-close" aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="drawer-content" id="drawer-items"></div>
        <div class="drawer-footer">
          <div class="drawer-total">
            <span>Subtotal</span>
            <span id="drawer-subtotal">₵0.00</span>
          </div>
          <div class="drawer-actions">
            <a href="cart.html" class="btn-secondary" style="width:100%; justify-content:center;">View Bag</a>
            <a href="cart.html" class="btn-primary" style="width:100%; justify-content:center;">Checkout Now</a>
          </div>
        </div>
      </div>`;
    document.body.insertAdjacentHTML("beforeend", drawerHTML);
  }

  const overlay = document.getElementById("cart-overlay");
  const drawer = document.getElementById("cart-drawer");
  const closeBtn = document.getElementById("drawer-close");
  const cartBtn = document.querySelector(".nav-cart-btn");

  if (closeBtn) {
    closeBtn.addEventListener("click", closeDrawer);
  }
  if (overlay) {
    overlay.addEventListener("click", closeDrawer);
  }
  if (cartBtn) {
    cartBtn.addEventListener("click", (e) => {
      // Don't redirect if we want to show drawer
      // But only if we're not on the cart page itself
      if (document.body.dataset.page !== "cart") {
        e.preventDefault();
        openDrawer();
      }
    });
  }
}

function openDrawer() {
  renderDrawer();
  document.getElementById("cart-drawer").classList.add("open");
  document.getElementById("cart-overlay").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeDrawer() {
  document.getElementById("cart-drawer").classList.remove("open");
  document.getElementById("cart-overlay").classList.remove("open");
  document.body.style.overflow = "";
}

function renderDrawer() {
  const container = document.getElementById("drawer-items");
  const subtotalEl = document.getElementById("drawer-subtotal");
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding-top:3rem; color:var(--clr-text-muted);">
        <p style="font-size:3rem; margin-bottom:1rem;">🛒</p>
        <p>Your bag is empty.</p>
        <a href="shop.html" class="btn-ghost" style="margin-top:1rem;">Start Shopping</a>
      </div>`;
    subtotalEl.textContent = "₵0.00";
    return;
  }

  container.innerHTML = cart.map(item => `
    <div class="drawer-item">
      <img src="${item.image}" alt="${item.name}" class="drawer-img" onerror="this.src='images/placeholder.svg'">
      <div class="drawer-info">
        <a href="product.html?id=${item.id}" class="drawer-name">${item.name}</a>
        <div class="drawer-meta">${item.qty} × ₵${item.price.toFixed(2)}</div>
      </div>
      <button onclick="removeFromMiniCart(${item.id})" style="color:var(--clr-error); font-size:0.8rem;">Remove</button>
    </div>
  `).join("");

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  subtotalEl.textContent = `₵${subtotal.toFixed(2)}`;
}

function removeFromMiniCart(id) {
  removeFromCart(id);
  renderDrawer();
}

// Hook into existing handleAddToCart to open drawer
const originalHandleAddToCart = window.handleAddToCart;
window.handleAddToCart = function(id, btn) {
  // First do the original logic (add to cart)
  const success = addToCart(id);
  if (success) {
    // Show visual feedback on button
    if (btn) {
      btn.classList.add("added");
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
      setTimeout(() => {
        btn.classList.remove("added");
        btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
      }, 1400);
    }
    showToast(`Added to bag!`);
    // Then open the drawer
    if (document.body.dataset.page !== "cart") {
       openDrawer();
    }
  }
};

document.addEventListener("DOMContentLoaded", initMiniCart);
