import axios from 'axios';
import { strict as assert } from 'assert';

const BASE_URL = 'http://localhost:5001';
const TIMESTAMP = Date.now();
const USER_EMAIL = `smoke_test_${TIMESTAMP}@example.com`;
const USER_PASSWORD = 'password123';
const USER_MOBILE = `9${Math.floor(100000000 + Math.random() * 900000000)}`; // Random 10 digit mobile starts with 9
const USER_NAME = 'Smoke Test User';

// Colors for console logging
const colors = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m"
};

const log = (step, info) => {
    console.log(`${colors.cyan}[${step}]${colors.reset} ${info}`);
};

const success = (msg) => {
    console.log(`${colors.green}✔ ${msg}${colors.reset}`);
};

const error = (msg, err) => {
    console.log(`${colors.red}✘ ${msg}${colors.reset}`);
    if (err.response) {
        console.log(`${colors.red}Status: ${err.response.status}${colors.reset}`);
        console.log(`${colors.red}Data: ${JSON.stringify(err.response.data, null, 2)}${colors.reset}`);
    } else {
        console.log(`${colors.red}${err.message}${colors.reset}`);
    }
};

const runTest = async () => {
    console.log(`${colors.blue}=== STARTING SMOKE TEST ===${colors.reset}`);
    console.log(`Target: ${BASE_URL}`);
    console.log(`User: ${USER_EMAIL}`);
    console.log('-----------------------------------');

    let accessToken = null;
    let userId = null;
    let productId = null;
    let createdOrderId = null;

    try {
        // 1. Health Check
        log('HEALTH', 'Checking server status...');
        const healthRes = await axios.get(`${BASE_URL}/health`);
        assert.equal(healthRes.status, 200);
        success('Server is up and running');

        // 2. Register
        log('REGISTER', 'Registering new user...');
        const registerData = {
            name: USER_NAME,
            email: USER_EMAIL,
            password: USER_PASSWORD,
            mobile: USER_MOBILE
        };
        const registerRes = await axios.post(`${BASE_URL}/api/users/register`, registerData);
        assert.equal(registerRes.status, 201);
        success('User registered successfully');

        // 3. Login
        log('LOGIN', 'Logging in...');
        const loginData = {
            mobile: USER_MOBILE,
            password: USER_PASSWORD
        };
        const loginRes = await axios.post(`${BASE_URL}/api/users/login`, loginData);
        assert.equal(loginRes.status, 200);
        accessToken = loginRes.data.data.accessToken;
        userId = loginRes.data.data.user._id;
        assert.ok(accessToken, 'Access token missing');
        success(`Logged in. Token received.`);

        // Configure axios auth header for subsequent requests
        const authClient = axios.create({
            baseURL: BASE_URL,
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // 4. Get Profile
        log('PROFILE', 'Fetching user profile...');
        const profileRes = await authClient.get('/api/users/profile');
        assert.equal(profileRes.status, 200);
        assert.equal(profileRes.data.data.email, USER_EMAIL);
        success('Profile fetched successfully');

        // 5. Add Address
        log('ADDRESS', 'Adding delivery address...');
        const addressData = {
            addressLine: '123 Test Lane',
            city: 'Nashik',
            state: 'Maharashtra',
            pincode: '422001',
            isDefault: true
        };
        const addressRes = await authClient.post('/api/users/address', addressData);
        assert.equal(addressRes.status, 201);
        success('Address added successfully');

        // 6. Get Products (Public but we need a product ID)
        log('PRODUCTS', 'Fetching products...');
        const productsRes = await axios.get(`${BASE_URL}/api/admin/products`);
        assert.equal(productsRes.status, 200);
        const products = productsRes.data.data; // Adjust based on actual response structure

        if (!products || products.length === 0) {
            console.warn(`${colors.yellow}Warning: No products found. Skipping Cart/Order tests.${colors.reset}`);
            // Attempt to create one if we were admin, but we are not.
            // We'll stop here if no products.
            return;
        }

        productId = products[0]._id;
        success(`Found ${products.length} products. Using Product ID: ${productId} (${products[0].name})`);

        // 7. Add to Cart
        log('CART', 'Adding product to cart...');
        const cartData = {
            productId: productId,
            quantity: 2
        };
        const addToCartRes = await authClient.post('/api/cart', cartData);
        assert.equal(addToCartRes.status, 201);
        success('Product added to cart');

        // 8. Verify Cart
        log('CART_GET', 'Verifying cart content...');
        const getCartRes = await authClient.get('/api/cart');
        assert.equal(getCartRes.status, 200);
        const cartItems = getCartRes.data.data.items;
        console.log('DEBUG: Cart Items:', JSON.stringify(cartItems, null, 2));
        assert.ok(cartItems.some(item => item.product._id === productId || item.product === productId), 'Item not found in cart');
        success('Cart verified');

        // 9. Place Order (COD)
        log('ORDER', 'Placing order (COD)...');
        const orderData = {
            deliveryAddress: {
                addressLine: '123 Test Lane',
                city: 'Nashik',
                state: 'Maharashtra',
                pincode: '422001'
            },
            paymentMethod: 'cod', // constants.PAYMENT_METHODS.COD
            notes: 'Automated Smoke Test Order'
        };
        const orderRes = await authClient.post('/api/orders', orderData);
        assert.equal(orderRes.status, 201);
        createdOrderId = orderRes.data.data.orderId;
        success(`Order placed successfully. Order ID: ${createdOrderId}`);

        // 10. Verify Order List
        log('ORDER_LIST', 'Verifying order in history...');
        const ordersRes = await authClient.get('/api/orders');
        assert.equal(ordersRes.status, 200);
        const myOrders = ordersRes.data.data;
        assert.ok(myOrders.find(o => o.orderId === createdOrderId), 'Order not found in history');
        success('Order history verified');

        console.log('-----------------------------------');
        console.log(`${colors.green}ALL TESTS PASSED! 🚀${colors.reset}`);

    } catch (err) {
        console.log('-----------------------------------');
        error('TEST FAILED', err);
        process.exit(1);
    }
};

runTest();
