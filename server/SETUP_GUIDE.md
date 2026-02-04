# SETUP GUIDE - Grape Master Backend

## Prerequisites Checklist
- [ ] Node.js v16+ installed
- [ ] MongoDB installed or MongoDB Atlas account
- [ ] Git initialized (optional)

## Step-by-Step Setup

### Step 1: Install Dependencies
```bash
npm install
```

Expected output: All packages installed successfully

### Step 2: Create .env File
```bash
# Copy the example file
copy .env.example .env
```

Then edit `.env` and fill in these required values:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/grapemaster  # or your MongoDB Atlas URI
JWT_SECRET=your_super_secret_key_minimum_32_characters_long
JWT_EXPIRE=7d
ADMIN_EMAIL=satyajitshinde2103@gmail.com
ADMIN_PHONE=9359516314
DEFAULT_DELIVERY_CHARGE=50
FRONTEND_URL=http://localhost:3000
```

### Step 3: Start MongoDB (if using local)
```bash
# Windows
mongod

# Mac/Linux
sudo mongod
```

### Step 4: Create Admin User
You'll need to create an admin user manually in MongoDB or create a seed script.

Option A - Using MongoDB Compass or Mongo Shell:
```javascript
db.admins.insertOne({
  name: "Admin",
  email: "satyajitshinde2103@gmail.com",
  mobile: "9359516314",
  password: "$2a$10$..." // Use bcrypt to hash your password
  role: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Option B - Create a seed script (recommended for next step)

### Step 5: Seed Initial Products
Create initial products in the database:

```javascript
db.products.insertMany([
  {
    name: "Flame",
    weight: "2kg",
    price: 450,
    description: "Premium quality flame grapes",
    stock: 100,
    category: "Grapes",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Mix",
    weight: "2kg",
    price: 500,
    description: "Mixed variety grapes",
    stock: 100,
    category: "Grapes",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Green Sonakha",
    weight: "2kg",
    price: 400,
    description: "Fresh green sonakha grapes",
    stock: 100,
    category: "Grapes",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Black Jumbo",
    weight: "2kg",
    price: 550,
    description: "Premium black jumbo grapes",
    stock: 100,
    category: "Grapes",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Pomegranate",
    weight: "2kg",
    price: 500,
    description: "Fresh pomegranates",
    stock: 100,
    category: "Fruits",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

### Step 6: Start the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

Expected output:
```
[INFO] 2024-XX-XX... - ✅ MongoDB Connected: localhost
[INFO] 2024-XX-XX... - 🚀 Server running in development mode on port 5000
```

### Step 7: Test the API
```bash
# Test health check
curl http://localhost:5000/health

# Expected response:
# {"success":true,"message":"Server is running","timestamp":"..."}
```

## Verification Checklist

- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] Health check endpoint works
- [ ] Can register a new user
- [ ] Can login with user credentials
- [ ] Can fetch products
- [ ] Admin can login
- [ ] Admin dashboard loads

## Testing with Postman/Thunder Client

### 1. Register User
POST `http://localhost:5000/api/users/register`
```json
{
  "name": "Test User",
  "mobile": "9876543210",
  "password": "test123"
}
```

### 2. Login User
POST `http://localhost:5000/api/users/login`
```json
{
  "mobile": "9876543210",
  "password": "test123"
}
```
Save the token from response!

### 3. Get Products
GET `http://localhost:5000/api/admin/products`

### 4. Get User Profile (Protected)
GET `http://localhost:5000/api/users/profile`
Headers: `Authorization: Bearer <your_token>`

## Common Issues & Solutions

### Issue: MongoDB Connection Error
**Solution**: 
- Check if MongoDB is running
- Verify MONGODB_URI in .env
- Check firewall settings

### Issue: Port Already in Use
**Solution**: 
- Change PORT in .env to different number (e.g., 5001)
- Or kill process using port 5000

### Issue: JWT Error
**Solution**: 
- Ensure JWT_SECRET is set in .env
- Make sure it's at least 32 characters long

### Issue: Module Not Found
**Solution**: 
- Delete node_modules folder
- Delete package-lock.json
- Run `npm install` again

## Next Steps After Setup

1. ✅ Implement PhonePe payment integration
2. ✅ Implement WhatsApp API integration
3. ✅ Create seed script for initial data
4. ✅ Add email notification system
5. ✅ Set up logging system (Winston/Morgan)
6. ✅ Add API rate limiting
7. ✅ Set up CORS properly for production
8. ✅ Add input sanitization
9. ✅ Set up unit tests
10. ✅ Deploy to production (Heroku, AWS, etc.)

## File Structure Overview

```
server/
├── src/
│   ├── config/          ← Database, Payment, WhatsApp configs
│   ├── middlewares/     ← Auth, Admin, Error, Validation
│   ├── modules/
│   │   ├── user/        ← User, Order, Cart, Dealer
│   │   └── admin/       ← Admin, Product, Settings
│   ├── utils/           ← Helpers, constants, logger
│   ├── docs/            ← API documentation
│   ├── app.js           ← Express app setup
│   ├── server.js        ← Entry point
│   └── routes.js        ← Central routing
├── .env                 ← Your environment variables
├── package.json
└── README.md
```

## Support

If you encounter any issues:
1. Check the error logs in console
2. Verify .env configuration
3. Review API documentation in `src/docs/API_DOCUMENTATION.md`
4. Check README.md for detailed information

---

**Happy Coding! 🚀**
