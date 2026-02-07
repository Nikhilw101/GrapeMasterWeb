import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { useAuth } from '@/context/AuthContext';
import * as cartService from '@/services/cart.service';
import { toast } from 'sonner';

/**
 * Custom hook for shopping cart management
 * Supports both local storage (guest) and backend database (authenticated)
 */
export function useCart() {
    const { isAuthenticated } = useAuth();
    const [localCart, setLocalCart] = useLocalStorage('grapemaster-cart', []);
    const [cart, setCart] = useState([]);
    const [isLoading, setIsLoading] = useState(isAuthenticated);

    // Sync state with local storage or backend
    useEffect(() => {
        if (isAuthenticated) {
            fetchBackendCart();
        } else {
            setCart(localCart);
            setIsLoading(false);
        }
    }, [isAuthenticated, localCart]);

    const fetchBackendCart = async () => {
        try {
            setIsLoading(true);
            const result = await cartService.getCart();
            if (result?.success && result?.data?.items) {
                const backendItems = result.data.items.map(item => ({
                    id: item.product?._id,
                    product: item.product?._id,
                    name: item.product?.name,
                    price: item.product?.price,
                    image: item.product?.image,
                    weight: item.product?.weight || item.product?.unit || '1 kg',
                    quantity: item.quantity
                }));
                setCart(backendItems);
            }
        } catch (error) {
            if (error.response?.status === 401) {
                return;
            }
            if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
                setCart([]);
                return;
            }
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = async (product) => {
        if (isAuthenticated) {
            try {
                // Backend expects: productId, quantity
                const result = await cartService.addToCart({
                    productId: product.id || product._id, // Handle different ID fields
                    quantity: 1
                });

                if (result.success) {
                    toast.success('Added to cart');
                    fetchBackendCart(); // Refresh cart
                }
            } catch (error) {
                toast.error('Failed to add to cart');
            }
        } else {
            // Local Storage Logic
            setLocalCart((prevCart) => {
                const existingItem = prevCart.find((item) => item.id === product.id);
                if (existingItem) {
                    return prevCart.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                return [...prevCart, { ...product, quantity: 1 }];
            });
            toast.success('Added to cart');
        }
    };

    const removeFromCart = async (productId) => {
        if (isAuthenticated) {
            try {
                await cartService.removeFromCart(productId);
                toast.success('Removed from cart');
                fetchBackendCart();
            } catch (error) {
                toast.error('Failed to remove item');
            }
        } else {
            setLocalCart((prevCart) => prevCart.filter((item) => item.id !== productId));
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (isAuthenticated) {
            try {
                await cartService.updateCartItem(productId, quantity);
                fetchBackendCart();
            } catch (error) {
                toast.error('Failed to update quantity');
            }
        } else {
            setLocalCart((prevCart) =>
                prevCart.map((item) =>
                    item.id === productId ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = async () => {
        if (isAuthenticated) {
            try {
                await cartService.clearCart();
                setCart([]);
            } catch (error) {
                console.error('Failed to clear cart');
            }
        } else {
            setLocalCart([]);
        }
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
        isLoading
    };
}

export default useCart;
