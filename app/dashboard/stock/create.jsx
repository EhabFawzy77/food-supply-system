import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const AddStockPage = () => {
  const [product, setProduct] = useState('');
  const [quantity, setQuantity] = useState(0);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/stock', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ product, quantity }),
    });
    if (response.ok) {
      router.push('/dashboard/stock'); // Redirect to stock page
    } else {
      // Handle error
      console.error('Failed to add stock');
    }
  };

  return (
    <div>
      <h1>إضافة مخزون</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>المنتج:</label>
          <input
            type="text"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            required
          />
        </div>
        <div>
          <label>الكمية:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            required
          />
        </div>
        <button type="submit">إضافة</button>
      </form>
    </div>
  );
};

export default AddStockPage;