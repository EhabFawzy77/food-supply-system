'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    // التحقق من وجود توكن التوثيق
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    
    if (!token || !userData) {
      console.log('لم يتم العثور على بيانات المستخدم، جاري التوجيه لصفحة تسجيل الدخول...');
      router.push('/login');
    } else {
      // إذا كان المستخدم مسجل دخول، نوجهه للوحة التحكم
      router.push('/dashboard/sales');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">جاري التحميل...</p>
      </div>
    </div>
  );
}