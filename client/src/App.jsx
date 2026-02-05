import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { PRODUCTS } from '@/constants/products';
import { Toaster } from 'sonner';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import {
    AdminLoginPage,
    DashboardPage,
    ProductManager,
    UserManager,
    OrderManager
} from '@/pages/admin';
import '@/styles/index.css';

/**
 * Main Layout Component
 * Wraps pages with Header, Footer, and CartDrawer which need context access
 */
const AppLayout = () => {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { user } = useAuth();

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
            <Toaster position="top-center" richColors />
            <Header
                cartCount={getCartCount()}
                wishlistCount={wishlist.length}
                onCartClick={() => setIsCartOpen(true)}
                user={user}
            />

            <main className="flex-1">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <HomePage
                                products={PRODUCTS}
                                onAddToCart={addToCart}
                                onToggleWishlist={toggleWishlist}
                                isInWishlist={isInWishlist}
                            />
                        }
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                </Routes>
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
};

/**
 * Main App Component
 * Root component managing global state and layout
 */
function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="products" element={<ProductManager />} />
                        <Route path="users" element={<UserManager />} />
                        <Route path="orders" element={<OrderManager />} />
                        {/* Add other admin routes here as they are created */}
                    </Route>

                    {/* Public Routes */}
                    <Route path="/*" element={<AppLayout />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
