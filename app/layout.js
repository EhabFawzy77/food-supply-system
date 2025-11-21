import './globals.css';
import { Cairo } from 'next/font/google';
import Providers from '../components/Dashboard/Providers.jsx';

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cairo",
});

export const metadata = {
  title: 'نظام إدارة التوريدات الغذائية',
  description: 'نظام متكامل لإدارة شركات التوريدات الغذائية',
  icons: [
    { rel: 'icon', url: '/icon.png' },
    { rel: 'apple-touch-icon', url: '/icon.png' }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${cairo.variable} font-cairo antialiased`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}