'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ClearStoragePage() {
  const router = useRouter();

  useEffect(() => {
    // Clear all localStorage
    localStorage.clear();
    sessionStorage.clear();
    
    console.log('Storage cleared');
    
    // Redirect to login after 1 second
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600">
      <div className="text-center text-white">
        <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-lg font-semibold">جاري مسح البيانات المحفوظة...</p>
        <p className="text-sm text-indigo-100 mt-2">سيتم توجيهك لصفحة تسجيل الدخول</p>
      </div>
    </div>
  );
}
