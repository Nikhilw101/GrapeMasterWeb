# Grape Master Backend API

Complete backend API for Grape Master E-commerce Website built with Express.js, MongoDB, and JWT authentication.

## 🚀 Features

- **User Management**: Registration, login, profile management, address management
- **Product Management**: CRUD operations for grape products
- **Shopping Cart**: Add, update, remove items
- **Order Management**: Place orders, track status, payment integration
- **Payment Gateway**: PhonePe and UPI integration support
- **WhatsApp Notifications**: Automated order confirmations and admin alerts
- **Dealer/Distributor Module**: Enquiry form and management
- **Admin Dashboard**: Order management, product management, settings
- **Dynamic Settings**: Configurable delivery charges and app settings

## 📁 Project Structure

```
server/
├── src/
│   ├── config/           # Configuration files
│   ├── middlewares/      # Custom middlewares
│   ├── modules/          # Feature modules
│   │   ├── user/         # User module
│   │   └── admin/        # Admin module
│   ├── utils/            # Utility functions
│   ├── app.js            # Express app setup
│   ├── server.js         # Server entry point
│   └── routes.js         # Central route configuration
├── .env.example          # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## 🛠️ Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)

### Steps

1. **Clone the repository**
   ```bash
   cd server
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your values:
   - MongoDB connection string
   - JWT secret
   - PhonePe credentials
   - WhatsApp API credentials
   - Admin contact details

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the server**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret for JWT signing | Yes |
| `JWT_EXPIRE` | Token expiration time | Yes |
| `ADMIN_EMAIL` | Admin email address | Yes |
| `ADMIN_PHONE` | Admin phone number | Yes |
| `PHONEPE_MERCHANT_ID` | PhonePe merchant ID | No* |
| `PHONEPE_SALT_KEY` | PhonePe salt key | No* |
| `WHATSAPP_API_URL` | WhatsApp API endpoint | No* |
| `WHATSAPP_API_KEY` | WhatsApp API key | No* |
| `DEFAULT_DELIVERY_CHARGE` | Default delivery charge | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

*Required when implementing the respective features

## 🔌 API Endpoints

### User Routes

#### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login

#### Profile Management
- `GET /api/users/profile` - Get user profile (Protected)
- `PUT /api/users/profile` - Update profile (Protected)
- `POST /api/users/address` - Add address (Protected)
- `PUT /api/users/address/:addressId` - Update address (Protected)
- `DELETE /api/users/address/:addressId` - Delete address (Protected)

### Cart Routes
- `GET /api/cart` - Get cart (Protected)
- `POST /api/cart` - Add to cart (Protected)
- `PUT /api/cart/:productId` - Update quantity (Protected)
- `DELETE /api/cart/:productId` - Remove from cart (Protected)

### Order Routes
- `POST /api/orders` - Place order (Protected)
- `GET /api/orders` - Get user orders (Protected)
- `GET /api/orders/:orderId` - Get order details (Protected)
- `PUT /api/orders/:orderId/cancel` - Cancel order (Protected)

### Dealer Routes
- `POST /api/dealers` - Submit dealer enquiry (Public)
- `GET /api/dealers/:mobile` - Check enquiry status (Public)

### Product Routes (Public)
- `GET /api/admin/products` - Get all products
- `GET /api/admin/products/:id` - Get product by ID

### Admin Routes

#### Authentication
- `POST /api/admin/login` - Admin login

#### Dashboard
- `GET /api/admin/dashboard` - Get dashboard stats (Protected/Admin)

#### Product Management
- `POST /api/admin/products` - Create product (Protected/Admin)
- `PUT /api/admin/products/:id` - Update product (Protected/Admin)
- `DELETE /api/admin/products/:id` - Delete product (Protected/Admin)
- `PATCH /api/admin/products/:id/toggle` - Toggle status (Protected/Admin)

#### Order Management
- `GET /api/admin/orders` - Get all orders (Protected/Admin)
- `GET /api/admin/orders/:orderId` - Get order details (Protected/Admin)
- `PUT /api/admin/orders/:orderId/status` - Update order status (Protected/Admin)
- `PUT /api/admin/orders/:orderId/payment` - Update payment status (Protected/Admin)

#### Dealer Enquiries
- `GET /api/admin/orders/enquiries/all` - Get all enquiries (Protected/Admin)
- `PUT /api/admin/orders/enquiries/:id/status` - Update enquiry status (Protected/Admin)

#### Settings
- `GET /api/admin/settings` - Get all settings (Protected/Admin)
- `GET /api/admin/settings/:key` - Get setting by key (Public)
- `POST /api/admin/settings` - Create setting (Protected/Admin)
- `PUT /api/admin/settings/:key` - Update setting (Protected/Admin)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

## 📦 Product Data

Default products as per requirements:

| Product Name | Weight | Rate (₹) |
|--------------|--------|----------|
| Flame | 2kg | 450 |
| Mix | 2kg | 500 |
| Green Sonakha | 2kg | 400 |
| Black Jumbo | 2kg | 550 |
| Pomegranate | 2kg | 500 |

## 🔔 WhatsApp Integration

WhatsApp notifications are sent for:
1. **Order Confirmation** - Sent to customer after order placement
2. **Admin Notification** - Sent to admin for new orders
3. **Dealer Enquiry** - Sent to admin for new dealer/distributor enquiries

## 💳 Payment Integration

Supports:
- **UPI** - Direct UPI payments
- **PhonePe** - PhonePe payment gateway
- **COD** - Cash on delivery

## 🎯 Next Steps

1. **Configure `.env`** - Set up all environment variables
2. **Seed Products** - Add initial products to database
3. **Create Admin User** - Create admin account in database
4. **Implement PhonePe** - Complete PhonePe integration in `config/payment.js`
5. **Implement WhatsApp** - Complete WhatsApp API integration in `config/whatsapp.js`
6. **Test APIs** - Use Postman or similar tool to test endpoints

## 🗃️ Fresh deployment / database reset

1. **Optional – wipe all data** (use only when you want an empty DB):
   ```bash
   cd server
   RESET_DATABASE_CONFIRM=yes node scripts/resetDatabase.js
   ```

2. **Create first admin** (only when no admins exist; uses `.env` once):
   - **Option A:** `POST /api/admin/seed` (body empty; uses `INITIAL_ADMIN_EMAIL`, `INITIAL_ADMIN_PASSWORD`, etc. from `.env`)
   - **Option B:** `node scripts/seedAdmin.js` (same env vars)

3. **Login:** Use the email and password from step 2. All future logins are **database-only**; `.env` is not used for admin login after the first admin exists.

No hardcoded admin credentials remain in code. Optional cleanup of a legacy admin email: set `LEGACY_ADMIN_EMAIL_TO_REMOVE` in `.env` and run `node scripts/seedAdmin.js` to remove that account.

## 🧪 Testing

Use tools like:
- Postman
- Thunder Client (VS Code)
- Insomnia

Import the API collection and test all endpoints.

## 📄 License

This project is proprietary and confidential.

## 👥 Contact

For any queries:
- Email: satyajitshinde2103@gmail.com
- Phone: 9359516314
