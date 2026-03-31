
function initCheckoutForm() {
  const form = document.getElementById("checkout-form");
  if (!form) return;

  // 1. Auto-fill from session if logged in
  const session = JSON.parse(localStorage.getItem("shopLiteSession"));
  if (session) {
    const nameInput = document.getElementById("cf-name");
    const emailInput = document.getElementById("cf-email");
    if (nameInput && !nameInput.value) nameInput.value = session.username; // Note: if session has full mapping, use that
    if (emailInput && !emailInput.value) emailInput.value = session.email;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valid = validateCheckoutForm(form);
    if (!valid) return;

    const cart = getCart();
    if (cart.length === 0) { showToast("Your cart is empty!", "error"); return; }

    // Map cart → API format
    const items    = cart.map(i => ({ product_id: i.id, qty: i.qty }));
    
    // Concatenate address fields
    const street = document.getElementById("cf-street").value.trim();
    const city = document.getElementById("cf-city").value.trim();
    const state = document.getElementById("cf-state").value.trim();
    const zip = document.getElementById("cf-zip").value.trim();
    const country = document.getElementById("cf-country").value.trim();
    const fullAddress = `${street}, ${city}, ${state} ${zip}, ${country}`;

    const delivery = {
      full_name: document.getElementById("cf-name").value.trim(),
      email:     document.getElementById("cf-email").value.trim(),
      phone:     document.getElementById("cf-phone").value.trim(),
      address:   fullAddress,
    };

    const btn = document.getElementById("place-order-btn");
    btn.disabled    = true;
    const origText = btn.innerHTML;
    btn.innerHTML   = "â³ Placing order…";

    try {
      const data = await OrdersAPI.place(delivery, items);
      clearCart();

      document.getElementById("modal-order-id").textContent = data.order.order_ref;
      document.getElementById("order-modal").classList.add("open");
      renderCartItems();
      renderOrderSummary();
      form.reset();
    } catch (err) {
      showToast("âŒ " + err.message, "error");
    } finally {
      btn.disabled    = false;
      btn.innerHTML   = origText;
    }
  });
}

function validateCheckoutForm(form) {
  let valid = true;
  const fields = [
    { id: "cf-name", rule: v => v.trim().length >= 2, msg: "Name required." },
    { id: "cf-email", rule: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: "Invalid email." },
    { id: "cf-phone", rule: v => v.trim().length >= 7, msg: "Phone required." },
    { id: "cf-street", rule: v => v.trim().length >= 3, msg: "Street required." },
    { id: "cf-city", rule: v => v.trim().length >= 2, msg: "City required." },
    { id: "cf-state", rule: v => v.trim().length >= 2, msg: "State required." },
    { id: "cf-country", rule: v => v.trim().length >= 2, msg: "Country required." },
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

/* ── Updated contact form submission ── */
function initContact() {
  const form = document.getElementById("contact-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const valid = validateContactForm(form);
    if (!valid) return;

    const btn = document.getElementById("contact-submit-btn");
    const orig = btn.innerHTML;
    btn.disabled  = true;
    btn.innerHTML = "â³ Sending…";

    try {
      await ContactAPI.send({
        full_name: document.getElementById("ct-name").value.trim(),
        email:     document.getElementById("ct-email").value.trim(),
        subject:   document.getElementById("ct-subject").value.trim(),
        message:   document.getElementById("ct-message").value.trim(),
      });
      showToast("Message sent! We'll get back to you soon. 🎉");
      form.reset();
      clearContactErrors(form);
    } catch (err) {
      showToast("âŒ " + err.message, "error");
    } finally {
      btn.disabled  = false;
      btn.innerHTML = orig;
    }
  });
}
