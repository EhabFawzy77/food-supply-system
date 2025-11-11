// components/Providers.jsx
'use client';
import { AppProvider } from '../../contexts/AppContext';
import { CartProvider } from '../../contexts/CartContext';
import NotificationContainer from '../Notifications/NotificationContainer';

export default function Providers({ children }) {
  return (
    <AppProvider>
      <CartProvider>
        <NotificationContainer />
        {children}
      </CartProvider>
    </AppProvider>
  );
}