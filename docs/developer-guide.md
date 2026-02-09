# FlashTrendy Developer Documentation

Welcome to the internal developer guide for FlashTrendy.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (beta)
- **State Management**: Zustand
- **Styling**: Tailwind CSS & Shadcn UI
- **Components**: Lucide React, Recharts
- **Emails**: Resend & React Email
- **File Uploads**: Uploadthing
- **Payments**: Stripe

## Project Structure

- `app/` - Next.js App Router (pages and layouts)
- `components/` - Reusable UI components (Shadcn + custom)
- `lib/` - Shared utilities, configurations (db, auth, stripe)
- `hooks/` - Custom React hooks
- `store/` - Zustand store definitions
- `types/` - Shared TypeScript types
- `prisma/` - Database schema and migrations
- `public/` - Static assets

## Code Conventions

- **Components**: Use functional components with arrow functions.
- **Styling**: Use Tailwind CSS utility classes. Prefer Shadcn components for complex UI.
- **Server Components**: Prefer Server Components for data fetching. Use 'use client' only when necessary.
- **Form Validation**: Always use Zod with `react-hook-form`.
- **API Routes**: Implement robust error handling and proper status codes.

## Getting Started

1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up local `.env` file based on `.env.example`.
4. Initialize the database: `npx prisma migrate dev`
5. Start development server: `npm run dev`

## Contribution Guidelines

1. Create a feature branch from `main`.
2. Ensure all tests pass: `npm test`
3. Run linting: `npm run lint`
4. Submit a descriptive Pull Request.
