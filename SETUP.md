# 🚀 Shri Ganpati - Complete Setup Guide

## Backend Setup (Production Ready)

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Create Admin & Worker Accounts
```bash
node createAdmin.js
```

This will output:
```
===================================
✅ ADMIN & WORKER CREATED!
===================================

👨‍💼 ADMIN ACCOUNT:
   📧 Email: admin@ganpati.com
   🔑 Password: admin123
   📱 Phone: 9999999998

👷 WORKER ACCOUNT:
   📧 Email: worker@ganpati.com
   🔑 Password: worker123
   📱 Phone: 9999999999
```

### 3. Start Backend Server
```bash
npm start
# or with nodemon for development
npm run dev
```

Server will run on: `http://localhost:5000`

---

## Frontend Setup

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

Frontend will run on: `http://localhost:5173`

---

## 🔑 Account Credentials

### Admin Portal
- **Email**: `admin@ganpati.com`
- **Password**: `admin123`
- **Access**: Staff Login > Use Credentials

### Worker Portal
- **Email**: `worker@ganpati.com`
- **Password**: `worker123`
- **Access**: Staff Login > Use Credentials

### Regular User
- Create account from the frontend Sign Up page
- Access user dashboard with order history and address management

---

## 🎯 Features Overview

### Admin Dashboard
- ✅ Product Management (Add, Edit, Delete)
- ✅ Product Inventory Table View
- ✅ Banner Management (Add, Edit, Remove)
- ✅ Hover tooltips for descriptions
- ✅ Real-time inventory updates

### Worker Dashboard
- ✅ **Orders Tab**: View pending/processing orders with customer details
- ✅ **Stocks Tab**: Real-time inventory status with stock levels
- ✅ **Delivery Tab**: Track shipments and update tracking information
- ✅ **Order Management**: Mark orders as processing/shipped
- ✅ **Status Updates**: Update order status and add tracking details

### User Features
- ✅ Product Browsing with Categories
- ✅ Shopping Cart
- ✅ Checkout with Razorpay Payment
- ✅ Address Management
- ✅ Order History
- ✅ Account Profile Management

---

## 📦 Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  isAdmin: Boolean,
  isWorker: Boolean,
  addresses: Array,
  cart: Array,
  createdAt: Date
}
```

### Order Model
```javascript
{
  user: ObjectId,
  orderItems: Array,
  shippingAddress: Object,
  paymentMethod: String,
  paymentResult: Object,
  itemsPrice: Number,
  isPaid: Boolean,
  isDelivered: Boolean,
  orderStatus: String (pending/processing/shipped/delivered/cancelled),
  trackingId: String,
  courier: String,
  estimatedDelivery: Date,
  lastUpdate: String,
  createdAt: Date
}
```

---

## 🔌 API Endpoints

### Orders (Worker)
- `GET /api/orders/worker/pending` - Get pending orders
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/:id` - Get order details

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Users
- `POST /api/users/login` - Login (Admin/Worker/User)
- `POST /api/users` - Register user
- `GET /api/users/profile` - Get user profile

---

## 🛡️ Security Features

- ✅ JWT Token Authentication
- ✅ Password Hashing with bcryptjs
- ✅ Role-Based Access Control (Admin/Worker/User)
- ✅ Audit Logging for unauthorized access
- ✅ CORS Protection
- ✅ Input Validation
- ✅ Error Handling Middleware

---

## 🎨 Frontend Technologies

- React 19.2.0
- Tailwind CSS 3.4.17
- Lucide React Icons
- Axios for API calls
- React Router for navigation

---

## 🚀 Deployment Ready

The application is production-ready with:
- ✅ Proper error handling
- ✅ Input validation
- ✅ Security middleware
- ✅ Audit logging
- ✅ Responsive design
- ✅ Performance optimization
- ✅ Database indexing

---

## 📋 Troubleshooting

### Backend won't start
1. Check `.env` file exists with DB_URI
2. Ensure MongoDB is running
3. Check port 5000 is available

### Frontend API calls failing
1. Verify backend is running on `http://localhost:5000`
2. Check CORS is enabled
3. Verify JWT tokens in localStorage

### Worker dashboard not showing orders
1. Ensure worker account is created with `node createAdmin.js`
2. Check order status in database
3. Verify worker credentials in staff login

---

## 📞 Support

For issues or questions, check the API endpoints and ensure:
- Backend is running
- Database connection is active
- Credentials are correct
- CORS is properly configured

---

**Last Updated**: January 9, 2026
**Version**: 1.0.0 - Production Ready
