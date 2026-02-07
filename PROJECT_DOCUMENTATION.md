# GrapeMaster – Project Documentation

**Full functionality reference, setup, and how-to guide.**

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Functionality Present in the Project](#3-functionality-present-in-the-project)
4. [Project Structure](#4-project-structure)
5. [Setup Guide](#5-setup-guide)
6. [Environment Variables](#6-environment-variables)
7. [How to Run (Development & Production)](#7-how-to-run-development--production)
8. [How to Use – Customer (Frontend)](#8-how-to-use--customer-frontend)
9. [How to Use – Admin](#9-how-to-use--admin)
10. [Deployment](#10-deployment)
11. [API Overview](#11-api-overview)

---

## 1. Project Overview

**GrapeMaster** is a full-stack e-commerce web app for selling premium fresh grapes. It includes:

- **Customer site**: Browse products, cart, checkout, orders, profile, password reset.
- **Admin panel**: Products, orders, users, dealer requests, settings, image uploads.
- **Backend API**: REST API with JWT auth, MongoDB, Stripe payments, Resend/Nodemailer emails.

**Live URLs (example):**

- Frontend: `https://grape-master.vercel.app`
- Backend: `https://grapemasterweb.onrender.com`

---

## 2. Tech Stack

| Layer    | Technology |
|----------|------------|
| Frontend | React 18, Vite, React Router, TailwindCSS, Framer Motion, Lucide icons, Axios, Sonner (toast) |
| Backend  | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth     | JWT (access + refresh for users; admin token for admin) |
| Payment  | Stripe (test/live) |
| Email    | Resend (primary), Nodemailer (fallback) |
| File upload | Multer (server); images stored in `server/uploads/` |

---

## 3. Functionality Present in the Project

### 3.1 Customer (User) Features

| Feature | Description |
|--------|--------------|
| **Home** | Hero, categories, featured products, search and category filter, promo section. |
| **Auth** | Sign up (name, mobile, email optional, password), login (mobile + password), logout. |
| **Password reset** | Forgot password (email) → reset link email → set new password (token in URL). |
| **Products** | List from API, filter by category and search, product detail page (image, price, add to cart, wishlist). |
| **Wishlist** | Toggle wishlist on product cards (stored in localStorage). |
| **Cart** | Add/update/remove items, cart drawer, persist in backend when logged in. |
| **Checkout** | Address selection/add, order summary, delivery charge, payment method: **Stripe** or **COD**. |
| **Orders** | My orders in Profile; view status, items, cancel (if allowed by settings). |
| **Profile** | View/edit name, mobile, email; addresses (add/edit); orders tab; payments tab; logout. |
| **Be a Dealer** | Public form to submit dealer/distributor interest; admin reviews in Admin → Dealer Requests. |

### 3.2 Admin Features

| Feature | Description |
|--------|-------------|
| **Admin auth** | Login (email + password), forgot password, reset password (email link). |
| **Dashboard** | Stats (revenue, orders, users, products), charts, recent orders. |
| **Products** | List, add, edit, delete, toggle active; bulk delete/update; image upload (single image per product). |
| **Orders** | List, filter by status, view detail, approve/reject, update status, delete. Order emails (placed, approved, rejected, status update). |
| **Users** | List users, view detail, enable/disable user. |
| **Dealer requests** | List dealer applications, view detail, approve/reject with note. |
| **Settings** | Key-value settings: e.g. `freeDeliveryThreshold`, `defaultDeliveryCharge`, `orderCancellationEnabled`, `orderCancellationDays`, `adminEmail`, company info (`companyName`, `companyAddress`, `companyPhone`, `companyEmail`) for emails. |
| **Image upload** | POST image to `/api/admin/upload`; used when creating/editing products. |

### 3.3 Backend (API) Features

| Area | Description |
|------|-------------|
| **Users** | Register, login, refresh token, profile CRUD, addresses, forgot/reset password (email). |
| **Cart** | Get, add, update quantity, remove (per product). |
| **Orders** | Create order, list user orders, get by ID, cancel (if allowed). |
| **Payments** | Create Stripe checkout session, webhook for payment success/failure; COD supported. |
| **Admin** | Login, seed initial admin, forgot/reset password; protected admin routes. |
| **Admin products** | CRUD, toggle active, bulk delete/update; categories from DB. |
| **Admin orders** | List, get, update status, approve, reject, delete; send emails. |
| **Admin settings** | Get all, get by key (public for some keys), create, update. |
| **Dealer** | Public submit; admin list/update status. |
| **Upload** | Single image upload (admin only), stored in `server/uploads/`, served at `/uploads/:filename`. |
| **Email** | User welcome, password reset, order placed/approved/rejected/status, admin reset; Resend or Nodemailer. |

---

## 4. Project Structure

```
Grape-Master/
├── client/                 # React frontend (Vite)
│   ├── public/
│   │   ├── logo.png       # Favicon
│   ├── src/
│   │   ├── components/     # Layout, cart, home, product, admin, ui
│   │   ├── config/        # env.js (API URL, Stripe key)
│   │   ├── constants/     # config.js, categories.js
│   │   ├── context/       # AuthContext
│   │   ├── hooks/         # useCart, useWishlist, useLocalStorage
│   │   ├── pages/         # Home, Login, Signup, Profile, Checkout, Admin pages…
│   │   ├── services/      # api.js, auth, cart, order, product, upload, payment…
│   │   ├── styles/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── server/                 # Node.js backend (Express)
│   ├── uploads/            # Uploaded images (created at runtime; .gitkeep in repo)
│   ├── src/
│   │   ├── config/         # db.js, env.js, payment.js
│   │   ├── middlewares/    # auth, admin, upload, error, validate
│   │   ├── modules/
│   │   │   ├── user/       # user, cart, order, payment
│   │   │   ├── admin/      # admin auth, product, order, settings
│   │   │   ├── dealer/
│   │   │   └── upload/
│   │   ├── utils/          # email, orderEmail, stripe, logger, constants
│   │   ├── app.js
│   │   ├── routes.js
│   │   └── server.js
│   ├── scripts/            # seedAdmin, resetDatabase
│   ├── .env.example
│   └── package.json
│
├── README.md
└── PROJECT_DOCUMENTATION.md  # This file
```

---

## 5. Setup Guide

### Prerequisites

- **Node.js** v16 or higher
- **npm** (or yarn)
- **MongoDB** (local or MongoDB Atlas)
- **Git**

### Step 1: Clone the repository

```bash
git clone https://github.com/Nikhilw101/GrapeMasterWeb.git
cd GrapeMasterWeb
```

### Step 2: Backend (server)

```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:

- `MONGODB_URI` – your MongoDB connection string
- `JWT_SECRET`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` – strong random strings
- `FRONTEND_URL` – e.g. `http://localhost:5173` for local frontend
- (Optional) `RESEND_API_KEY`, `STRIPE_SECRET_KEY`, `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD` for emails, payments, and first admin

Create initial admin (once, when no admins exist):

```bash
# From server folder – either run the seed script or call POST /api/admin/seed
node scripts/seedAdmin.js
# Or use API: POST /api/admin/seed with body from .env (INITIAL_ADMIN_*)
```

Start server:

```bash
npm run dev
# Backend runs at http://localhost:5001 (or PORT in .env)
```

### Step 3: Frontend (client)

Open a new terminal:

```bash
cd client
npm install
cp .env.example .env
```

Edit `client/.env`:

- `VITE_API_BASE_URL` – backend API base, e.g. `http://localhost:5001/api`
- (Optional) `VITE_STRIPE_PUBLISHABLE_KEY` – for Stripe checkout

Start frontend:

```bash
npm run dev
# Frontend runs at http://localhost:5173 (or port shown in terminal)
```

### Step 4: Verify

- Open `http://localhost:5173` → home page, products.
- Sign up / Log in → profile, cart, checkout.
- Open `http://localhost:5173/admin/login` → log in with initial admin → dashboard, products, orders.

---

## 6. Environment Variables

### Client (`client/.env`)

| Variable | Description | Example (local) |
|----------|-------------|------------------|
| `VITE_API_BASE_URL` | Backend API base URL (must end with `/api`) | `http://localhost:5001/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for checkout | `pk_test_...` |

**Production (e.g. Vercel):** Set `VITE_API_BASE_URL=https://grapemasterweb.onrender.com/api` (and your Stripe key) in the hosting dashboard.

### Server (`server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes (or use default 5000) |
| `NODE_ENV` | `development` or `production` | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_ACCESS_SECRET` | Access token secret | Yes |
| `JWT_REFRESH_SECRET` | Refresh token secret | Yes |
| `FRONTEND_URL` | Frontend origin (for emails & Stripe redirects) | Yes |
| `RESEND_API_KEY` | Resend API key for emails | For email |
| `EMAIL_FROM` | Sender email (e.g. Resend) | For email |
| `STRIPE_SECRET_KEY` | Stripe secret key | For Stripe |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | For webhook |
| `INITIAL_ADMIN_EMAIL` | First admin email (seed only) | For seed |
| `INITIAL_ADMIN_PASSWORD` | First admin password (seed only) | For seed |
| `ADMIN_EMAIL` | Fallback admin email (notifications) | Optional |
| `COMPANY_NAME`, `COMPANY_ADDRESS`, etc. | Fallback for email footer | Optional |
| `DEFAULT_DELIVERY_CHARGE` | Default delivery charge | Yes |
| `NODEMAILER_*` | Fallback SMTP for email | Optional |

Optional overrides (default = `FRONTEND_URL` + path):

- `RESET_PASSWORD_URL`
- `ADMIN_RESET_PASSWORD_URL`
- `PAYMENT_SUCCESS_URL`
- `PAYMENT_CANCEL_URL`

---

## 7. How to Run (Development & Production)

### Development

- **Backend:** `cd server && npm run dev` (nodemon)
- **Frontend:** `cd client && npm run dev` (Vite)
- Use `FRONTEND_URL=http://localhost:5173` and `VITE_API_BASE_URL=http://localhost:5001/api` for local.

### Production build

- **Frontend:** `cd client && npm run build` → output in `client/dist`. Serve as static site (e.g. Vercel).
- **Backend:** `cd server && npm start` (e.g. `node src/server.js`). Set `NODE_ENV=production` and all env vars.

---

## 8. How to Use – Customer (Frontend)

### 8.1 Browsing and search

- **Home:** Scroll hero, categories, “Fresh This Week” products. Use search (header, sm and up) and category chips to filter.
- **Product detail:** Click a product → `/product/:id` → view image, price, description; **Add to Cart**, wishlist heart.

### 8.2 Account

- **Sign up:** Footer or nav → Sign up → name, mobile (10 digits), optional email, password (min 6) → Create Account.
- **Login:** Mobile + password → Sign In. After login, header shows user and cart; bottom nav shows Profile/Orders.
- **Forgot password:** Login page → Forgot password? → enter email → check email → open link → Set new password.

### 8.3 Cart and checkout

- **Cart:** Click cart icon → drawer with items, quantity, remove, subtotal. **Proceed to Checkout** (redirects to login if not logged in).
- **Checkout:** Select or add address; choose **Stripe** or **COD**; place order. Stripe opens payment; after success → Payment Success page; cancel → Payment Cancel page.

### 8.4 Profile and orders

- **Profile:** Nav → Profile (or bottom nav). Tabs: Profile (edit name, mobile, email; manage addresses), Orders (list, status, cancel if allowed), Payments.
- **Orders:** In Profile → Orders. View order ID, date, status, items, total; cancel if within settings (cancellation window and enabled).

### 8.5 Be a Dealer

- **Be a Dealer:** Link in nav/footer → fill form (name, contact, etc.) → submit. Admin sees it under Admin → Dealer Requests.

---

## 9. How to Use – Admin

### 9.1 Access

- **URL:** `https://your-frontend.com/admin/login` (e.g. `https://grape-master.vercel.app/admin/login`).
- **Footer:** Subtle “Portal” link in footer also goes to admin login.
- **Login:** Email + password (created via seed or existing admin).

### 9.2 Dashboard

- Overview: revenue, orders, users, products; charts; recent orders. Use sidebar to go to Products, Orders, Users, Dealer Requests, Settings.

### 9.3 Products

- **List:** View all products (with active/inactive).
- **Add:** Click Add Product → name, description, price, category, image (upload), stock, unit, origin, grade → Save.
- **Edit:** Open product → Edit → change fields and/or image → Update.
- **Delete / Toggle active:** Use row actions or bulk actions.
- **Image:** Use “Upload” when adding/editing; file is sent to `/api/admin/upload` and URL is set on the product.

### 9.4 Orders

- **List:** Filter by status; pagination.
- **Detail:** Open order → view customer, items, status, payment.
- **Actions:** Approve, Reject (with note), Update status. Customer receives emails (e.g. approved/rejected/status).

### 9.5 Users

- **List:** See users; enable/disable; view detail.

### 9.6 Dealer requests

- **List:** See dealer applications; open → Approve/Reject with note.

### 9.7 Settings

- Edit key-value settings, e.g.:
  - `freeDeliveryThreshold`, `defaultDeliveryCharge`
  - `orderCancellationEnabled`, `orderCancellationDays`
  - `adminEmail`
  - `companyName`, `companyAddress`, `companyPhone`, `companyEmail` (used in emails)

### 9.8 Admin password

- **Forgot:** Admin login → Forgot password? → email → reset link.
- **Reset:** Open link from email → set new password.

---

## 10. Deployment

### Frontend (e.g. Vercel)

1. Connect repo; set **Root Directory** to `client`.
2. Build: `npm run build`; output: `dist`.
3. Set env: `VITE_API_BASE_URL=https://grapemasterweb.onrender.com/api`, `VITE_STRIPE_PUBLISHABLE_KEY=pk_...`.
4. Deploy. SPA routing is handled by `client/vercel.json` (rewrites to `index.html`).

### Backend (e.g. Render)

1. New Web Service; connect repo; set **Root Directory** to `server`.
2. Build: `npm install`; start: `npm start` (or `node src/server.js`).
3. Set env in Render dashboard: `NODE_ENV=production`, `MONGODB_URI`, `JWT_*`, `FRONTEND_URL=https://grape-master.vercel.app`, `RESEND_*`, `STRIPE_*`, `INITIAL_ADMIN_*`, etc. **Do not** commit `.env`; use Render’s Environment.
4. **Stripe webhook:** In Stripe dashboard set webhook URL to `https://grapemasterweb.onrender.com/api/payments/webhook`; put signing secret in `STRIPE_WEBHOOK_SECRET`.

### Email links in production

- Set **FRONTEND_URL** on the server to the live frontend (e.g. `https://grape-master.vercel.app`) so password reset and order emails use correct links (not localhost).

### Image upload on Render

- Uploads use `server/uploads/` with an absolute path (see `server/src/middlewares/upload.middleware.js`). Folder is created if missing. Render’s disk is ephemeral (uploads lost on redeploy); for persistence use a store like S3 or Cloudinary later.

---

## 11. API Overview

Base path: `/api` (e.g. `http://localhost:5001/api`).

| Area | Methods | Path (examples) | Auth |
|------|---------|------------------|------|
| Users | POST | `/users/register`, `/users/login` | Public |
| Users | GET/PUT | `/users/profile`, `/users/address` | User JWT |
| Users | POST | `/users/forgot-password`, `/users/reset-password` | Public |
| Cart | GET, POST, PUT, DELETE | `/cart`, `/cart/:productId` | User JWT |
| Orders | POST, GET | `/orders`, `/orders/:orderId` | User JWT |
| Payments | POST | `/payments/create-checkout-session`, `/payments/webhook` | User / Webhook |
| Admin | POST | `/admin/login`, `/admin/seed`, `/admin/forgot-password`, `/admin/reset-password` | Public / Admin |
| Admin | GET | `/admin/dashboard`, `/admin/orders`, `/admin/users`, etc. | Admin JWT |
| Products (read) | GET | `/admin/products`, `/admin/products/:id` | Public |
| Products (write) | POST, PUT, DELETE, PATCH | `/admin/products`, `/admin/products/:id` | Admin JWT |
| Settings | GET | `/admin/settings/:key` (some keys public) | Public / Admin |
| Settings | GET, POST, PUT | `/admin/settings` | Admin JWT |
| Upload | POST | `/admin/upload` (multipart, field `image`) | Admin JWT |
| Dealer | POST | `/dealer-requests` | Public |
| Dealer | GET, PUT | `/admin/dealer-requests`, `/admin/dealer-requests/:id` | Admin JWT |

Static uploads: `GET /uploads/:filename` (e.g. `https://api.example.com/uploads/abc.jpg`).

---

**End of documentation.** For API details (request/response shapes), see `server/src/docs/API_DOCUMENTATION.md` (if present) or the source in `server/src/modules` and `server/src/routes.js`.
