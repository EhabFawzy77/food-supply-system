// components/Dashboard/Header.jsx
'use client';

import { useState, useEffect } from 'react';
import { Bell, Search, Calendar } from 'lucide-react';

export default function Header({ user }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // محاكاة التنبيهات
    setNotifications([
      { id: 1, message: 'مخزون منخفض: أرز أبيض', type: 'warning' },
      { id: 2, message: 'دفعة جديدة: عميل النور', type: 'success' }
    ]);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <header className="bg-white shadow-md px-6 py-4 sticky top-0 z-20">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="بحث سريع..."
              className="w-full pr-12 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-6">
          {/* Date & Time */}
          <div className="hidden md:flex items-center gap-3 text-sm">
            <div className="text-right">
              <div className="font-semibold text-gray-800">{formatDate(currentTime)}</div>
              <div className="text-gray-600 font-mono">{formatTime(currentTime)}</div>
            </div>
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
              <Bell className="w-6 h-6" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>

          {/* User Avatar */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="font-semibold text-gray-800">{user?.fullName}</div>
              <div className="text-xs text-gray-500">
                {user?.role === 'admin' ? 'مدير عام' :
                 user?.role === 'user' ? 'مستخدم' : 'مستخدم'}
              </div>
            </div>
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.fullName?.charAt(0)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}