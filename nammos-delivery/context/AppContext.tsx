import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, OrderType, Address, CartItem, Restaurant } from '../types';
import { getRestaurantDetails } from '../services/firebase';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User) => void;
  
  orderType: OrderType | null;
  setOrderType: (type: OrderType) => void;
  
  deliveryAddress: Address | null;
  setDeliveryAddress: (address: Address) => void;
  
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (tempId: string) => void;
  updateCartQuantity: (tempId: string, delta: number) => void;
  clearCart: () => void;
  cartSubtotal: number;
  cartTotal: number;
  
  activeOrderId: string | null;
  setActiveOrderId: (id: string) => void;

  restaurant: Restaurant | null;
  loadingRestaurant: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [orderType, setOrderType] = useState<OrderType | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<Address | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loadingRestaurant, setLoadingRestaurant] = useState(true);

  useEffect(() => {
    const fetchRest = async () => {
      try {
        const data = await getRestaurantDetails();
        setRestaurant(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingRestaurant(false);
      }
    };
    fetchRest();
  }, []);

  const addToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item]);
  };

  const removeFromCart = (tempId: string) => {
    setCartItems(prev => prev.filter(item => item.tempId !== tempId));
  };

  const updateCartQuantity = (tempId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.tempId === tempId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        return {
          ...item,
          quantity: newQty,
          totalPrice: newQty * item.unitPrice
        };
      }
      return item;
    }));
  };

  const clearCart = () => setCartItems([]);

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.totalPrice, 0);
  
  const deliveryFee = (orderType === OrderType.DELIVERY && restaurant) 
    ? restaurant.deliveryFeeBase 
    : 0;

  const cartTotal = cartSubtotal + deliveryFee;

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      orderType,
      setOrderType,
      deliveryAddress,
      setDeliveryAddress,
      cartItems,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartSubtotal,
      cartTotal,
      activeOrderId,
      setActiveOrderId,
      restaurant,
      loadingRestaurant
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
