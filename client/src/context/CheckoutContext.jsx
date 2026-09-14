import { createContext, useContext, useState } from "react";

const CheckoutContext = createContext(null);

function CheckoutProvider({ children }) {
  const [buyNowItem, setBuyNowItem] = useState(null);

  const startBuyNow = (product, quantity = 1) => {
    if (!product?._id) {
      return false;
    }

    const stock = Number(product.stock || 0);

    if (stock <= 0) {
      return false;
    }

    const safeQuantity = Math.min(
      Math.max(1, Number(quantity) || 1),
      stock
    );

    setBuyNowItem({
      ...product,
      quantity: safeQuantity,
    });

    return true;
  };

  const clearBuyNow = () => {
    setBuyNowItem(null);
  };

  return (
    <CheckoutContext.Provider
      value={{
        buyNowItem,
        startBuyNow,
        clearBuyNow,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);

  if (!context) {
    throw new Error(
      "useCheckout must be used inside CheckoutProvider"
    );
  }

  return context;
}

export default CheckoutProvider;