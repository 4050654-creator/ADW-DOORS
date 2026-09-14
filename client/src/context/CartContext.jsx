import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);

const STORAGE_KEY = "basant_store_cart";

const getProductPrice = (product) => {
  return Number(product.salePrice ?? product.price ?? 0);
};

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem(STORAGE_KEY);

      if (!savedCart) {
        return [];
      }

      const parsedCart = JSON.parse(savedCart);

      return Array.isArray(parsedCart) ? parsedCart : [];
    } catch (error) {
      console.error("Cart loading error:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Cart saving error:", error);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product?._id) {
      return {
        success: false,
        message: "Invalid product",
      };
    }

    const stock = Number(product.stock ?? 0);

    if (stock <= 0) {
      return {
        success: false,
        message: "Product is out of stock",
      };
    }

    const safeQuantity = Math.max(1, Number(quantity) || 1);

    setCartItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item._id === product._id
      );

      if (existingItem) {
        const newQuantity = Math.min(
          existingItem.quantity + safeQuantity,
          stock
        );

        return currentItems.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: newQuantity,
                stock,
              }
            : item
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: Math.min(safeQuantity, stock),
          stock,
        },
      ];
    });

    return {
      success: true,
      message: "Added to cart",
    };
  };

  const removeFromCart = (productId) => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item._id !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    const newQuantity = Number(quantity);

    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item._id !== productId) {
            return item;
          }

          const stock = Number(item.stock ?? 0);

          if (newQuantity <= 0) {
            return null;
          }

          return {
            ...item,
            quantity: Math.min(newQuantity, stock),
          };
        })
        .filter(Boolean)
    );
  };

  const increaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems.map((item) => {
        if (item._id !== productId) {
          return item;
        }

        const stock = Number(item.stock ?? 0);

        return {
          ...item,
          quantity: Math.min(item.quantity + 1, stock),
        };
      })
    );
  };

  const decreaseQuantity = (productId) => {
    setCartItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item._id !== productId) {
            return item;
          }

          if (item.quantity <= 1) {
            return null;
          }

          return {
            ...item,
            quantity: item.quantity - 1,
          };
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const price = getProductPrice(item);

      return total + price * item.quantity;
    }, 0);
  }, [cartItems]);

  const isInCart = (productId) => {
    return cartItems.some((item) => item._id === productId);
  };

  const value = {
    cartItems,
    cartCount,
    subtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    isInCart,
    getProductPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}

export default CartProvider;