
// lib/utils/calculations.js
// دوال الحسابات المالية

export const calculations = {
  // حساب الضريبة
  calculateTax(amount, rate = 14) {
    return (amount * rate) / 100;
  },

  // حساب الإجمالي مع الضريبة
  calculateTotalWithTax(subtotal, taxRate = 14) {
    return subtotal + this.calculateTax(subtotal, taxRate);
  },

  // حساب هامش الربح
  calculateProfitMargin(cost, price) {
    if (cost === 0) return 0;
    return ((price - cost) / cost) * 100;
  },

  // حساب نسبة الربح
  calculateProfitPercentage(revenue, cost) {
    if (revenue === 0) return 0;
    return ((revenue - cost) / revenue) * 100;
  },

  // حساب الخصم
  calculateDiscount(amount, discountPercent) {
    return (amount * discountPercent) / 100;
  },

  // حساب السعر بعد الخصم
  calculateDiscountedPrice(price, discountPercent) {
    return price - this.calculateDiscount(price, discountPercent);
  },

  // حساب متوسط
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return sum / numbers.length;
  },

  // تقريب للأعلى
  roundUp(number, decimals = 2) {
    return Math.ceil(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
  },

  // تقريب للأسفل
  roundDown(number, decimals = 2) {
    return Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }
};

// lib/utils/notifications.js
// نظام التنبيهات

export class NotificationManager {
  constructor() {
    this.notifications = [];
  }

  add(notification) {
    const id = Date.now().toString();
    this.notifications.push({
      id,
      ...notification,
      timestamp: new Date()
    });
    return id;
  }

  success(message, title = 'نجح') {
    return this.add({
      type: 'success',
      title,
      message
    });
  }

  error(message, title = 'خطأ') {
    return this.add({
      type: 'error',
      title,
      message
    });
  }

  warning(message, title = 'تحذير') {
    return this.add({
      type: 'warning',
      title,
      message
    });
  }

  info(message, title = 'معلومة') {
    return this.add({
      type: 'info',
      title,
      message
    });
  }

  remove(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  clear() {
    this.notifications = [];
  }

  getAll() {
    return this.notifications;
  }
}

export const notifications = new NotificationManager();