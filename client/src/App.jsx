import React, { useState, useEffect } from 'react';
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
import { Toaster } from 'sonner';
import AdminLayout from '@/components/admin/layout/AdminLayout';
import CheckoutPage from '@/pages/CheckoutPage';
import ProfilePage from '@/pages/ProfilePage';
import ProductDetailsPage from '@/pages/ProductDetailsPage';
import {
    AdminLoginPage,
    DashboardPage,
    ProductManager,
    UserManager,
    OrderManager,
    SettingsPage
} from '@/pages/admin';
import '@/styles/index.css';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    if (loading) return null; // Or a loader
    if (!isAuthenticated) return <Navigate to="/login" />;
    return children;
};

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

    // Product management
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { getProducts } = await import('@/services/product.service');
                const result = await getProducts();
                if (result.success) {
                    setProducts(result.data);
                }
            } catch (error) {
                console.error('Failed to fetch products:', error);
            }
        };
        fetchProducts();
    }, []);

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
                                products={products}
                                onAddToCart={addToCart}
                                onToggleWishlist={toggleWishlist}
                                isInWishlist={isInWishlist}
                            />
                        }
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <CheckoutPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/product/:id" element={<ProductDetailsPage />} />
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
                        <Route path="settings" element={<SettingsPage />} />
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
