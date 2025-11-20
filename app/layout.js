import './globals.css';
import Providers from '../components/Dashboard/Providers.jsx';

export const metadata = {
  title: 'نظام إدارة مركز الدهانات',
  description: 'نظام متكامل لإدارة مراكز الدهانات',
  icons: [
    { rel: 'icon', url: '/icon.png' },
    { rel: 'apple-touch-icon', url: '/icon.png' }
  ]
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}