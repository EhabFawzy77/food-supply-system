
// lib/utils/constants.js
// الثوابت المستخدمة في التطبيق
export const CONSTANTS = {
  ROLES: {
    ADMIN: 'admin',
    USER: 'user'
  },

  PAYMENT_METHODS: {
    CASH: 'cash',
    CREDIT: 'credit',
    BANK_TRANSFER: 'bank_transfer',
    CHECK: 'check'
  },

  PAYMENT_STATUS: {
    PAID: 'paid',
    PARTIAL: 'partial',
    UNPAID: 'unpaid'
  },

  STOCK_STATUS: {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    EXPIRED: 'expired'
  },

  CUSTOMER_TYPES: {
    RETAIL: 'retail',
    WHOLESALE: 'wholesale'
  },

  TAX_RATE: 0.14, // 14% ضريبة القيمة المضافة

  DATE_FORMATS: {
    DISPLAY: 'DD/MM/YYYY',
    API: 'YYYY-MM-DD',
    FULL: 'DD/MM/YYYY HH:mm'
  }
};