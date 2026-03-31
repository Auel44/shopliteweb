// =============================================
// MAIN JS — Group 63 E-Commerce
// Page-specific logic controller
// =============================================

/* ————— App Initialization ————— */
document.addEventListener("DOMContentLoaded", () => {
  handleOAuthCallback();
  initApp();
  // Initialize Global Handlers
  handleGlobalErrors();
});

async function handleOAuthCallback() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("auth_token");
  const userStr = params.get("auth_user");

  if (token && userStr) {
    try {
      const user = JSON.parse(decodeURIComponent(userStr));
      localStorage.setItem("sl_token", token);
      localStorage.setItem("sl_user", JSON.stringify(user));
      localStorage.setItem("shopLiteSession", JSON.stringify({ 
        username: user.username, 
        email: user.email,
        role: user.role 
      }));
      
      // Clean URL without refreshing
      const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Notify user
      if (typeof showToast === "function") {
        showToast(`Welcome back, ${user.username}! 🥳`);
      }
    } catch (e) {
      console.error("OAuth callback error:", e);
    }
  }
}

function initApp() {
  initNav();
  if (typeof updateNavCounter === "function") updateNavCounter();
  initTheme(); // Added Theme Initialization

  const page = document.body.dataset.page;
  if (page === "home") initHome();
  else if (page === "shop") initShop();
  else if (page === "product") initProduct();
  else if (page === "cart") initCart();
  else if (page === "contact") initContact();
  else if (page === "orders") initOrdersPage();
}

// =============================================
// NAV — hamburger toggle + active link
// =============================================
function initNav() {
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("open");
      mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        hamburger.classList.remove("open");
        mobileMenu.classList.remove("open");
      }),
    );
  }

  // Session handling
  const session = JSON.parse(localStorage.getItem("shopLiteSession"));
  const navActions = document.querySelector(".nav-actions");
  const mobileActions = document.getElementById("mobile-menu");

  if (session) {
    // Desktop Nav
    if (navActions) {
      const loginBtn = navActions.querySelector('a[href="auth.html"]');
      if (loginBtn) {
        loginBtn.outerHTML = `
          <div class="user-menu">
            <span class="user-name" title="${session.email}">Hi, ${session.username}</span>
            <button onclick="logout()" class="btn-logout" title="Logout">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
            ${session.role === 'admin' ? '<a href="admin.html" class="admin-link" title="Admin Panel">⚙️ Admin</a>' : ''}
          </div>
        `;
      }
    }
    // Mobile Nav
    if (mobileActions) {
      const mobileLoginBtn = mobileActions.querySelector('a[href="auth.html"]');
      if (mobileLoginBtn) {
        mobileLoginBtn.outerHTML = `
          <div class="mobile-user-info">
            <span>👤 Signed in as <strong>${session.username}</strong></span>
            ${session.role === 'admin' ? '<a href="admin.html" style="color:var(--clr-accent)">⚙️ Admin Portal</a>' : ''}
            <a href="#" onclick="logout(); return false;" style="color:var(--clr-red)">🚪 Log Out</a>
          </div>
        `;
      }
    }
  }

  // Mark active nav link
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, .mobile-menu a").forEach((a) => {
    const href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });
}

/** Theme Initialization Logic **/
function initTheme() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeIcons(theme);

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateThemeIcons(next);
    });
  }
}

function updateThemeIcons(theme) {
  const lightIcon = document.getElementById('theme-icon-light');
  const darkIcon = document.getElementById('theme-icon-dark');
  if (lightIcon) lightIcon.style.display = theme === 'light' ? 'block' : 'none';
  if (darkIcon) darkIcon.style.display = theme === 'dark' ? 'block' : 'none';
}

/** Global Error Handlers **/
function handleGlobalErrors() {
  window.addEventListener('error', (e) => {
    console.error('Runtime Error:', e.message);
  });
  window.addEventListener('unhandledrejection', (e) => {
    console.error('Promise Rejection:', e.reason);
  });
}

/** Image Error Handling Helper **/
function handleImageError(img) {
  img.onerror = null; 
  img.src = 'images/placeholder.jpg';
}

async function logout() {
  if (typeof showToast === "function") {
    showToast("Logged out successfully. See you soon! 👋");
  }

  // Save cart to backend before clearing (if logged in)
  if (Auth.isLoggedIn()) {
    try {
      const cart = JSON.parse(localStorage.getItem("g63_cart") || "[]");
      if (cart.length > 0) {
        await CartAPI.save(cart);
      }
    } catch (_) { /* ignore if save fails */ }
  }
  
  // Clear all potential session keys + cart
  const keysToRemove = ["sl_token", "sl_user", "shopLiteToken", "shopLiteSession", "g63_cart"];
  keysToRemove.forEach(key => localStorage.removeItem(key));

  // Small delay so user can see the toast
  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
}
window.logout = logout;

window.socialLogin = function(provider) {
  const endpoint = provider.toLowerCase();
  window.location.href = `https://shopliteweb.onrender.com/api/auth/${endpoint}`;
};

// =============================================
// HOME PAGE
// =============================================
async function initHome() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  try {
    const data = await ProductsAPI.getAll({ featured: true });
    grid.innerHTML = data.products.map(buildProductCard).join("");
  } catch (e) {
    console.error("Home featured products load error:", e);
    grid.innerHTML = `<p style="text-align:center;grid-column:1/-1">Failed to load featured products.</p>`;
  }
}

// =============================================
// SHOP PAGE
// =============================================
let activeCategory = "all";
let searchQuery = "";

async function initShop() {
  const grid = document.getElementById("shop-grid");
  const searchInput = document.getElementById("shop-search");
  const categoryContainer = document.getElementById("cat-tabs");
  const resultsInfo = document.getElementById("results-info");
  if (!grid) return;

  // Build category tabs
  if (categoryContainer) {
    categoryContainer.innerHTML = CATEGORIES.map(
      (c) => `
      <button class="cat-tab ${c.id === "all" ? "active" : ""}" data-cat="${c.id}">${c.label}</button>
    `,
    ).join("");
    categoryContainer.addEventListener("click", async (e) => {
      const btn = e.target.closest(".cat-tab");
      if (!btn) return;
      categoryContainer
        .querySelectorAll(".cat-tab")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeCategory = btn.dataset.cat;
      await renderShop(grid, resultsInfo);
    });
  }
  // Search
  if (searchInput) {
    let timeout;
    searchInput.addEventListener("input", (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(async () => {
        searchQuery = e.target.value.trim();
        await renderShop(grid, resultsInfo);
      }, 400); 
    });
  }
  await renderShop(grid, resultsInfo);
}

async function renderShop(grid, resultsInfo) {
  try {
    const data = await ProductsAPI.getAll({ cat: activeCategory, search: searchQuery });
    const results = data.products;

    if (resultsInfo) {
      resultsInfo.textContent = `Showing ${results.length} product${results.length !== 1 ? "s" : ""}${searchQuery ? ` for "${searchQuery}"` : ""}`;
    }
    
    if (results.length === 0) {
      grid.innerHTML = `<div class="no-results" style="grid-column:1/-1">
        <h3>No products found</h3>
        <p>Try a different search term or category.</p>
      </div>`;
      return;
    }
    grid.innerHTML = results.map(buildProductCard).join("");
  } catch (e) {
    console.error("Shop load error:", e);
    grid.innerHTML = `<p style="text-align:center;grid-column:1/-1">Failed to load shop products.</p>`;
  }
}

// =============================================
// PRODUCT DETAIL PAGE
// =============================================
async function initProduct() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const wrap = document.getElementById("product-detail");
  if (!wrap) return;

  if (!id) {
    wrap.innerHTML = `<div style="text-align:center;padding:4rem"><h2>No product ID provided</h2><a href="shop.html" class="btn-primary" style="display:inline-flex;margin-top:1rem">Back to Shop</a></div>`;
    return;
  }

  try {
    const data = await ProductsAPI.getOne(id);
    const product = data.product;

    document.title = `${product.name} — ShopLite`;
    let qty = 1;
    const discount = product.original_price
      ? Math.round(
          ((product.original_price - product.price) / product.original_price) * 100,
        )
      : 0;

    wrap.innerHTML = `
      <div class="product-detail-wrap">
        <div class="product-gallery">
          <div class="gallery-main">
            <img id="main-img" src="${product.image}" alt="${product.name}" onerror="handleImageError(this)">
          </div>
          <div class="gallery-thumbs">
            ${[product.image, product.image, product.image]
              .map(
                (img, i) => `
              <div class="gallery-thumb ${i === 0 ? "active" : ""}" onclick="switchThumb(this, '${img}')">
                <img src="${img}" alt="View ${i + 1}" onerror="handleImageError(this)">
              </div>`,
              )
              .join("")}
          </div>
        </div>
        <div class="product-info">
          <span class="card-category">${product.category}</span>
          <h1>${product.name}</h1>
          <div class="product-rating">
            <span class="stars">${renderStars(product.rating)}</span>
            <span class="review-count">${product.reviews} reviews</span>
            ${product.stock > 0 ? `<span class="badge badge-success">In Stock</span>` : `<span class="badge badge-error">Out of Stock</span>`}
          </div>
          <div class="product-price">
            <span class="price">GH₵${product.price.toFixed(2)}</span>
            ${product.original_price ? `<span class="price-old">GH₵${product.original_price.toFixed(2)}</span>` : ""}
            ${discount > 0 ? `<span class="badge badge-warning">Save ${discount}%</span>` : ""}
          </div>
          <p class="product-description">${product.description}</p>
          <div class="quantity-wrap">
            <span class="qty-label">Quantity</span>
            <div class="qty-control">
              <button class="qty-btn" id="qty-minus" onclick="changeQty(-1)">−</button>
              <span class="qty-val" id="qty-display">1</span>
              <button class="qty-btn" id="qty-plus" onclick="changeQty(1)">+</button>
            </div>
            <span style="font-size:0.8rem;color:var(--clr-text-muted)">${product.stock} left</span>
          </div>
          <button class="add-to-cart-big" onclick="addProductToCart('${product.id}')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Add to Cart
          </button>
          <button class="btn-secondary" style="width:100%;justify-content:center" onclick="window.location.href='shop.html'">
            ← Continue Shopping
          </button>
          <div class="product-meta">
            <div class="meta-row"><span class="meta-label">SKU</span><span class="meta-val">G63-${String(product.id).substr(-4).toUpperCase()}</span></div>
            <div class="meta-row"><span class="meta-label">Category</span><span class="meta-val" style="text-transform:capitalize">${product.category}</span></div>
            <div class="meta-row"><span class="meta-label">Stock</span><span class="meta-val">${product.stock} units</span></div>
          </div>
        </div>
      </div>`;

    // Related products
    try {
      const relData = await ProductsAPI.getAll({ cat: product.category });
      const related = relData.products.filter(p => p.id !== product.id).slice(0, 4);
      const relatedSection = document.getElementById("related-products");
      if (relatedSection && related.length > 0) {
        relatedSection.innerHTML = `
          <div class="related-section container">
            <h2>You Might Also Like</h2>
            <div class="products-grid">${related.map(buildProductCard).join("")}</div>
          </div>`;
      }
    } catch (err) { console.error("Related products load error:", err); }

    window.currentQty = qty;
    window.currentProductStock = product.stock;
  } catch (e) {
    console.error("Product detail load error:", e);
    wrap.innerHTML = `<div style="text-align:center;padding:4rem"><h2>Error loading product</h2><p>${e.message}</p><a href="shop.html" class="btn-primary" style="display:inline-flex;margin-top:1rem">Back to Shop</a></div>`;
  }
}
function switchThumb(el, src) {
  document
    .querySelectorAll(".gallery-thumb")
    .forEach((t) => t.classList.remove("active"));
  el.classList.add("active");
  document.getElementById("main-img").src = src;
}
function changeQty(delta) {
  window.currentQty = Math.max(
    1,
    Math.min(
      window.currentProductStock || 99,
      (window.currentQty || 1) + delta,
    ),
  );
  document.getElementById("qty-display").textContent = window.currentQty;
}
async function addProductToCart(id) {
  const success = await addToCart(id, window.currentQty || 1);
  if (success) showToast(`${window.currentQty || 1} item(s) added to cart!`);
}

// =============================================
// CART PAGE
// =============================================
function initCart() {
  renderCartItems();
  renderOrderSummary();
  initCheckoutForm();
}

function renderCartItems() {
  const container = document.getElementById("cart-items-list");
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Looks like you haven't added anything yet.</p>
        <a href="shop.html" class="btn-primary">Start Shopping</a>
      </div>`;
    document.getElementById("place-order-section").style.display = "none";
    return;
  }
  document.getElementById("place-order-section").style.display = "block";

  container.innerHTML = cart
    .map(
      (item) => `
    <div class="cart-item" data-id="${item.id}">
      <div class="cart-item-img">
        <img src="${item.image}" alt="${item.name}" onerror="handleImageError(this)">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">GH₵${item.price.toFixed(2)} each</div>
      </div>
      <div class="cart-item-qty">
        <button onclick="cartQtyChange('${item.id}', -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="cartQtyChange('${item.id}', 1)">+</button>
      </div>
      <div class="cart-item-subtotal">GH₵${(item.price * item.qty).toFixed(2)}</div>
      <button class="btn-danger" onclick="cartRemove('${item.id}')">Remove</button>
    </div>`,
    )
    .join("");
}

function renderOrderSummary() {
  const { subtotal, shipping, total } = getCartTotals();
  const subtotalEl = document.getElementById("summary-subtotal");
  const shippingEl = document.getElementById("summary-shipping");
  const totalEl = document.getElementById("summary-total");
  if (subtotalEl) subtotalEl.textContent = `GH₵${subtotal.toFixed(2)}`;
  if (shippingEl)
    shippingEl.textContent =
      shipping === 0 ? "Free" : `GH₵${shipping.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `GH₵${total.toFixed(2)}`;
}

function cartQtyChange(id, delta) {
  updateQty(id, delta);
  renderCartItems();
  renderOrderSummary();
}

function cartRemove(id) {
  removeFromCart(id);
  renderCartItems();
  renderOrderSummary();
  showToast("Item removed from cart.", "error");
}

function initCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const valid = validateCheckoutForm(form);
    if (valid) {
      const cart = getCart();
      if (cart.length === 0) {
        showToast("Your cart is empty!", "error");
        return;
      }
      const orderId =
        "G63-" + Math.random().toString(36).substr(2, 8).toUpperCase();
      clearCart();
      const modal = document.getElementById("order-modal");
      document.getElementById("modal-order-id").textContent = orderId;
      if (modal) modal.classList.add("open");
    }
  });
}

function validateCheckoutForm(form) {
  let valid = true;
  const fields = [
    {
      id: "cf-name",
      rule: (v) => v.trim().length >= 2,
      msg: "Please enter your full name.",
    },
    {
      id: "cf-email",
      rule: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      msg: "Enter a valid email address.",
    },
    {
      id: "cf-phone",
      rule: (v) => /^[\d\s\+\-\(\)]{7,15}$/.test(v.trim()),
      msg: "Enter a valid phone number.",
    },
    {
      id: "cf-address",
      rule: (v) => v.trim().length >= 8,
      msg: "Please enter your full address.",
    },
  ];
  fields.forEach(({ id, rule, msg }) => {
    const input = document.getElementById(id);
    const errEl = document.getElementById(`${id}-err`);
    if (!input) return;
    const isValid = rule(input.value);
    input.classList.toggle("error", !isValid);
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.toggle("show", !isValid);
    }
    if (!isValid) valid = false;
  });
  return valid;
}

function closeOrderModal() {
  document.getElementById("order-modal").classList.remove("open");
  renderCartItems();
  renderOrderSummary();
  document.getElementById("checkout-form").reset();
}

// =============================================
// CONTACT PAGE
// =============================================
function initContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const valid = validateContactForm(form);
    if (valid) {
      showToast("Message sent! We'll get back to you soon. 🥳");
      form.reset();
      clearContactErrors(form);
    }
  });
}

function validateContactForm(form) {
  let valid = true;
  const fields = [
    {
      id: "ct-name",
      rule: (v) => v.trim().length >= 2,
      msg: "Please enter your name.",
    },
    {
      id: "ct-email",
      rule: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      msg: "Enter a valid email address.",
    },
    {
      id: "ct-subject",
      rule: (v) => v.trim().length >= 3,
      msg: "Please enter a subject.",
    },
    {
      id: "ct-message",
      rule: (v) => v.trim().length >= 15,
      msg: "Message must be at least 15 characters.",
    },
  ];
  fields.forEach(({ id, rule, msg }) => {
    const input = document.getElementById(id);
    const errEl = document.getElementById(`${id}-err`);
    if (!input) return;
    const isValid = rule(input.value);
    input.classList.toggle("error", !isValid);
    if (errEl) {
      errEl.textContent = msg;
      errEl.classList.toggle("show", !isValid);
    }
    if (!isValid) valid = false;
    else {
      input.classList.remove("error");
      if (errEl) errEl.classList.remove("show");
    }
  });
  return valid;
}

function clearContactErrors(form) {
  form
    .querySelectorAll(".field-error")
    .forEach((e) => e.classList.remove("show"));
  form
    .querySelectorAll(".form-control")
    .forEach((e) => e.classList.remove("error"));
}
