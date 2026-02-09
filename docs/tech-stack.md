# FlashTrendy Tech Stack Overview

FlashTrendy is built using a modern, scalable, and type-safe technology stack. This document details the core components and libraries that power the platform.

## Core Framework & Language

- **[Next.js 14 (App Router)](https://nextjs.org/)**: The backbone of the application, providing server-side rendering, API routes, and advanced routing capabilities.
- **[TypeScript](https://www.typescriptlang.org/)**: Ensures end-to-end type safety across the entire codebase, from database queries to UI components.
- **[React 18](https://reactjs.org/)**: The state-of-the-art UI library for building interactive user interfaces.

## User Interface & Styling

- **[Tailwind CSS](https://tailwindcss.com/)**: Utility-first CSS framework for rapid and consistent styling.
- **[Shadcn UI](https://ui.shadcn.com/)**: High-quality, accessible UI components built on top of Radix UI and Tailwind.
- **[Lucide React](https://lucide.dev/)**: Beautifully crafted icons for a modern look and feel.
- **[Embla Carousel](https://www.embla-carousel.com/)**: A lightweight carousel library used for product galleries and hero banners.

## Backend & Data Persistence

- **[Prisma ORM](https://www.prisma.io/)**: Type-safe database client for PostgreSQL, enabling seamless data modeling and migrations.
- **PostgreSQL**: Robust relational database used for storing users, products, orders, and more.
- **[Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction)**: Lightweight and fast state management library used for the shopping cart and user preferences.

## Authentication & Security

- **[NextAuth.js v5 (Auth.js)](https://authjs.dev/)**: Modern authentication solution for Next.js, supporting credentials and OAuth providers (Google, GitHub).
- **[Bcrypt.js](https://github.com/dcodeIO/bcrypt.js)**: Used for secure password hashing and verification.

## Third-Party Integrations

- **[Stripe](https://stripe.com/)**: Secure payment gateway integration for handle checkouts and subscriptions.
- **[Resend](https://resend.com/)**: High-performance email service for transactional emails like order confirmations.
- **[React Email](https://react.email/)**: Framework for building professional email templates with React components.
- **[Uploadthing](https://uploadthing.com/)**: File upload service specialized for Next.js, used for product images and profile pictures.

## Analytics & Monitoring

- **[Recharts](https://recharts.org/)**: Composable charting library used for the admin dashboard analytics.
- **[Sentry](https://sentry.io/)**: Real-time error tracking and performance monitoring to ensure application stability.

## Testing & Quality Assurance

- **[Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**: Comprehensive unit and integration testing suite.
- **[Cypress](https://www.cypress.io/)**: End-to-end testing framework for validating critical user journeys.

## Deployment & DevOps

- **[Vercel](https://vercel.com/)**: The preferred deployment platform for Next.js applications, providing seamless CI/CD and edge functions.
- **GitHub Actions**: Automated workflows for testing and deployment pipelines.
