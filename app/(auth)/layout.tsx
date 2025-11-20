// app/(auth)/layout.tsx
import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "تسجيل الدخول - نظام إدارة مركز الدهانات",
  description: "تسجيل الدخول لنظام إدارة مركز الدهانات",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // لا تضع <html> و <body> هنا - يتم التعامل معها في app/layout.js
  return (
    <div className="font-sans antialiased min-h-screen">
      {children}
    </div>
  );
}