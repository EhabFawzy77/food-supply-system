'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AppContext = createContext();

export function AppProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // تحميل بيانات المستخدم من localStorage
    const loadUser = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('currentUser');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success) {
        try {
          console.log('حفظ بيانات المستخدم...');
          localStorage.setItem('authToken', data.data.token);
          localStorage.setItem('currentUser', JSON.stringify(data.data.user));
          setUser(data.data.user);
          
          // التوجيه للوحة التحكم
          console.log('جاري التوجيه للوحة التحكم...');
          window.location.href = '/dashboard';
          
          return { success: true, user: data.data.user };
        } catch (error) {
          console.error('خطأ في حفظ بيانات المستخدم:', error);
          return { success: false, error: 'حدث خطأ في حفظ بيانات المستخدم' };
        }
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'حدث خطأ في الاتصال' };
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    setUser(null);
    router.push('/login');
  };

  const addNotification = (notification) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, ...notification }]);
    
    // إزالة تلقائية بعد 5 ثواني
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const value = {
    user,
    loading,
    login,
    logout,
    notifications,
    addNotification,
    removeNotification
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}