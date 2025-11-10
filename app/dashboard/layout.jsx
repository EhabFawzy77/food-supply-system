// app/(dashboard)/layout.jsx
'use client';

import { usePathname } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import Sidebar from '../../components/Dashboard/Sidebar';
import Header from '../../components/Dashboard/Header';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const { user, loading } = useApp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="flex">
        <Sidebar user={user} currentPath={pathname} />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header user={user} />
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}