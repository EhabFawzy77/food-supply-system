// components/Providers.jsx
'use client';
import { AppProvider } from '../../contexts/AppContext';
import { CartProvider } from '../../contexts/CartContext';

export default function Providers({ children }) {
  return (
    <AppProvider>
      <CartProvider>
        {children}
      </CartProvider>
    </AppProvider>
  );
}