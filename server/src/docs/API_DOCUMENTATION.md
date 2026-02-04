# API Documentation

## Overview
This document provides detailed information about all API endpoints in the Grape Master backend.

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## User Module

### Authentication Endpoints

#### Register User
**POST** `/users/register`

Request Body:
```json
{
  "name": "John Doe",
  "mobile": "9876543210",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "mobile": "9876543210",
      "email": "john@example.com",
      "role": "customer"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login User
**POST** `/users/login`

Request Body:
```json
{
  "mobile": "9876543210",
  "password": "password123"
}
```

---

## Cart Module

### Add to Cart
**POST** `/cart`

Headers: `Authorization: Bearer <token>`

Request Body:
```json
{
  "productId": "product_id_here",
  "quantity": 2
}
```

---

## Order Module

### Place Order
**POST** `/orders`

Headers: `Authorization: Bearer <token>`

Request Body:
```json
{
  "items": [
    {
      "product": "product_id",
      "productName": "Flame",
      "quantity": 2,
      "price": 450
    }
  ],
  "deliveryAddress": {
    "addressLine": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "paymentMethod": "phonepe",
  "notes": "Please deliver in evening"
}
```

Response:
```json
{
  "success": true,
  "message": "Order placed successfully",
  "data": {
    "orderId": "ORD123456789",
    "user": "...",
    "items": [...],
    "pricing": {
      "itemsTotal": 900,
      "deliveryCharges": 50,
      "total": 950
    },
    "orderStatus": "placed",
    "paymentStatus": "pending"
  }
}
```

---

## Dealer Module

### Submit Dealer Enquiry
**POST** `/dealers`

Request Body:
```json
{
  "fullName": "Rajesh Kumar",
  "mobile": "9876543210",
  "email": "rajesh@example.com",
  "city": "Pune",
  "state": "Maharashtra",
  "apartmentName": "Sunshine Apartments",
  "businessName": "Kumar Fruits",
  "type": "dealer",
  "distributionCapacity": "100kg per week",
  "experience": "5 years",
  "message": "Interested in becoming a dealer"
}
```

---

## Admin Module

### Admin Login
**POST** `/admin/login`

Request Body:
```json
{
  "email": "admin@grapemaster.com",
  "password": "admin_password"
}
```

### Get Dashboard Stats
**GET** `/admin/dashboard`

Headers: `Authorization: Bearer <admin_token>`

Response:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalOrders": 150,
      "totalUsers": 200,
      "totalDealerEnquiries": 25,
      "pendingOrders": 10,
      "totalRevenue": 75000
    },
    "recentOrders": [...]
  }
}
```

---

## Product Management (Admin)

### Create Product
**POST** `/admin/products`

Headers: `Authorization: Bearer <admin_token>`

Request Body:
```json
{
  "name": "Flame",
  "weight": "2kg",
  "price": 450,
  "description": "Premium quality flame grapes",
  "image": "url_to_image",
  "stock": 100
}
```

### Update Product
**PUT** `/admin/products/:id`

Headers: `Authorization: Bearer <admin_token>`

Request Body:
```json
{
  "price": 475,
  "stock": 150
}
```

---

## Order Management (Admin)

### Get All Orders
**GET** `/admin/orders?status=placed&paymentStatus=success`

Headers: `Authorization: Bearer <admin_token>`

Query Parameters:
- `status` (optional): Filter by order status
- `paymentStatus` (optional): Filter by payment status

### Update Order Status
**PUT** `/admin/orders/:orderId/status`

Headers: `Authorization: Bearer <admin_token>`

Request Body:
```json
{
  "status": "confirmed",
  "note": "Order confirmed and ready for dispatch"
}
```

Valid order statuses:
- `pending`
- `placed`
- `confirmed`
- `dispatched`
- `delivered`
- `cancelled`

### Update Payment Status
**PUT** `/admin/orders/:orderId/payment`

Headers: `Authorization: Bearer <admin_token>`

Request Body:
```json
{
  "paymentStatus": "success"
}
```

---

## Settings Management (Admin)

### Update Delivery Charge
**PUT** `/admin/settings/delivery_charge`

Headers: `Authorization: Bearer <admin_token>`

Request Body:
```json
{
  "value": 60
}
```

### Get Delivery Charge (Public)
**GET** `/admin/settings/delivery_charge`

Response:
```json
{
  "success": true,
  "data": {
    "key": "delivery_charge",
    "value": 60,
    "description": "Delivery charge in rupees",
    "type": "number"
  }
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": ["Additional error details"] // Optional
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production.

---

## Changelog

### Version 1.0.0
- Initial API implementation
- User authentication
- Product management
- Order management
- Cart functionality
- Dealer enquiries
- Admin dashboard
- Settings management
