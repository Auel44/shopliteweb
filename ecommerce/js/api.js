
const API_BASE = "https://shopliteweb.onrender.com/api";

const Auth = {
  getToken:   () => localStorage.getItem("sl_token"),
  getUser:    () => JSON.parse(localStorage.getItem("sl_user") || "null"),
  isLoggedIn: () => !!localStorage.getItem("sl_token"),
  isAdmin:    () => Auth.getUser()?.role === "admin",

  save(token, user) {
    localStorage.setItem("sl_token", token);
    localStorage.setItem("sl_user", JSON.stringify(user));
    localStorage.setItem("shopLiteSession", JSON.stringify({ username: user.username, email: user.email }));
  },

  clear() {
    ["sl_token", "sl_user", "shopLiteSession"].forEach(k => localStorage.removeItem(k));
  },
};
async function apiFetch(endpoint, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token   = Auth.getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res  = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

// ── Auth API ─────────────────────────────────────────────
const AuthAPI = {
  async register({ username, email, password }) {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
    Auth.save(data.token, data.user);
    return data;
  },
  async login({ username, password }) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    Auth.save(data.token, data.user);
    return data;
  },
  logout() {
    Auth.clear();
    window.location.href = "index.html";
  },
};

// ── Products API ─────────────────────────────────────────
const ProductsAPI = {
  getAll({ cat, search, featured } = {}) {
    const p = new URLSearchParams();
    if (cat && cat !== "all") p.set("cat", cat);
    if (search)   p.set("search", search);
    if (featured) p.set("featured", "true");
    const qs = p.toString();
    return apiFetch(`/products${qs ? "?" + qs : ""}`);
  },
  getOne: (id)  => apiFetch(`/products/${id}`),
  create: (body) => apiFetch("/products", { method: "POST", body: JSON.stringify(body) }),
  update: (id, body) => apiFetch(`/products/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  remove: (id)  => apiFetch(`/products/${id}`, { method: "DELETE" }),
};

// ── Orders API ───────────────────────────────────────────
const OrdersAPI = {
  place(delivery, items) {
    return apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({ ...delivery, items }),
    });
  },
  getMyOrders:  ()    => apiFetch("/orders"),
  getAllOrders:  (qs)  => apiFetch(`/orders/all${qs ? "?" + qs : ""}`),
  getByRef:     (ref) => apiFetch(`/orders/${ref}`),
  updateStatus: (id, status) => apiFetch(`/orders/${id}/status`, {
    method: "PATCH", body: JSON.stringify({ status }),
  }),
};

// ── Contact API ──────────────────────────────────────────
const ContactAPI = {
  send: (body) => apiFetch("/contact", { method: "POST", body: JSON.stringify(body) }),
  getAll:   (qs) => apiFetch(`/contact${qs ? "?" + qs : ""}`),
  markRead: (id) => apiFetch(`/contact/${id}/read`, { method: "PATCH" }),
  remove:   (id) => apiFetch(`/contact/${id}`, { method: "DELETE" }),
};

// ── Admin API ────────────────────────────────────────────
const AdminAPI = {
  getStats: ()    => apiFetch("/admin/stats"),
  getUsers: (qs)  => apiFetch(`/admin/users${qs ? "?" + qs : ""}`),
  setRole:  (id, role) => apiFetch(`/admin/users/${id}/role`, {
    method: "PATCH", body: JSON.stringify({ role }),
  }),
};
document.addEventListener("DOMContentLoaded", () => {
  const loginLink = document.querySelector('a[href="auth.html"]');
  if (Auth.isLoggedIn()) {
    const nav = document.querySelector(".nav-links");
    const user = Auth.getUser();

    // 1. Update Profile/Logout Link
    if (loginLink) {
      loginLink.textContent = `👤 ${user.username}`;
      loginLink.href = "#";
      loginLink.title = "Click to log out";
      loginLink.addEventListener("click", e => {
        e.preventDefault();
        if (confirm("Are you sure you want to log out of ShopLite? We'll miss you! 🤝")) AuthAPI.logout();
      });
    }

    // 2. Add "Orders" link to Header
    if (nav && !document.querySelector(".nav-orders-link")) {
      const li = document.createElement("li");
      li.innerHTML = `<a href="orders.html" class="nav-orders-link">Orders</a>`;
      // Insert before the last item (usually Auth link) or just append
      nav.appendChild(li);
    }
    
    // 3. Update Mobile Menu
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu && !document.querySelector(".mobile-orders-link")) {
      const a = document.createElement("a");
      a.href = "orders.html";
      a.className = "mobile-orders-link";
      a.textContent = "📑 My Orders";
      mobileMenu.appendChild(a);
    }
  }

  // 4. Update Footer "My Orders" link
  document.querySelectorAll('a[href="#"]').forEach(link => {
    if (link.textContent.trim() === "My Orders") {
      link.href = "orders.html";
    }
  });
  if (Auth.isAdmin()) {
    const nav = document.querySelector(".nav-links");
    if (nav && !document.querySelector(".nav-admin-link")) {
      const li = document.createElement("li");
      li.innerHTML = `<a href="admin.html" class="nav-admin-link" style="color:var(--clr-accent)">⚙️ Admin</a>`;
      nav.appendChild(li);
    }
  }
});