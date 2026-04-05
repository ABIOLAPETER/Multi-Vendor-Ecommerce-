# Multi-Vendor E-Commerce API

A production-ready multi-vendor e-commerce REST API built with NestJS, TypeScript, and PostgreSQL. The system handles vendor management, product listings, shopping cart, order processing, Paystack payments, and role-based access for buyers, vendors, and administrators.

> 🚧 **Currently in active development**

---

## Features

**Authentication & Security**
- JWT-based authentication with access and refresh token rotation
- Role-based access control — Buyer, Vendor, Admin
- Refresh token hashing and rotation
- Logout and logout-all-devices support
- Global validation with class-validator

**Vendor Management**
- Vendor registration and profile management
- Admin approval workflow for vendors
- Shop name, description, and logo
- Vendor suspension by admin

**Product Management**
- Full CRUD for products per vendor
- Category and subcategory support
- Product images, stock tracking, slug generation
- Active/inactive product states

**Shopping Cart**
- Add, remove, update cart items
- Price locked at time of adding to cart
- One cart per user

**Orders**
- Place order from cart
- Order status lifecycle — Pending → Confirmed → Shipped → Delivered → Cancelled
- Per-vendor order item tracking
- Delivery address support

**Payments**
- Paystack payment integration
- Payment initiation and verification
- Webhook handling for automatic order confirmation

**Reviews**
- Product ratings (1–5 stars)
- One review per product per user
- Average rating per product

**Admin Dashboard**
- Platform statistics
- Vendor approval and suspension
- Full visibility across all orders and users

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | NestJS |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Auth | JWT + Passport |
| Payments | Paystack |
| Validation | class-validator + class-transformer |
| Deployment | Railway |

---

## Project Structure

```
src/
├── prisma/              # Prisma service — database connection
├── auth/                # Registration, login, token management
│   ├── dto/
│   ├── guards/
│   └── strategies/
├── users/               # User profiles
├── vendors/             # Vendor profiles and shop management
├── products/            # Product CRUD and search
├── categories/          # Category and subcategory management
├── cart/                # Cart management
├── orders/              # Order placement and tracking
├── payments/            # Paystack integration
├── reviews/             # Product reviews and ratings
├── admin/               # Admin dashboard and management
├── common/
│   ├── filters/         # Global exception filter
│   ├── guards/          # JWT and roles guards
│   └── decorators/      # CurrentUser, Roles decorators
├── app.module.ts
└── main.ts
```

---

## Database Schema

Built with PostgreSQL and managed with Prisma migrations.

**Core tables:**
- `User` — all users (buyers, vendors, admins)
- `RefreshToken` — token rotation tracking
- `VendorProfile` — vendor shop details
- `Category` — product categories with subcategory support
- `Product` — product listings per vendor
- `Cart` + `CartItem` — shopping cart
- `Order` + `OrderItem` — order records
- `Payment` — payment records linked to orders
- `Review` — product reviews per user

---

## API Reference

Base URL: `http://localhost:3000/v1/api`

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/signup` | Register new user | Public |
| POST | `/auth/login` | Login | Public |
| POST | `/auth/refresh` | Refresh access token | Public |
| POST | `/auth/logout` | Logout | Required |

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users/profile` | Get my profile | Required |
| PATCH | `/users/profile` | Update my profile | Required |

### Vendors
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/vendors/register` | Register as vendor | Required |
| GET | `/vendors/profile` | Get my shop profile | Vendor |
| PATCH | `/vendors/profile` | Update shop profile | Vendor |
| GET | `/vendors` | Get all vendors | Admin |
| PATCH | `/vendors/:id/approve` | Approve vendor | Admin |
| PATCH | `/vendors/:id/suspend` | Suspend vendor | Admin |

### Products
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/products` | Browse all products | Public |
| GET | `/products/:id` | Get single product | Public |
| POST | `/products` | Create product | Vendor |
| PATCH | `/products/:id` | Update product | Vendor |
| DELETE | `/products/:id` | Delete product | Vendor |
| GET | `/products/my-products` | My product listings | Vendor |

### Categories
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/categories` | Get all categories | Public |
| POST | `/categories` | Create category | Admin |

### Cart
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/cart` | View my cart | Buyer |
| POST | `/cart/items` | Add item to cart | Buyer |
| PATCH | `/cart/items/:productId` | Update item quantity | Buyer |
| DELETE | `/cart/items/:productId` | Remove item from cart | Buyer |
| DELETE | `/cart` | Clear cart | Buyer |

### Orders
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/orders` | Place order from cart | Buyer |
| GET | `/orders` | My order history | Buyer |
| GET | `/orders/:id` | Get order details | Buyer |
| PATCH | `/orders/:id/cancel` | Cancel order | Buyer |
| GET | `/orders/vendor-orders` | Orders for my products | Vendor |
| PATCH | `/orders/:id/status` | Update order status | Vendor |

### Payments
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/payments/initiate` | Initiate payment | Buyer |
| GET | `/payments/verify/:reference` | Verify payment | Buyer |
| POST | `/payments/webhook` | Paystack webhook | Public |

### Reviews
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/reviews/product/:productId` | Get product reviews | Public |
| POST | `/reviews/product/:productId` | Add review | Buyer |
| PATCH | `/reviews/:id` | Update review | Buyer |
| DELETE | `/reviews/:id` | Delete review | Buyer |

### Admin
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/admin/stats` | Platform statistics | Admin |
| GET | `/admin/users` | All users | Admin |
| GET | `/admin/orders` | All orders | Admin |

---

## Running Locally

**Prerequisites:** Node.js 18+, PostgreSQL (or Neon account)

```bash
git clone https://github.com/ABIOLAPETER/ecommerce-api.git
cd ecommerce-api
npm install

# Set up environment variables
cp .env.example .env
# Fill in your values

# Run database migrations
npx prisma migrate dev

# Start development server
npm run start:dev
```

**Environment variables:**
```env
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PAYSTACK_SECRET_KEY=sk_test_your_key
PAYSTACK_WEBHOOK_SECRET=your_webhook_secret
```

---

## Key Design Decisions

**Multi-vendor architecture** — Each product belongs to a vendor. Order items track both the order and the vendor separately, allowing per-vendor revenue tracking and order management.

**Cart price locking** — When a product is added to cart, the current price is stored on the cart item. This prevents price changes from affecting items already in a customer's cart.

**Refresh token hashing** — Refresh tokens are hashed with SHA-256 before storage. The raw token is sent to the client and never stored, preventing token theft from database breaches.

**Prisma migrations** — All schema changes are tracked as migration files, making it easy to reproduce the exact database state in any environment.

---

## Author

**Abiola Peter Boluwatife**
- GitHub: [@ABIOLAPETER](https://github.com/ABIOLAPETER)
- Email: peterboluwatife69@gmail.com

---

## License

MIT
