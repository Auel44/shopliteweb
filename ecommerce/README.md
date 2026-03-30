# ecommerce-website
# ShopLite Backend — Node.js + MySQL
**Group 63 | Full REST API with Admin Portal**

---

## 📁 Project Structure

```
shoplite-backend/
├── config/
│   └── db.js                  # MySQL connection pool
├── controllers/
│   ├── authController.js      # Register, login, getMe
│   ├── productController.js   # CRUD products
│   ├── orderController.js     # Place orders, list, update status
│   ├── contactController.js   # Contact form + admin inbox
│   └── adminController.js     # Dashboard stats, user management
├── middleware/
│   ├── auth.js                # JWT protect / adminOnly / optionalAuth
│   └── validate.js            # express-validator error handler
├── routes/
│   ├── auth.js
│   ├── products.js
│   ├── orders.js
│   ├── contact.js
│   └── admin.js
├── sql/
│   └── schema.sql             # Database schema + seed data
├── server.js                  # Express entry point
├── package.json
├── .env.example
│
│── (copy these into your frontend project's js/ folder)
├── api.js                     # Frontend ↔ Backend bridge
├── auth.js                    # Updated auth.js (uses backend)
├── cart-patch.js              # Overrides checkout to POST to API
│
└── admin.html                 # ← Copy to your frontend root folder
```

---

## ⚡ Quick Setup

### 1. Install MySQL & create database
```bash
mysql -u root -p < sql/schema.sql
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
# Edit .env — set DB_PASSWORD, JWT_SECRET, ALLOWED_ORIGINS
```

### 4. Start the server
```bash
npm run dev      # development (nodemon auto-reload)
npm start        # production
```

API will be live at: **http://localhost:5000/api**

---

## 🔗 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, get JWT |
| GET | `/api/auth/me` | 🔒 User | Current user info |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | — | List all (filter: `?cat=electronics&search=watch&featured=true`) |
| GET | `/api/products/:id` | — | Single product |
| POST | `/api/products` | 🔒 Admin | Create product |
| PUT | `/api/products/:id` | 🔒 Admin | Update product |
| DELETE | `/api/products/:id` | 🔒 Admin | Delete product |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | Optional | Place order (guest or logged-in) |
| GET | `/api/orders` | 🔒 User | My orders |
| GET | `/api/orders/all` | 🔒 Admin | All orders (`?status=pending`) |
| GET | `/api/orders/:ref` | — | Lookup by order reference |
| PATCH | `/api/orders/:id/status` | 🔒 Admin | Update order status |

### Contact
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/contact` | — | Submit contact form |
| GET | `/api/contact` | 🔒 Admin | List messages (`?is_read=false`) |
| PATCH | `/api/contact/:id/read` | 🔒 Admin | Mark as read |
| DELETE | `/api/contact/:id` | 🔒 Admin | Delete message |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | 🔒 Admin | Dashboard stats + charts |
| GET | `/api/admin/users` | 🔒 Admin | All users (`?search=`) |
| PATCH | `/api/admin/users/:id/role` | 🔒 Admin | Promote / demote user |

---

## 🖥️ Frontend Integration

### 1. Add `api.js` to every HTML page — FIRST, before other scripts
```html
<script src="js/api.js"></script>
<script src="js/data.js"></script>
<script src="js/cart.js"></script>
<script src="js/main.js"></script>
```

### 2. Replace `js/auth.js` with the new `auth.js` from this folder

### 3. Add `cart-patch.js` at the bottom of `cart.html`'s script block
```html
<script src="js/api.js"></script>
...
<script src="js/main.js"></script>
<script src="js/cart-patch.js"></script>  ← add this last
```

### 4. Copy `admin.html` to your frontend root folder
Access it at: `admin.html` — protected by JWT role check.

### 5. Default admin credentials
```
Username : admin
Password : Admin@123
```
**⚠️ Change this immediately after first login via the Users tab.**

---

## 🔐 Security Features

- **bcryptjs** password hashing (12 rounds)
- **JWT** authentication with expiry
- **helmet** HTTP security headers
- **CORS** restricted to allowed origins
- **express-rate-limit** — 300 req/15min global, 30 req/15min on auth
- **express-validator** input validation on all routes
- **SQL parameterised queries** — no SQL injection possible
- **Role-based access** — admin routes return 403 for non-admins
- **Transaction rollback** on failed orders (stock never deducted on error)

---

## 🔄 Switching from localStorage to the Backend

Your existing `data.js` and `cart.js` still work for the cart UI. The backend takes over for:

| Feature | Before | After |
|---------|--------|-------|
| Register/Login | localStorage `shopLiteUsers` | MySQL `users` table + JWT |
| Place Order | Shows modal only | POST to `/api/orders`, saves to DB |
| Contact Form | No storage | POST to `/api/contact`, saved to DB |
| Products | Hardcoded `data.js` | Served from `/api/products` (MySQL) |
| Admin | None | `admin.html` full portal |
