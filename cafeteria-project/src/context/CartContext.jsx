import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { isMenuItemAvailable } from '../utils/isMenuItemAvailable';

const CartContext = createContext();

function readCartFromStorage() {
  try {
    const saved = localStorage.getItem('studentCart');
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem('studentCart');
    return [];
  }
}

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(readCartFromStorage);
  const [cafeteriaId, setCafeteriaId] = useState(() => {
    return localStorage.getItem('studentCartCafeteria') || null;
  });

  useEffect(() => {
    localStorage.setItem('studentCart', JSON.stringify(cart));
    if (cafeteriaId) localStorage.setItem('studentCartCafeteria', cafeteriaId);
    else localStorage.removeItem('studentCartCafeteria');
  }, [cart, cafeteriaId]);

  const addToCart = (item, currentCafeteriaId, options = {}) => {
    if (!isMenuItemAvailable(item)) {
      options.onBlocked?.(item);
      return { ok: false, reason: 'sold_out' };
    }

    // If adding from a different cafeteria, clear old cart
    if (cafeteriaId && currentCafeteriaId && cafeteriaId !== currentCafeteriaId) {
       if(!window.confirm("Adding items from a different cafeteria will clear your current cart. Continue?")) {
         return { ok: false, reason: 'cancelled' };
       }
       setCart([{ ...item, qty: 1 }]);
       setCafeteriaId(currentCafeteriaId);
       return { ok: true };
    }
    
    if (!cafeteriaId && currentCafeteriaId) {
        setCafeteriaId(currentCafeteriaId);
    }

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
    return { ok: true };
  };

  const removeUnavailableFromCart = useCallback((unavailableIds) => {
    const idSet = new Set(unavailableIds.map(String));
    setCart((prev) => {
      const next = prev.filter((i) => !idSet.has(String(i.id)));
      if (next.length === 0) setCafeteriaId(null);
      return next;
    });
  }, []);

  const removeFromCart = (itemId) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing && existing.qty > 1) {
        return prev.map(i => i.id === itemId ? { ...i, qty: i.qty - 1 } : i);
      }
      const newCart = prev.filter(i => i.id !== itemId);
      if (newCart.length === 0) setCafeteriaId(null);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    setCafeteriaId(null);
  };

  const getCartQty = (itemId) => {
    const item = cart.find(i => i.id === itemId);
    return item ? item.qty : 0;
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart,
      cafeteriaId,
      addToCart,
      removeFromCart,
      clearCart,
      getCartQty,
      cartTotal,
      cartItemCount,
      removeUnavailableFromCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};
