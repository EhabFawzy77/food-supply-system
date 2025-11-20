// components/Dashboard/Header.jsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, LogOut } from 'lucide-react';
import { Logo } from '../Logo';
import { useApp } from '../../contexts/AppContext';

export default function Header({ user }) {
  const { logout } = useApp();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  // إغلاق قائمة التنبيهات عند الضغط خارجها
  useEffect(() => {
    function handleClickOutside(e) {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

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

  const handleRemoveNotification = (id) => {
    setNotifications(notifications.filter(n => n.id !== id));
    try {
      const removed = JSON.parse(window.localStorage.getItem('removedNotifications') || '[]');
      if (!removed.includes(id)) {
        removed.push(id);
        window.localStorage.setItem('removedNotifications', JSON.stringify(removed));
      }
    } catch (e) {
      console.warn('Failed to persist removed notification', e.message);
    }
  };

  return (
    <header className="bg-white shadow-md px-4 py-3 sticky top-0 z-20">
      <div className="flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Logo />
        </div>

        {/* Center - Welcome Text */}
        <div className="flex-1 text-center">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg px-4 py-2 border border-indigo-100">
            <div className="text-lg font-bold text-indigo-800">مرحباً بك في لوحة التحكم | نظام إدارة مركز الدهانات المتكامل</div>
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
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
              <Bell className="w-5 h-5" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-bold text-gray-800">التنبيهات</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <div key={notif.id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className={`text-sm font-semibold ${
                              notif.type === 'warning' ? 'text-yellow-700' :
                              notif.type === 'success' ? 'text-green-700' : 'text-gray-700'
                            }`}>
                              {notif.message}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveNotification(notif.id)}
                            className="text-gray-400 hover:text-red-500 transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      لا توجد تنبيهات
                    </div>
                  )}
                </div>
              </div>
            )}
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

            {/* Logout Button */}
            <button
              onClick={() => {
                if (confirm('هل أنت متأكد من تسجيل الخروج؟')) {
                  logout();
                }
              }}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition ml-2"
              title="تسجيل الخروج"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}