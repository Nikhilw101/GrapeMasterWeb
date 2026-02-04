import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook for shopping cart management
 * Provides cart state and actions with localStorage persistence
 */
export function useCart() {
    const [cart, setCart] = useLocalStorage('grapemaster-cart', []);

    const addToCart = (product) => {
        setCart((prevCart) => {
            // Check if product already exists in cart
            const existingItem = prevCart.find((item) => item.id === product.id);

            if (existingItem) {
                // Increase quantity
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            // Add new item with quantity 1
            return [...prevCart, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
    };
}

export default useCart;
