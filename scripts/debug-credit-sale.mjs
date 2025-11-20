import fetch from 'node-fetch';

(async () => {
  try {
    const base = 'http://localhost:3010';

    console.log('Fetching products...');
    const productsRes = await fetch(`${base}/api/products`);
    const productsJson = await productsRes.json();
    if (!productsJson.success || !productsJson.data || productsJson.data.length === 0) {
      console.error('No products found or API error', productsJson);
      process.exit(1);
    }
    const product = productsJson.data[0];
    console.log('Using product:', product._id, product.name, 'price', product.sellingPrice);

    console.log('Fetching customers...');
    const customersRes = await fetch(`${base}/api/customers`);
    const customersJson = await customersRes.json();
    if (!customersJson.success || !customersJson.data || customersJson.data.length === 0) {
      console.error('No customers found or API error', customersJson);
      process.exit(1);
    }
    const customer = customersJson.data[0];
    console.log('Using customer:', customer._id, customer.name, 'currentDebt', customer.currentDebt);

    // Create sale payload: total 115, paidAmount 100, using the product price
    const unitPrice = product.sellingPrice || 115;
    const qty = 1;
    const subtotal = unitPrice * qty;
    const total = 115; // force total for test

    const salePayload = {
      invoiceNumber: `TEST-${Date.now()}`,
      customer: customer._id,
      customerName: customer.name || '',
      items: [
        {
          product: product._id,
          quantity: qty,
          unitPrice: unitPrice,
          total: unitPrice * qty
        }
      ],
      subtotal: subtotal,
      discount: 0,
      tax: 0,
      total: total,
      paymentMethod: 'credit',
      paymentStatus: 'partial',
      paidAmount: 100,
      payPreviousDebts: false,
      notes: 'Debug credit sale test',
      createdBy: null
    };

    console.log('Posting sale payload:', JSON.stringify({ invoiceNumber: salePayload.invoiceNumber, total: salePayload.total, paidAmount: salePayload.paidAmount, paymentMethod: salePayload.paymentMethod }));

    const postRes = await fetch(`${base}/api/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(salePayload)
    });

    const postText = await postRes.text();
    let postJson = null;
    try { postJson = postText ? JSON.parse(postText) : {}; } catch (e) { console.error('Invalid JSON response:', postText); }

    console.log('POST /api/sales response status:', postRes.status);
    console.log('POST /api/sales response body:', postJson);

  } catch (err) {
    console.error('Test script error:', err);
    process.exit(1);
  }
})();
