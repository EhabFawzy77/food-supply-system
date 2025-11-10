// components/Dashboard/Sidebar.jsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp,
  Warehouse, UserCircle, Settings, FileText, CreditCard,
  Menu, X, LogOut, Truck, ShoppingBag
} from 'lucide-react';

export default function Sidebar({ user, currentPath }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'لوحة التحكم', 
      path: '/dashboard', 
      show: true 
    },
    { 
      icon: ShoppingCart, 
      label: 'المبيعات', 
      path: '/dashboard/sales', 
      show: user?.permissions?.sales 
    },
    { 
      icon: ShoppingBag, 
      label: 'المشتريات', 
      path: '/dashboard/purchases', 
      show: user?.permissions?.purchases 
    },
    { 
      icon: Warehouse, 
      label: 'المخزون', 
      path: '/dashboard/inventory', 
      show: user?.permissions?.inventory 
    },
    { 
      icon: Package, 
      label: 'المنتجات', 
      path: '/dashboard/products', 
      show: user?.permissions?.inventory 
    },
    { 
      icon: Users, 
      label: 'العملاء', 
      path: '/dashboard/customers', 
      show: user?.permissions?.customers 
    },
    { 
      icon: Truck, 
      label: 'الموردين', 
      path: '/dashboard/suppliers', 
      show: user?.permissions?.suppliers 
    },
    { 
      icon: CreditCard, 
      label: 'المدفوعات', 
      path: '/dashboard/payments', 
      show: user?.permissions?.sales 
    },
    { 
      icon: FileText, 
      label: 'التقارير', 
      path: '/dashboard/reports', 
      show: user?.permissions?.reports 
    },
    { 
      icon: UserCircle, 
      label: 'المستخدمين', 
      path: '/dashboard/users', 
      show: user?.permissions?.users 
    },
    { 
      icon: Settings, 
      label: 'الإعدادات', 
      path: '/dashboard/settings', 
      show: user?.role === 'admin' 
    }
  ];

  const handleLogout = () => {
    if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 right-0 z-50
          bg-gradient-to-b from-indigo-800 to-indigo-900 text-white
          transition-all duration-300 flex flex-col
          ${isOpen ? 'w-64' : 'w-0 lg:w-20'}
        `}
      >
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-indigo-700">
          {isOpen && (
            <div>
              <h2 className="text-xl font-bold">نظام الإدارة</h2>
              <p className="text-xs text-indigo-300">{user?.fullName}</p>
            </div>
          )}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-indigo-700 rounded-lg transition"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-6 space-y-1 px-3 overflow-y-auto">
          {menuItems.filter(item => item.show).map((item, idx) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={idx}
                href={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition group
                  ${isActive 
                    ? 'bg-indigo-700 text-white' 
                    : 'hover:bg-indigo-700/50 text-indigo-100'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && (
                  <span className="font-semibold">{item.label}</span>
                )}
                {!isOpen && (
                  <span className="absolute right-full mr-2 px-2 py-1 bg-indigo-700 rounded text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-indigo-700">
          {isOpen ? (
            <div className="mb-3 p-3 bg-indigo-700/50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
                  {user?.fullName?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{user?.fullName}</div>
                  <div className="text-xs text-indigo-300 truncate">{user?.email}</div>
                </div>
              </div>
              <div className="text-xs text-indigo-200">
                الدور: <span className="font-semibold">{
                  user?.role === 'admin' ? 'مدير عام' :
                  user?.role === 'manager' ? 'مدير' :
                  user?.role === 'user' ? 'مستخدم' : 'ضيف'
                }</span>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
                {user?.fullName?.charAt(0)}
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 transition text-white font-semibold"
          >
            <LogOut className="w-5 h-5" />
            {isOpen && <span>تسجيل الخروج</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 right-4 z-30 lg:hidden p-3 bg-indigo-600 text-white rounded-lg shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
