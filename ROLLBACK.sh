#!/bin/bash
# سكريبت لإرجاع النظام للحالة السابقة

# تم تعديل/إضافة الملفات التالية:

# ❌ للحذف (الملفات الجديدة):
# rm -rf app/api/invoices/
# rm -rf app/dashboard/invoices/
# rm -rf lib/models/Invoice.js
# rm -rf lib/utils/invoice/
# rm -rf COMPLETION_SUMMARY_AR.md
# rm -rf FILES_ADDED_MODIFIED.md
# rm -rf INVOICES_EXAMPLES.md
# rm -rf INVOICES_SYSTEM.md
# rm -rf INVOICES_TEST.js
# rm -rf INVOICES_TEMPLATES.md

# ↩️ للاسترجاع (الملفات المعدلة):
# git restore components/Dashboard/Sidebar.jsx

# ✨ أو: للقبول الكامل
# git add .
# git commit -m "feat: add complete invoice system"

echo "خيارات الرجوع:"
echo "1. استعادة Sidebar فقط:"
echo "   git restore components/Dashboard/Sidebar.jsx"
echo ""
echo "2. حذف جميع الملفات الجديدة:"
echo "   rm -rf app/api/invoices/ app/dashboard/invoices/ lib/models/Invoice.js lib/utils/invoice/ INVOICES* FILES* COMPLETION*"
echo ""
echo "3. قبول جميع التغييرات والتزام:"
echo "   git add ."
echo "   git commit -m \"feat: add complete invoice system\""
