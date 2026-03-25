import { createContext, useContext, useState, ReactNode } from "react";

interface CartSummaryContextType {
  totalItems: number;
  totalPrice: number;
  setCartSummary: (totalItems: number, totalPrice: number) => void;
}

const CartSummaryContext = createContext<CartSummaryContextType>({
  totalItems: 0,
  totalPrice: 0,
  setCartSummary: () => {},
});

export const CartSummaryProvider = ({ children }: { children: ReactNode }) => {
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);

  const setCartSummary = (items: number, price: number) => {
    setTotalItems(items);
    setTotalPrice(price);
  };

  return (
    <CartSummaryContext.Provider value={{ totalItems, totalPrice, setCartSummary }}>
      {children}
    </CartSummaryContext.Provider>
  );
};

export const useCartSummary = () => useContext(CartSummaryContext);
