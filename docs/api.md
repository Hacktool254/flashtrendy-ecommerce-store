# FlashTrendy API Documentation

This document provides an overview of the REST API endpoints available in the FlashTrendy e-commerce platform.

## Authentication

Authentication is handled via NextAuth.js (v5). Most endpoints require a valid session.

### Auth Endpoints
- `POST /api/auth/[...nextauth]` - NextAuth.js authentication handlers (Credentials, Google, GitHub).
- `POST /api/auth/register` - User registration.
- `POST /api/auth/forgot-password` - Request password reset.
- `POST /api/auth/reset-password` - Reset password using token.

## Cart

- `GET /api/cart` - Retrieve the current user's cart items.
- `POST /api/cart` - Add an item to the cart.
- `PATCH /api/cart` - Update item quantity in the cart.
- `DELETE /api/cart` - Remove an item from the cart.

## Checkout & Payments

- `POST /api/checkout` - Create a Stripe checkout session.
- `POST /api/webhooks/stripe` - Stripe webhook handler for payment confirmation and order status updates.

## Products & Reviews

- `GET /api/products` - List products with filtering and pagination.
- `GET /api/products/[id]` - Get product details.
- `POST /api/reviews` - Submit a product review (Authenticated).
- `GET /api/reviews/[productId]` - Get reviews for a specific product.

## User Profile

- `GET /api/user/profile` - Get current user profile information.
- `PATCH /api/user/profile` - Update user profile (name, image, etc.).
- `GET /api/user/orders` - Get current user's order history.
- `GET /api/user/notifications` - Get user notifications.

## Admin Endpoints

Admin endpoints are protected and require the `ADMIN` role.

- `GET /api/admin/analytics` - High-level store metrics.
- `GET /api/admin/orders` - List all system orders.
- `PATCH /api/admin/orders/[id]` - Update order status.
- `POST /api/admin/products` - Create a new product.
- `PATCH /api/admin/products/[id]` - Update existing product.
- `DELETE /api/admin/products/[id]` - Delete a product.
- `GET /api/admin/users` - List all registered users.

## File Uploads

- `/api/uploadthing` - Endpoint for the Uploadthing service used for product images and profile pictures.
