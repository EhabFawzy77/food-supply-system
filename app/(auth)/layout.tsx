// app/(auth)/layout.tsx
import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "../globals.css";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "تسجيل الدخول - نظام إدارة التوريدات",
  description: "تسجيل الدخول لنظام إدارة التوريدات الغذائية",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // لا تضع <html> و <body> هنا - يتم التعامل معها في app/layout.js
  return (
    <div className={`${cairo.variable} font-sans antialiased min-h-screen`}>
      {children}
    </div>
  );
}