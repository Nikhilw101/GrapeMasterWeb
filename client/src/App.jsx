import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BottomNav } from '@/components/layout/BottomNav';
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
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import ProductDetailsPage from '@/pages/ProductDetailsPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import PaymentCancelPage from '@/pages/PaymentCancelPage';
import BeADealerPage from '@/pages/BeADealerPage';
import {
    AdminLoginPage,
    AdminForgotPasswordPage,
    AdminResetPasswordPage,
    DashboardPage,
    ProductManager,
    UserManager,
    OrderManager,
    SettingsPage,
    DealerRequestsPage
} from '@/pages/admin';
import '@/styles/index.css';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    if (loading) return null;
    if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
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

    const { toggleWishlist, isInWishlist } = useWishlist();

    // Home search (keyword + category) – lifted for Header and HomePage
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

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
        <div className="min-h-screen flex flex-col overflow-x-hidden">
            <Toaster position="top-center" richColors />
            <Header
                cartCount={getCartCount()}
                onCartClick={() => setIsCartOpen(true)}
                user={user}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
            />

            <main className="flex-1 pb-20 md:pb-0">
                <Routes>
                    <Route
                        path="/"
                        element={
                            <HomePage
                                products={products}
                                searchQuery={searchQuery}
                                categoryFilter={categoryFilter}
                                onSearchQueryChange={setSearchQuery}
                                onCategoryFilterChange={setCategoryFilter}
                                onAddToCart={addToCart}
                                onToggleWishlist={toggleWishlist}
                                isInWishlist={isInWishlist}
                            />
                        }
                    />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />
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
                    <Route path="/be-a-dealer" element={<BeADealerPage />} />
                    <Route
                        path="/payment/success"
                        element={
                            <ProtectedRoute>
                                <PaymentSuccessPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/payment/cancel"
                        element={
                            <ProtectedRoute>
                                <PaymentCancelPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </main>

            <Footer />

            <BottomNav cartCount={getCartCount()} onCartClick={() => setIsCartOpen(true)} user={user} />

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
                    <Route path="/admin/forgot-password" element={<AdminForgotPasswordPage />} />
                    <Route path="/admin/reset-password" element={<AdminResetPasswordPage />} />
                    <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<Navigate to="/admin/dashboard" replace />} />
                        <Route path="dashboard" element={<DashboardPage />} />
                        <Route path="products" element={<ProductManager />} />
                        <Route path="users" element={<UserManager />} />
                        <Route path="orders" element={<OrderManager />} />
                        <Route path="settings" element={<SettingsPage />} />
                        <Route path="dealer-requests" element={<DealerRequestsPage />} />
                    </Route>

                    {/* Public Routes */}
                    <Route path="/*" element={<AppLayout />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
