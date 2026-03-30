/* ============================================================
   auth.js — Login & Sign Up logic for ShopLite
   ============================================================ */

/* ── Tab Switcher ── */
function switchTab(tab) {
  const tabs = document.querySelectorAll(".auth-tab");
  const panels = document.querySelectorAll(".auth-panel");

  tabs.forEach((t) => {
    t.classList.remove("active");
    t.setAttribute("aria-selected", "false");
  });
  panels.forEach((p) => p.classList.remove("active"));

  document.getElementById("tab-" + tab).classList.add("active");
  document.getElementById("tab-" + tab).setAttribute("aria-selected", "true");
  document.getElementById("panel-" + tab).classList.add("active");

  // Clear alerts when switching tabs
  hideAlert("login-alert");
  hideAlert("signup-alert");
}

/* ── Terms & Privacy Modal Logic ── */
const modalContent = {
  terms: {
    title: "Terms of Service",
    body: `
      <h3>1. Acceptance of Terms</h3>
      <p>By accessing or using ShopLite, you agree to be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
      
      <h3>2. User Accounts</h3>
      <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
      
      <h3>3. Prohibited Activities</h3>
      <p>You may not use our service for any illegal or unauthorized purpose. You must not transmit any worms, viruses, or any code of a destructive nature.</p>
      
      <h3>4. Changes to Terms</h3>
      <p>We reserve the right to modify these terms at any time. Your continued use of the site constitutes acceptance of new terms.</p>
    `
  },
  privacy: {
    title: "Privacy Policy",
    body: `
      <h3>1. Information We Collect</h3>
      <p>We collect information you provide directly to us when you create an account, make a purchase, or communicate with us.</p>
      
      <h3>2. How We Use Information</h3>
      <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and send you technical notices.</p>
      
      <h3>3. Data Security</h3>
      <p>We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.</p>
      
      <h3>4. Your Choices</h3>
      <p>You may update your account information at any time by logging into your account settings.</p>
    `
  }
};

function showModal(type, e) {
  if (e) e.preventDefault();
  const modal = document.getElementById("terms-modal");
  const title = document.getElementById("modal-title");
  const body = document.getElementById("modal-body");
  const content = modalContent[type];

  if (content) {
    title.textContent = content.title;
    body.innerHTML = content.body;
    modal.classList.add("open");
    document.body.style.overflow = "hidden"; // Prevent scrolling
  }
}

function closeModal() {
  const modal = document.getElementById("terms-modal");
  modal.classList.remove("open");
  document.body.style.overflow = "";
}

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  const modal = document.getElementById("terms-modal");
  if (e.target === modal) closeModal();
});

/* ── Password Visibility Toggle ── */
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const isHidden = input.type === "password";
  input.type = isHidden ? "text" : "password";

  // Swap icon
  btn.innerHTML = isHidden
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
         <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
         <line x1="1" y1="1" x2="23" y2="23"/>
       </svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
         <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
         <circle cx="12" cy="12" r="3"/>
       </svg>`;
  btn.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
}

/* ── Password Strength Checker ── */
function checkStrength(value) {
  const bar = document.getElementById("pw-strength");
  const fill = document.getElementById("strength-fill");
  const label = document.getElementById("strength-label");

  if (!value) {
    bar.classList.remove("show");
    return;
  }
  bar.classList.add("show");

  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[A-Z]/.test(value)) score++;
  if (/[0-9]/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value)) score++;

  const levels = [
    { pct: "20%", color: "#ef4444", text: "Very Weak" },
    { pct: "40%", color: "#f97316", text: "Weak" },
    { pct: "60%", color: "#eab308", text: "Fair" },
    { pct: "80%", color: "#22c55e", text: "Strong" },
    { pct: "100%", color: "#16a34a", text: "Very Strong" },
  ];

  const level = levels[Math.max(0, Math.min(score - 1, 4))];
  fill.style.width = level.pct;
  fill.style.background = level.color;
  label.textContent = level.text;
  label.style.color = level.color;
}

/* ── Validation Helpers ── */
function showError(inputId, errId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  input.classList.add("error");
  err.classList.add("show");
}

function clearError(inputId, errId) {
  const input = document.getElementById(inputId);
  const err = document.getElementById(errId);
  input.classList.remove("error");
  err.classList.remove("show");
}

function showAlert(alertId, message) {
  const el = document.getElementById(alertId);
  el.textContent = message;
  el.classList.add("show");
}

function hideAlert(alertId) {
  const el = document.getElementById(alertId);
  if (el) {
    el.textContent = "";
    el.classList.remove("show");
  }
}

function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.disabled = loading;
  if (loading) {
    btn._original = btn.innerHTML;
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;animation:spin 0.8s linear infinite"><path d="M12 2a10 10 0 0 1 0 20" /></svg> Please wait…';
  } else {
    btn.innerHTML = btn._original || btn.innerHTML;
  }
}

// Spin animation for loader
const spinStyle = document.createElement("style");
spinStyle.textContent = "@keyframes spin { to { transform: rotate(360deg); } }";
document.head.appendChild(spinStyle);

/* ── LOGIN FORM ── */
document.getElementById("login-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  hideAlert("login-alert");

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  let valid = true;

  // Validate username
  clearError("login-username", "login-username-err");
  if (!username) {
    showError("login-username", "login-username-err");
    valid = false;
  }

  // Validate password
  clearError("login-password", "login-password-err");
  if (!password) {
    showError("login-password", "login-password-err");
    valid = false;
  }

  if (!valid) return;

  setLoading("login-btn", true);

  try {
    const data = await AuthAPI.login(username, password);
    setLoading("login-btn", false);

    // Save session (Token and User Info)
    localStorage.setItem("shopLiteToken", data.token);
    localStorage.setItem("shopLiteSession", JSON.stringify(data.user));

    // Show success
    document.getElementById("login-form").style.display = "none";
    document.querySelector(".auth-tabs").style.display = "none";
    if (document.querySelector(".auth-divider")) document.querySelector(".auth-divider").style.display = "none";
    if (document.querySelector(".social-btns")) document.querySelector(".social-btns").style.display = "none";
    document.getElementById("login-success").classList.add("show");

    // Auto-redirect
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  } catch (err) {
    setLoading("login-btn", false);
    showAlert("login-alert", `⚠️ ${err.message || "Login failed. Please try again."}`);
  }
});

/* ── SIGN UP FORM ── */
document.getElementById("signup-form").addEventListener("submit", async function (e) {
  e.preventDefault();
  hideAlert("signup-alert");

  const username = document.getElementById("signup-username").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirm = document.getElementById("signup-confirm").value;
  const terms = document.getElementById("signup-terms").checked;

  let valid = true;

  // Form Validation
  clearError("signup-username", "signup-username-err");
  if (username.length < 3) { showError("signup-username", "signup-username-err"); valid = false; }

  clearError("signup-email", "signup-email-err");
  const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRx.test(email)) { showError("signup-email", "signup-email-err"); valid = false; }

  clearError("signup-password", "signup-password-err");
  if (password.length < 6) { showError("signup-password", "signup-password-err"); valid = false; }

  clearError("signup-confirm", "signup-confirm-err");
  if (password !== confirm) { showError("signup-confirm", "signup-confirm-err"); valid = false; }

  if (!terms) {
    showAlert("signup-alert", "⚠️ You must accept the Terms & Privacy Policy to continue.");
    valid = false;
  }

  if (!valid) return;

  setLoading("signup-btn", true);

  try {
    const data = await AuthAPI.register(username, email, password);
    setLoading("signup-btn", false);

    // Auto-login (Save session)
    localStorage.setItem("shopLiteToken", data.token);
    localStorage.setItem("shopLiteSession", JSON.stringify(data.user));

    // Show success
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("signup-success").classList.add("show");

    setTimeout(() => {
      window.location.href = "index.html";
    }, 2500);
  } catch (err) {
    setLoading("signup-btn", false);
    showAlert("signup-alert", `⚠️ ${err.message || "Registration failed. Please try again."}`);
  }
});

/* ── Clear errors on input ── */
["login-username", "login-password"].forEach((id) => {
  const el = document.getElementById(id);
  if (el)
    el.addEventListener("input", () => {
      clearError(id, id + "-err");
      hideAlert("login-alert");
    });
});

["signup-username", "signup-email", "signup-password", "signup-confirm"].forEach((id) => {
  const el = document.getElementById(id);
  if (el)
    el.addEventListener("input", () => {
      clearError(id, id + "-err");
      hideAlert("signup-alert");
    });
});

/* ── Forgot Password (placeholder) ── */
function showForgot(e) {
  e.preventDefault();
  showAlert(
    "login-alert",
    "ℹ️ Password reset is not available yet. Please contact support."
  );
  document.getElementById("login-alert").className = "form-alert show";
  document.getElementById("login-alert").style.background =
    "rgba(245, 166, 35, 0.1)";
  document.getElementById("login-alert").style.border =
    "1px solid rgba(245, 166, 35, 0.3)";
  document.getElementById("login-alert").style.color = "var(--clr-accent)";
}

/* ── Social Login (placeholder) ── */
function socialLogin(provider) {
  const endpoint = provider.toLowerCase();
  window.location.href = `https://shoplite-backend-rxpn.onrender.com/api/auth/${endpoint}`;
}
