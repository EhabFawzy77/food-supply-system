import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function NotificationContainer({ notifications, onRemove }) {
  if (notifications.length === 0) return null;

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

  const getColors = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="fixed top-4 left-4 z-50 space-y-3 max-w-md" dir="rtl">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
          getIcon={getIcon}
          getColors={getColors}
        />
      ))}
    </div>
  );
}

function Notification({ notification, onRemove, getIcon, getColors }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onRemove]);

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border-2 shadow-lg
        ${getColors(notification.type)}
        animate-slide-in
      `}
    >
      {getIcon(notification.type)}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <div className="font-bold mb-1">{notification.title}</div>
        )}
        <div className="text-sm">{notification.message}</div>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

// Hook للاستخدام السهل
export function useNotification() {
  const [notifications, setNotifications] = useState([]);

  const add = (notification) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, ...notification }]);
    return id;
  };

  const remove = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const success = (message, title = 'نجح') => {
    return add({ type: 'success', title, message });
  };

  const error = (message, title = 'خطأ') => {
    return add({ type: 'error', title, message });
  };

  const warning = (message, title = 'تحذير') => {
    return add({ type: 'warning', title, message });
  };

  const info = (message, title = 'معلومة') => {
    return add({ type: 'info', title, message });
  };

  return {
    notifications,
    add,
    remove,
    success,
    error,
    warning,
    info
  };
}