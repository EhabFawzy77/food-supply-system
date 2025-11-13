# Failed to Fetch Error Fix - Invoice Print Recording

## Problem
When printing an invoice, after the print dialog, the `recordPrint()` function would throw:
```
TypeError: Failed to fetch
at recordPrint (file://D:/project/food-supply-system/.next/dev/static/chunks/_2dda3e0f._.js:115:19)
```

## Root Causes Identified

### 1. **State Race Condition (Already Fixed)**
- `recordPrint()` was being called via nested setTimeout
- By that time, `invoiceId` state might not be initialized

### 2. **Missing Request Body**
- Fetch POST requests with Authorization header need explicit Content-Type
- Body may have been missing

### 3. **Authentication Middleware Issues**
- The `authenticate` middleware wasn't properly handling Next.js Request objects
- Headers handling was inconsistent

### 4. **Timing Issues**
- Print dialog timing conflicts with fetch execution

## Solutions Applied

### Fix 1: Enhanced `recordPrint()` Function
**File:** `app/dashboard/invoices/[invoiceId]/print/page.jsx`

```javascript
const recordPrint = async () => {
  try {
    const token = localStorage.getItem('authToken');
    const url = `/api/invoices/${invoiceId}/print`;
    
    console.log('Recording print - ID:', invoiceId, 'Token exists:', !!token, 'URL:', url);
    
    if (!token) {
      console.error('No auth token available');
      setPrinting(false);
      return;
    }

    if (!invoiceId) {
      console.error('Invoice ID is missing');
      setPrinting(false);
      return;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'  // Added explicit Content-Type
      },
      body: JSON.stringify({})  // Added explicit body
    });
    
    if (!response.ok) {
      console.error('Print recording failed:', response.status, response.statusText);
      const errorData = await response.json().catch(() => ({}));
      console.error('Error response:', errorData);
    } else {
      console.log('Print recorded successfully');
    }
    
    setPrinting(false);
  } catch (error) {
    console.error('Error recording print:', error);
    setPrinting(false);
  }
};
```

**Changes:**
- Added validation checks for `token` and `invoiceId`
- Added `Content-Type: application/json` header
- Added explicit `body: JSON.stringify({})`
- Improved error logging for debugging
- Parse and log error response

### Fix 2: Improved Print Flow
**File:** `app/dashboard/invoices/[invoiceId]/print/page.jsx`

```javascript
const printInvoice = async (invoiceData) => {
  if (!invoiceData) {
    alert('الفاتورة غير محمّلة للطباعة');
    return;
  }

  setPrinting(true);
  try {
    const { generateInvoiceHTML } = await import('../../../../../lib/utils/invoice/template');
    const html = generateInvoiceHTML(invoiceData, {
      name: 'شركة توريد الأغذية',
      phone: '+20 100 000 0000',
      email: 'info@foodsupply.com',
      address: 'القاهرة، مصر'
    });

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();

    // Small delay before printing to ensure content is loaded
    await new Promise(resolve => setTimeout(resolve, 250));
    printWindow.print();

    // Record print after user closes print dialog (longer delay)
    // Don't await this - let it happen in background
    setTimeout(() => {
      recordPrint();
    }, 500);
    
    setPrinting(false);
  } catch (error) {
    console.error('Error printing:', error);
    alert('خطأ في الطباعة');
    setPrinting(false);
  }
};
```

**Changes:**
- Removed nested setTimeout
- Use Promise-based delay for cleaner async flow
- Set `setPrinting(false)` earlier
- Record print in background (fire and forget)

### Fix 3: Enhanced Authentication Middleware
**File:** `lib/middleware/authenticate.js`

```javascript
export default async function authenticate(request) {
  try {
    // Handle both Next.js Request and raw header objects
    let authHeader = null;
    
    if (request.headers instanceof Headers || typeof request.headers.get === 'function') {
      // Next.js Request object with Headers API
      authHeader = request.headers.get('authorization');
    } else if (typeof request.headers === 'object') {
      // Plain object headers
      authHeader = request.headers.authorization || request.headers['authorization'];
    }

    console.log('Auth header:', authHeader ? 'Present' : 'Missing');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Invalid or missing Bearer token');
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token extraction failed');
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Token verified for user:', decoded.userId);
    return decoded;
  } catch (err) {
    console.error('Authentication error:', err.message);
    return null;
  }
}
```

**Changes:**
- Better detection of header object types
- Added null checks before accessing properties
- Improved logging for debugging
- Handles both Next.js Headers API and plain objects

## Testing

### Expected Behavior
1. Print dialog opens with invoice data ✓
2. User prints or cancels
3. After ~500ms, `recordPrint()` is called in background
4. Invoice `printCount` and `printedAt` are updated in database
5. No fetch errors appear in console

### Console Logs to Verify
```
Recording print - ID: 6914a23ce7b77d822ae6478d Token exists: true URL: /api/invoices/6914a23ce7b77d822ae6478d/print
Auth header: Present
Token verified for user: <userId>
Print recorded successfully
```

## Files Modified
1. `app/dashboard/invoices/[invoiceId]/print/page.jsx` - Enhanced print flow
2. `lib/middleware/authenticate.js` - Improved header handling

## Related Fixes (Previously Applied)
- `app/dashboard/invoices/[invoiceId]\print\route.js` - Added `await params`
- `app/api/invoices/[invoiceId]/route.js` - Added model imports

## Notes
- The `recordPrint` call is non-blocking (fire and forget)
- Even if it fails, it won't interrupt the print process
- All errors are logged for debugging

