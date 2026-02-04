import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook for wishlist management
 * Provides wishlist state and actions with localStorage persistence
 */
export function useWishlist() {
    const [wishlist, setWishlist] = useLocalStorage('grapemaster-wishlist', []);

    const toggleWishlist = (productId) => {
        setWishlist((prevWishlist) => {
            if (prevWishlist.includes(productId)) {
                return prevWishlist.filter((id) => id !== productId);
            }
            return [...prevWishlist, productId];
        });
    };

    const isInWishlist = (productId) => {
        return wishlist.includes(productId);
    };

    const clearWishlist = () => {
        setWishlist([]);
    };

    return {
        wishlist,
        toggleWishlist,
        isInWishlist,
        clearWishlist,
    };
}

export default useWishlist;
