# MDesk API Reference

## Base URL
```
http://localhost:5000/api
```

## Authentication

All endpoints except `/auth/register` and `/auth/login` require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## ✅ Implemented Endpoints

### Authentication Routes

#### POST /auth/register
Register a new portal user (customer)

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword",
  "mobile": "9876543210",
  "city": "New Delhi",
  "state": "Delhi",
  "pincode": "110001"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "portal"
  }
}
```

---

#### POST /auth/login
Login user and get JWT token

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGc...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "portal"
  }
}
```

---

#### GET /auth/me
Get current authenticated user details

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "portal",
    "contact": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "type": "customer",
      "email": "john@example.com",
      "mobile": "9876543210",
      "address": {
        "city": "New Delhi",
        "state": "Delhi",
        "pincode": "110001"
      }
    }
  }
}
```

---

## 🔄 Pending Implementation

### Product Management Routes
- `GET /products` - List all published products
- `GET /products/:id` - Get product details
- `POST /products` - Create product (admin)
- `PUT /products/:id` - Update product (admin)
- `DELETE /products/:id` - Delete product (admin)
- `PATCH /products/:id/publish` - Publish/unpublish product

### Contact Management Routes
- `GET /contacts` - List all contacts
- `GET /contacts/:id` - Get contact details
- `POST /contacts` - Create contact
- `PUT /contacts/:id` - Update contact
- `DELETE /contacts/:id` - Delete contact

### Purchase Order Routes
- `POST /purchase-orders` - Create purchase order
- `GET /purchase-orders` - List purchase orders
- `GET /purchase-orders/:id` - Get purchase order details
- `PUT /purchase-orders/:id` - Update purchase order
- `PATCH /purchase-orders/:id/confirm` - Confirm purchase order
- `PATCH /purchase-orders/:id/convert-bill` - Convert to vendor bill

### Vendor Bill Routes
- `POST /vendor-bills` - Create vendor bill
- `GET /vendor-bills` - List vendor bills
- `GET /vendor-bills/:id` - Get vendor bill details
- `PUT /vendor-bills/:id` - Update vendor bill
- `PATCH /vendor-bills/:id/confirm` - Confirm vendor bill

### Sales Order Routes
- `POST /sales-orders` - Create sales order
- `GET /sales-orders` - List sales orders
- `GET /sales-orders/:id` - Get sales order details
- `PUT /sales-orders/:id` - Update sales order
- `PATCH /sales-orders/:id/confirm` - Confirm sales order
- `PATCH /sales-orders/:id/apply-coupon` - Apply coupon code

### Customer Invoice Routes
- `POST /customer-invoices` - Create customer invoice
- `GET /customer-invoices` - List customer invoices
- `GET /customer-invoices/:id` - Get customer invoice details
- `PUT /customer-invoices/:id` - Update customer invoice
- `PATCH /customer-invoices/:id/confirm` - Confirm invoice
- `GET /customer-invoices/:id/pdf` - Download invoice PDF

### Payment Routes
- `POST /payments` - Record payment
- `GET /payments` - List payments
- `GET /payments/:id` - Get payment details
- `PATCH /payments/:id/confirm` - Confirm payment

### Coupon & Discount Routes
- `GET /coupons/:code/validate` - Validate coupon code
- `POST /discount-offers` - Create discount offer (admin)
- `GET /discount-offers` - List discount offers
- `POST /discount-offers/:id/coupons` - Generate coupon codes
- `GET /coupons` - List coupons

### Payment Terms Routes
- `POST /payment-terms` - Create payment term (admin)
- `GET /payment-terms` - List payment terms
- `GET /payment-terms/:id` - Get payment term details
- `PUT /payment-terms/:id` - Update payment term

### Reporting Routes
- `GET /reports/sales-by-products` - Sales report by products
- `GET /reports/sales-by-customers` - Sales report by customers
- `GET /reports/purchase-by-products` - Purchase report by products
- `GET /reports/purchase-by-vendors` - Purchase report by vendors

---

## Error Responses

All endpoints return appropriate HTTP status codes:

- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Missing or invalid token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

**Error Response Format:**
```json
{
  "message": "Error description"
}
```

---

## Request/Response Types

### Common Data Structures

**Address:**
```typescript
{
  city: string;
  state: string;
  pincode: string;
}
```

**Product:**
```typescript
{
  _id: ObjectId;
  productName: string;
  productCategory: 'men' | 'women' | 'children' | 'unisex';
  productType: 'shirt' | 'pant' | 't-shirt' | 'kurta' | 'dress' | 'shorts' | 'jacket' | 'sweater';
  material: 'cotton' | 'nylon' | 'polyester' | 'silk' | 'wool' | 'linen' | 'blend';
  colors: string[];
  currentStock: number;
  salesPrice: number;
  salesTax: number;
  purchasePrice: number;
  purchaseTax: number;
  published: boolean;
  images: string[];
}
```

**Order Item:**
```typescript
{
  product: ObjectId;
  quantity: number;
  unitPrice: number;
  tax: number;
  totalAmount: number;
}
```

---

## Frontend API Service Usage

The frontend provides a pre-configured Axios instance with automatic token attachment:

```typescript
import api from '@/services/api';

// Make authenticated request
const response = await api.get('/products');
const data = response.data;
```

The Axios interceptor automatically:
- Attaches JWT token to all requests
- Redirects to login on 401 response
- Sets proper content-type headers
