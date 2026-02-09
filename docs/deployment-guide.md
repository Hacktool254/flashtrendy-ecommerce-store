# FlashTrendy Deployment Guide

This guide covers how to deploy the FlashTrendy application to production, specifically targeting platform like Vercel with a PostgreSQL database.

## Prerequisites

- GitHub account
- Vercel account
- PostgreSQL database (e.g., Supabase, Neon, or Railway)
- Stripe account
- Resend account (for emails)
- Uploadthing account (for file uploads)

## Environment Variables

Ensure the following variables are set in your production environment:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Authentication
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_generated_secret
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_ID=...
GITHUB_SECRET=...

# Payments (Stripe)
STRIPE_API_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Emails (Resend)
RESEND_API_KEY=re_...

# File Uploads (Uploadthing)
UPLOADTHING_SECRET=sk_live_...
UPLOADTHING_APP_ID=...

# Public URLs
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Deployment Steps

1. **Database Migration**: Run Prisma migrations against your production database:
   ```bash
   npx prisma migrate deploy
   ```
2. **Vercel Setup**:
   - Link your GitHub repository to a new Vercel project.
   - Configure all environment variables in the Vercel dashboard.
   - Deploy the `main` branch.
3. **Webhooks Configuration**:
   - Set up the Stripe webhook URL in the Stripe dashboard: `https://your-domain.com/api/webhooks/stripe`.
   - Ensure the `STRIPE_WEBHOOK_SECRET` is updated.
4. **Sentry Monitoring** (Optional):
   - Configure Sentry for error tracking and performance monitoring.

## Troubleshooting

- **Prisma Client**: If you encounter errors related to the Prisma client, ensure `npx prisma generate` is part of your build command (`npm run build`).
- **Build-time Secrets**: If the build fails during page data collection, check that all required environment variables are available to the build environment.
