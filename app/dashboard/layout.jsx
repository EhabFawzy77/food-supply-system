// app/(dashboard)/layout.jsx
'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '../../contexts/AppContext';
import { useEffect } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import Header from '../../components/Dashboard/Header';


export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, updateUserPermissions } = useApp();

  // التحقق من تسجيل الدخول وتحديث الصلاحيات
  useEffect(() => {
    if (!loading) {
      if (!user) {
        // إذا لم يكن هناك مستخدم، أعد التوجيه إلى الدخول
        router.push('/login');
      } else {
        // تحديث الصلاحيات من localStorage
        const userData = localStorage.getItem('currentUser');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            // تحديث الصلاحيات إذا كانت مختلفة
            if (JSON.stringify(parsedUser.permissions) !== JSON.stringify(user.permissions)) {
              updateUserPermissions(parsedUser.permissions);
            }
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
      }
    }
  }, [loading, user, router, updateUserPermissions]);

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

  // إذا لم يكن هناك مستخدم، لا تعرض الـ Dashboard
  if (!user) {
    return null;
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