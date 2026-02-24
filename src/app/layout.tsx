import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sentry Next.js Demo",
  description: "Small demo app for Sentry integration"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
