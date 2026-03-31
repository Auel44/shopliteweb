// =============================================
// CART LOGIC — Group 63 E-Commerce
// =============================================

const CART_KEY = "g63_cart";
const FREE_SHIPPING_THRESHOLD = 50;
const SHIPPING_COST = 9.99;

// --- Local Storage Helpers ---
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// --- Cart Operations ---
async function addToCart(productId, qty = 1) {
  const cart = getCart();
  
  // Try to find in cart first
  let item = cart.find((i) => i.id == productId);
  
  if (item) {
    item.qty = item.qty + qty; // We don't have stock info here unless we fetch
  } else {
    try {
      const data = await ProductsAPI.getOne(productId);
      const product = data.product;
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty,
      });
    } catch (e) {
      console.error("Add to cart error:", e);
      showToast("Could not add product to cart.", "error");
      return false;
    }
  }
  
  saveCart(cart);
  updateNavCounter();
  return true;
}

function removeFromCart(productId) {
  const cart = getCart().filter((item) => item.id != productId);
  saveCart(cart);
  updateNavCounter();
}

function updateQty(productId, delta) {
  const cart = getCart();
  const item = cart.find((i) => i.id == productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(cart);
  updateNavCounter();
}

function setQty(productId, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id == productId);
  if (!item) return;
  item.qty = Math.max(1, parseInt(qty) || 1);
  saveCart(cart);
  updateNavCounter();
}

function clearCart() {
  localStorage.removeItem(CART_KEY);
  updateNavCounter();
}

// --- Totals ---
function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotals() {
  const cart = getCart();
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const shipping =
    subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_COST;
  const total = subtotal + shipping;
  return { subtotal, shipping, total };
}

// --- UI Helper ---
function updateNavCounter() {
  const badges = document.querySelectorAll(".cart-badge");
  const count = getCartCount();
  badges.forEach((badge) => {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
  });
}

// --- Stars Renderer ---
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "⯨" : "") + "☆".repeat(empty);
}

// --- Product Card Builder ---
function buildProductCard(product) {
  const discount = product.original_price
    ? Math.round(
        ((product.original_price - product.price) / product.original_price) * 100,
      )
    : 0;

  return `
    <div class="product-card" data-id="${product.id}">
      <a href="product.html?id=${product.id}" class="card-img-link">
        <div class="card-img-wrap">
          <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
          ${discount > 0 ? `<span class="badge-discount">-${discount}%</span>` : ""}
        </div>
      </a>
      <div class="card-body">
        <span class="card-category">${product.category}</span>
        <a href="product.html?id=${product.id}" class="card-title">${product.name}</a>
        <div class="card-stars">
          <span class="stars">${renderStars(product.rating)}</span>
          <span class="review-count">(${product.reviews})</span>
        </div>
        <div class="card-footer">
          <div class="price-wrap">
            <span class="price">GH₵${product.price.toFixed(2)}</span>
            ${product.original_price ? `<span class="price-old">GH₵${product.original_price.toFixed(2)}</span>` : ""}
          </div>
          <button class="btn-add" onclick="handleAddToCart('${product.id}', this)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          </button>
        </div>
      </div>
    </div>`;
}

async function handleAddToCart(id, btn) {
  const success = await addToCart(id);
  if (success) {
    btn.classList.add("added");
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    setTimeout(() => {
      btn.classList.remove("added");
      btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>`;
    }, 1400);
    showToast(`Added to cart!`);
  }
}

// --- Toast Notification ---
function showToast(msg, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
