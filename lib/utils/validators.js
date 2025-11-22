// lib/utils/validators.js
// دوال التحقق من البيانات
export const validators = {
  // التحقق من رقم الهاتف المصري
  isValidEgyptianPhone: (phone) => {
    const phoneRegex = /^(010|011|012|015)[0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  },

  // التحقق من البريد الإلكتروني
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // التحقق من الرقم الضريبي
  isValidTaxNumber: (taxNumber) => {
    return taxNumber && taxNumber.length >= 9;
  },

  // التحقق من قوة كلمة المرور
  isStrongPassword: (password) => {
    return password.length >= 6;
  },

  // التحقق من الأسعار
  isValidPrice: (price) => {
    return !isNaN(price) && parseFloat(price) > 0;
  },

  // التحقق من الكمية
  isValidQuantity: (quantity) => {
    return !isNaN(quantity) && parseInt(quantity) > 0;
  }
};