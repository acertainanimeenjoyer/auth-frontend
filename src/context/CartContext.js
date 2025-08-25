import { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const authHeader = token ? { Authorization: `Bearer ${token}` } : {};

  const refresh = async () => {
    if (!token) return setCart({ items: [] });
    const { data } = await axios.get('/api/cart', { headers: authHeader });
    setCart(data);
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, [token]);

  const addItem = async ({ productId, sku, quantity = 1 }) => {
    const { data } = await axios.post('/api/cart/items', { productId, sku, quantity }, { headers: authHeader });
    setCart(data);
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await axios.put(`/api/cart/items/${itemId}`, { quantity }, { headers: authHeader });
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const { data } = await axios.delete(`/api/cart/items/${itemId}`, { headers: authHeader });
    setCart(data);
  };

  const clear = async () => {
    const { data } = await axios.delete('/api/cart', { headers: authHeader });
    setCart(data);
  };

  return (
    <CartContext.Provider value={{ cart, refresh, addItem, updateItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
};
