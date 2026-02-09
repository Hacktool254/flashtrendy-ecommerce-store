This is a [Next.js](https://nextjs.org) project bootstrapped for FlashTrendy Ecommerce Store.

## Tech Stack Overview

FlashTrendy is a modern e-commerce platform built with performance and developer experience in mind:

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Prisma ORM, PostgreSQL, NextAuth.js v5
- **Features**: Stripe (Payments), Resend (Emails), Uploadthing (File Uploads)
- **State/Charts**: Zustand, Recharts
- **Testing**: Jest, React Testing Library, Cypress

For a deeper dive into our architecture and choice of libraries, check out the [Full Tech Stack Documentation](docs/tech-stack.md).

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Project Structure

- `app/` - App Router directory containing pages and layouts
- `app/layout.tsx` - Root layout component
- `app/page.tsx` - Home page
- `app/globals.css` - Global styles with Tailwind CSS

