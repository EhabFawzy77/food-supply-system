
// lib/utils/formatters.js
// دوال تنسيق البيانات
export const formatters = {
  // تنسيق المبلغ
  currency: (amount) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  },

  // تنسيق التاريخ
  date: (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  },

  // تنسيق التاريخ والوقت
  datetime: (date) => {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  },

  // تنسيق رقم الهاتف
  phone: (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
    if (match) {
      return `${match[1]} ${match[2]} ${match[3]}`;
    }
    return phone;
  },

  // تنسيق الأرقام الكبيرة
  number: (num) => {
    return new Intl.NumberFormat('ar-EG').format(num);
  },

  // اختصار النص
  truncate: (text, length = 50) => {
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  }
};
