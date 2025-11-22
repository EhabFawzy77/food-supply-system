
// lib/utils/date.js
// دوال التعامل مع التواريخ

export const dateUtils = {
  // الحصول على تاريخ اليوم
  today() {
    return new Date().toISOString().split('T')[0];
  },

  // الحصول على بداية اليوم
  startOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  // الحصول على نهاية اليوم
  endOfDay(date = new Date()) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  // الحصول على بداية الأسبوع
  startOfWeek(date = new Date()) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  },

  // الحصول على بداية الشهر
  startOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  },

  // الحصول على نهاية الشهر
  endOfMonth(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  },

  // إضافة أيام لتاريخ
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // الفرق بالأيام بين تاريخين
  daysDiff(date1, date2) {
    const diff = Math.abs(new Date(date2) - new Date(date1));
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  },

  // تحويل لصيغة قابلة للقراءة
  toReadable(date) {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  },

  // تحويل لصيغة قصيرة
  toShort(date) {
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(date));
  }
};
