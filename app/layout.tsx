import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlashTrendy Ecommerce Store",
  description: "Modern ecommerce store built with Next.js",
};

import { GoogleAnalytics } from "@/components/GoogleAnalytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <GoogleAnalytics ga_id={process.env.NEXT_PUBLIC_GA_ID || ""} />
        {children}
      </body>
    </html>
  );
}

