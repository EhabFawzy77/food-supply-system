// components/Dashboard/Sidebar.jsx
'use client';

import { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogoIcon } from '../Logo';
import {
  LayoutDashboard, Package, ShoppingCart, Users, TrendingUp,
  Warehouse, UserCircle, Settings, FileText, CreditCard,
  Menu, X, Truck, ShoppingBag, Receipt
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
      path: '/dashboard/sales/create', 
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
      icon: Receipt, 
      label: 'الفواتير', 
      path: '/dashboard/invoices', 
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

  const { logout } = useApp();

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
        <div className="p-3 flex items-center justify-between border-b border-indigo-700">
          {isOpen && (
            <div className="flex items-center gap-2 flex-1">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <LogoIcon />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold">نظام الإدارة</h2>
                <p className="text-xs text-indigo-300">{user?.fullName}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-indigo-700 rounded-lg transition"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
          {menuItems.filter(item => item.show).map((item, idx) => {
            const isActive = currentPath === item.path;
            return (
              <Link
                key={idx}
                href={item.path}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-lg transition group
                  ${isActive
                    ? 'bg-indigo-700 text-white'
                    : 'hover:bg-indigo-700/50 text-indigo-100'
                  }
                `}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
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
