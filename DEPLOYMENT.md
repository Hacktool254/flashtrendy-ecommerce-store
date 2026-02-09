# Deployment Guide - FlashTrendy

Follow these steps to deploy FlashTrendy to a production environment (Vercel + Neon).

## 1. Database Setup (PostgreSQL)
We recommend using [Neon](https://neon.tech) for a serverless PostgreSQL database.

1.  Create a new project in Neon.
2.  Copy the **Connection String** (Pooled for `DATABASE_URL`, Direct for `DIRECT_URL`).
3.  Ensure your Prisma schema is synced:
    ```bash
    npx prisma generate
    npx prisma db push
    ```

## 2. Environment Variables configuration
Set up the following environment variables in your Vercel project settings:

### Required Variables:
- `DATABASE_URL`: Your pooled Postgres connection string.
- `DIRECT_URL`: Your direct Postgres connection string.
- `AUTH_SECRET`: Generate one using `npx auth secret`.
- `NEXTAUTH_URL`: Your production URL (e.g., `https://flashtrendy.com`).
- `STRIPE_API_KEY`: production secret key from Stripe.
- `STRIPE_WEBHOOK_SECRET`: Secret key for Stripe webhooks.
- `UPLOADTHING_SECRET`: Secret key from Uploadthing.
- `UPLOADTHING_APP_ID`: App ID from Uploadthing.
- `RESEND_API_KEY`: API key from Resend.

### Public Variables:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Public key from Stripe.
- `NEXT_PUBLIC_GA_ID`: Google Analytics Measurement ID.
- `NEXT_PUBLIC_APP_URL`: Your production URL.

## 3. Stripe Webhook Setup
1.  Go to the Stripe Dashboard -> Developers -> Webhooks.
2.  Add an endpoint pointing to `https://your-domain.com/api/webhooks/stripe`.
3.  Select the following events:
    - `checkout.session.completed`
    - `payment_intent.succeeded`
    - `payment_intent.payment_failed`

## 4. Vercel Deployment
1.  Connect your GitHub repository to Vercel.
2.  Configure the build command: `npm run build`.
3.  Configure the install command: `npm install`.
4.  Add all the environment variables listed above.
5.  Deploy!

## 5. Post-Deployment Checks
- [ ] Verify admin login works in production.
- [ ] Test a real transaction using Stripe Test Mode (if not live).
- [ ] Check if images upload correctly to Uploadthing.
- [ ] Verify order emails are sent via Resend.
