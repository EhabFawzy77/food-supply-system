'use client';

import { useApp } from '../../contexts/AppContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { useEffect } from 'react';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useApp();
  const [mounted, setMounted] = useState(false);
  const [exitingIds, setExitingIds] = useState(new Set());

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleRemove = (id) => {
    // إضافة الإشعار للقائمة المغلقة لتشغيل أنيميشن الخروج
    setExitingIds(prev => new Set([...prev, id]));
    // حذف فعلي بعد انتهاء الأنيميشن
    setTimeout(() => {
      removeNotification(id);
      setExitingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-6 h-6 text-orange-600" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-600" />;
    }
  };

  const getClasses = (type) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-50 to-green-100 border-green-300 text-green-800 shadow-lg shadow-green-200';
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-red-100 border-red-300 text-red-800 shadow-lg shadow-red-200';
      case 'warning':
        return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-300 text-orange-800 shadow-lg shadow-orange-200';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-300 text-blue-800 shadow-lg shadow-blue-200';
    }
  };

  const getProgressColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-400';
      case 'error':
        return 'bg-red-400';
      case 'warning':
        return 'bg-orange-400';
      case 'info':
      default:
        return 'bg-blue-400';
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 space-y-3 max-w-md" dir="rtl">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={handleRemove}
          getIcon={getIcon}
          getClasses={getClasses}
          getProgressColor={getProgressColor}
          isExiting={exitingIds.has(notification.id)}
        />
      ))}
    </div>
  );
}

function Notification({
  notification,
  onRemove,
  getIcon,
  getClasses,
  getProgressColor,
  isExiting
}) {
  const duration = notification.duration || 5000;

  return (
    <div
      className={`
        flex flex-col rounded-xl border-2 overflow-hidden
        ${getClasses(notification.type)}
        ${isExiting ? 'animate-slide-out' : 'animate-slide-in'}
        transition-all duration-300 ease-out
      `}
    >
      <div className="flex items-start gap-4 p-4">
        <div className="flex-shrink-0 mt-1">
          {getIcon(notification.type)}
        </div>
        <div className="flex-1 min-w-0">
          {notification.title && (
            <div className="font-bold text-base mb-1">
              {notification.title}
            </div>
          )}
          <div className="text-sm leading-5">
            {notification.message}
          </div>
        </div>
        <button
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition-colors duration-200"
          aria-label="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {/* شريط التقدم */}
      <div className="h-1 bg-gray-200 bg-opacity-30">
        <div
          className={`h-full ${getProgressColor(notification.type)} animate-shrink`}
          style={{
            animationDuration: `${duration}ms`
          }}
        />
      </div>
    </div>
  );
}
