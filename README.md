# MDesk - Store, Orders & Bills

A comprehensive web-based clothing e-commerce system with full backend management capabilities. Customers can browse products, shop online, and track orders while internal users manage the complete supply chain from products to payments.

## Project Structure

```
mdesk/
├── client/src/                          # Frontend (React + TypeScript)
│   ├── components/                      # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── pages/                           # Page components
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── redux/                           # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   └── cartSlice.ts
│   │   └── store.ts
│   ├── services/                        # API services
│   │   ├── api.ts                       # Axios interceptors & config
│   │   └── authService.ts               # Auth API calls
│   ├── hooks/                           # Custom React hooks
│   │   └── useAuth.ts
│   ├── App.tsx                          # Main app with routing
│   ├── main.tsx                         # Entry point
│   └── index.css                        # Global styles (Tailwind)
│
├── server/                              # Backend (Node.js + Express)
│   ├── src/
│   │   ├── models/                      # MongoDB schemas
│   │   │   ├── User.ts
│   │   │   ├── Contact.ts
│   │   │   ├── Product.ts
│   │   │   ├── PaymentTerm.ts
│   │   │   ├── DiscountOffer.ts
│   │   │   ├── CouponCode.ts
│   │   │   ├── Settings.ts
│   │   │   ├── PurchaseOrder.ts
│   │   │   ├── VendorBill.ts
│   │   │   ├── SalesOrder.ts
│   │   │   ├── CustomerInvoice.ts
│   │   │   └── Payment.ts
│   │   ├── controllers/                 # Request handlers
│   │   │   └── authController.ts
│   │   ├── routes/                      # API routes
│   │   │   └── authRoutes.ts
│   │   ├── middleware/                  # Express middleware
│   │   │   └── auth.ts
│   │   ├── utils/                       # Utility functions
│   │   │   └── jwt.ts
│   │   ├── config/                      # Configuration files
│   │   │   └── database.ts
│   │   └── index.ts                     # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── package.json                         # Frontend dependencies
├── vite.config.ts                       # Vite configuration
├── tailwind.config.js                   # Tailwind CSS config
└── .env.example                         # Frontend env template
```

## Implemented Features

### ✅ Master Data Models
- **Users**: Internal and portal users with role-based access control, password hashing (bcryptjs), JWT authentication
- **Contacts**: Business contacts supporting customer/vendor/both types, linked to users
- **Products**: Clothing items with multi-color support, stock tracking, pricing, tax rates, Cloudinary images
- **Payment Terms**: Configurable payment conditions with early payment discounts
- **Discount Offers**: Discount programs with date ranges, available for sales/website
- **Coupon Codes**: Individual codes linked to offers with expiration and usage tracking
- **Settings**: System configuration including automatic invoicing toggle

### ✅ Transaction Models
- **Purchase Orders**: Vendor purchases with product line items and status tracking
- **Vendor Bills**: Invoices generated from purchase orders with payment tracking
- **Sales Orders**: Customer orders supporting backend and website sources
- **Customer Invoices**: Invoices generated from sales orders with payment terms
- **Payments**: Unified payment system for both vendor and customer payments

### ✅ Backend APIs
- **Authentication**
  - User registration with automatic customer contact creation
  - Login with JWT token generation
  - Password hashing with bcryptjs
  - Current user endpoint (protected)
  - Role-based access control middleware

### ✅ Frontend Features
- **Authentication**
  - Login page with form validation
  - Registration page with address fields
  - Protected routes with automatic redirection
  - Token storage and automatic logout on expiration

- **State Management**
  - Redux Toolkit with persistent storage
  - Auth slice for user state
  - Cart slice for shopping cart management
  - API interceptors for automatic token attachment

- **UI Components**
  - Reusable Button component with variants and sizes
  - Reusable Input component with error handling
  - Reusable Card component
  - Responsive design with Tailwind CSS

- **Services**
  - Axios API client with interceptors
  - Auth service for API calls
  - Automatic token refresh on 401 responses

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account for database connection

### Installation

**1. Clone and install frontend dependencies:**
```bash
npm install
```

**2. Install backend dependencies:**
```bash
cd server
npm install
```

**3. Configure environment variables:**

Frontend (.env):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Backend (server/.env):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mdesk?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
AUTOMATIC_INVOICING=true
```

### Running the Application

**Development:**

Terminal 1 - Start frontend (Vite dev server):
```bash
npm run dev
```

Terminal 2 - Start backend server:
```bash
cd server
npm run dev
```

**Production:**

Frontend build:
```bash
npm run build
npm run preview
```

Server build and start:
```bash
cd server
npm run build
npm start
```

## Database Schema Overview

### Collections
All data is stored in MongoDB with the following main collections:

- `users` - System users (internal & portal)
- `contacts` - Business contacts (customers & vendors)
- `products` - Clothing catalog
- `paymentterms` - Payment configurations
- `discountoffers` - Discount programs
- `couponcodes` - Individual coupon codes
- `purchaseorders` - Incoming inventory orders
- `vendorbills` - Vendor invoices
- `salesorders` - Customer orders
- `customerinvoices` - Customer invoices
- `payments` - All payments (vendor & customer)
- `settings` - System configuration

## Upcoming Features

### Backend APIs (Ready for Implementation)
- Product management (CRUD, publishing, stock updates)
- Contact management
- Purchase order & vendor bill workflows
- Sales order & customer invoice workflows
- Payment recording and tracking
- Coupon validation and application
- Comprehensive reporting (sales by product/customer, purchase by product/vendor)

### Frontend Pages (Ready for Implementation)
- Product storefront with search and filters
- Shopping cart with quantity management
- Checkout with payment terms and coupon application
- Product management interface (internal)
- Contact management interface (internal)
- Order and invoice management
- Payment terms and discount configuration
- Reporting dashboard with charts
- User profile and account management

## Technology Stack

**Frontend:**
- React 18.3.1
- TypeScript 5.5
- Redux Toolkit 1.9.7
- React Router 6.20
- React Hook Form 7.48
- Axios 1.6
- Tailwind CSS 3.4
- Lucide React (Icons)
- Vite 5.4 (Build tool)

**Backend:**
- Node.js with Express 4.18
- TypeScript 5.3
- MongoDB with Mongoose 8.0
- JWT Authentication
- bcryptjs (Password hashing)
- CORS middleware
- Morgan (HTTP logging)
- Multer (File uploads)
- Cloudinary (Image storage)

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Token expiration and refresh
- Role-based access control (RBAC)
- CORS configuration
- Environment variable protection
- Input validation and sanitization

## Next Steps

1. **API Implementation**: Build remaining API endpoints for products, orders, invoices, and payments
2. **Frontend Pages**: Implement product catalog, shopping cart, and checkout flows
3. **Admin Dashboard**: Create internal user interfaces for inventory and sales management
4. **Reporting Module**: Implement comprehensive reporting with data visualization
5. **Payment Integration**: Integrate payment gateways (Stripe, Razorpay, etc.)
6. **Email Notifications**: Send order confirmations and payment reminders
7. **File Uploads**: Implement Cloudinary integration for product images
8. **Testing**: Add unit and integration tests
9. **Deployment**: Set up CI/CD and deploy to production

## Project Status

✅ Foundation Complete - All core schemas and basic authentication implemented
🔄 Phase 1: API Development - Ready to implement remaining endpoints
⏳ Phase 2: Frontend Development - UI components prepared
⏳ Phase 3: Integration & Testing
⏳ Phase 4: Deployment & Optimization

All builds pass successfully. Project is ready for feature development.
