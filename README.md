# 🏛️ Shri Ganpati - E-Commerce Platform

A modern, industry-ready e-commerce platform for selling premium art frames, religious posters, and custom framing solutions. Built with React, Express, MongoDB, and featuring a complete admin and worker management system.

## ✨ Features

### 👥 User Management
- User Registration & Login with JWT Authentication
- Profile Management
- Address Management
- Order History Tracking

### 🛍️ Shopping Experience
- Product Browsing with Categories
- Dynamic Search
- Shopping Cart with localStorage sync
- Razorpay Payment Integration
- Product Details Modal with Ratings

### 🎨 Admin Dashboard
- **Product Management**: Add, Edit, Delete products with image uploads
- **Inventory Management**: Table view with stock levels and descriptions
- **Banner Management**: Create and manage hero section banners
- **Responsive Design**: Works on all devices

### 👷 Worker Dashboard
- **Orders Management**: View pending and processing orders
- **Order Processing**: Mark orders as processing/shipped/delivered
- **Inventory Tracking**: Real-time stock levels with color-coded status
- **Delivery Management**: Track shipments with courier and ETA information
- **Order Details**: Access complete order information and customer details

### 🎯 Modern Features
- **Responsive Design**: Mobile-first approach
- **Hover Tooltips**: Product descriptions on hover
- **Color-Coded Status**: Easy identification of product status
- **Click-Based Menus**: Persistent staff login menu
- **Professional UI**: Industry-standard design patterns

## 🚀 Tech Stack

### Frontend
- **React 19.2.0** - UI Framework
- **Tailwind CSS 3.4.17** - Styling
- **Lucide React** - Icon Library
- **Axios 1.13.2** - HTTP Client
- **Vite** - Build Tool

### Backend
- **Express.js** - Web Framework
- **MongoDB** - NoSQL Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password Hashing
- **Razorpay** - Payment Processing

## 📋 Quick Start

### 1. Clone Repository
```bash
git clone <repository>
cd sgpf
```

### 2. Backend Setup
```bash
cd backend
npm install
node createAdmin.js
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🔑 Default Credentials

### Admin Account
```
Email: admin@ganpati.com
Password: admin123
```

### Worker Account
```
Email: worker@ganpati.com
Password: worker123
```

## 📱 User Interface

### Navigation
- **Home**: Browse products and view promotions
- **Categories**: Filter products by category
- **Cart**: View and manage shopping cart
- **Account**: View orders and manage profile
- **Admin Panel**: Manage products and banners
- **Worker Portal**: Process orders and manage inventory

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 API Documentation

### Authentication
- `POST /api/users/login` - Login user
- `POST /api/users` - Register new user
- `PUT /api/users/profile` - Update profile

### Products
- `GET /api/products` - Get all products with pagination
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Orders
- `GET /api/orders/myorders` - Get user's orders
- `POST /api/orders` - Create order
- `POST /api/orders/verify` - Verify payment and save order
- `GET /api/orders/worker/pending` - Get pending orders (Worker only)
- `PUT /api/orders/:id/status` - Update order status (Worker only)

### Banners
- `GET /api/banners` - Get all banners
- `POST /api/banners` - Create banner (Admin only)
- `PUT /api/banners/:id` - Update banner (Admin only)

## 🛡️ Security Features

- ✅ JWT Token-based Authentication
- ✅ Password Hashing with bcryptjs
- ✅ Role-Based Access Control (RBAC)
- ✅ CORS Protection
- ✅ Input Validation & Sanitization
- ✅ Audit Logging
- ✅ Rate Limiting
- ✅ Error Handling Middleware

## 📊 Database Schema

### User
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  phone: String (unique),
  password: String (hashed),
  isAdmin: Boolean,
  isWorker: Boolean,
  addresses: Array,
  cart: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Order
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  orderItems: Array,
  shippingAddress: Object,
  paymentMethod: String,
  itemsPrice: Number,
  isPaid: Boolean,
  orderStatus: String,
  trackingId: String,
  courier: String,
  estimatedDelivery: Date,
  createdAt: Date
}
```

## 🎨 Design System

### Colors
- **Primary**: Amber (#b45309)
- **Secondary**: Stone (#78716c)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#eab308)
- **Error**: Red (#ef4444)

### Typography
- **Headings**: Serif font (Georgia)
- **Body**: Sans-serif (System fonts)

### Spacing
- Base: 4px
- Small: 8px
- Medium: 16px
- Large: 24px
- XL: 32px

## 🚀 Deployment

### Environment Variables

**Backend (.env)**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ganpati
JWT_SECRET=your_secret_key_here
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Frontend (Vite .env)**
```
VITE_API_URL=http://localhost:5000
```

### Production Build
```bash
# Backend
npm install --production

# Frontend
npm run build
npm run preview
```

## 📈 Performance Optimization

- ✅ Code Splitting with Vite
- ✅ Image Optimization
- ✅ Lazy Loading
- ✅ Caching Strategies
- ✅ Database Indexing
- ✅ API Response Compression

## 🧪 Testing

```bash
# Backend
npm test

# Frontend
npm run test
```

## 📝 Project Structure

```
sgpf/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   ├── server.js
│   ├── createAdmin.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── assets/
│   ├── public/
│   ├── vite.config.js
│   └── package.json
└── SETUP.md
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📞 Support

For support, email support@shrianpati.com or create an issue in the repository.

## 🙏 Acknowledgments

- Lucide React for icons
- Tailwind CSS for styling
- Express.js community
- MongoDB documentation

---

**Version**: 1.0.0  
**Last Updated**: January 9, 2026  
**Status**: Production Ready ✅
