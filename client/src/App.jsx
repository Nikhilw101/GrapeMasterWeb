import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomePage } from '@/pages/HomePage';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { PRODUCTS } from '@/constants/products';
import '@/styles/index.css';

/**
 * Main App Component
 * Root component managing global state and layout
 */
function App() {
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Cart management
    const {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        getCartCount,
    } = useCart();

    // Wishlist management
    const { wishlist, toggleWishlist, isInWishlist } = useWishlist();

    return (
        <div className="min-h-screen flex flex-col">
            <Header
                cartCount={getCartCount()}
                wishlistCount={wishlist.length}
                onCartClick={() => setIsCartOpen(true)}
            />

            <main className="flex-1">
                <HomePage
                    products={PRODUCTS}
                    onAddToCart={addToCart}
                    onToggleWishlist={toggleWishlist}
                    isInWishlist={isInWishlist}
                />
            </main>

            <Footer />

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cart={cart}
                onUpdateQuantity={updateQuantity}
                onRemove={removeFromCart}
                cartTotal={getCartTotal()}
            />
        </div>
    );
}

export default App;
