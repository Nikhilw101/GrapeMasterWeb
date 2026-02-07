import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    Users,
    ShoppingBag,
    LogOut,
    Menu,
    X,
    Settings,
    Store
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import { adminLogout } from '@/services/admin.service';
import api from '@/services/api';

const SidebarItem = ({ icon: Icon, label, path, isActive, onClick }) => (
    <Link
        to={path}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${isActive
            ? 'bg-green-50 text-green-700 font-medium'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
    >
        <Icon className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
        <span>{label}</span>
    </Link>
);

export default function AdminLayout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

    // Protect routes
    React.useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            navigate('/admin/login');
        }

        // Add interceptor to handle 401s globally (e.g. token expired)
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    toast.error('Session expired or invalid. Please log in again.');
                    adminLogout();
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, [navigate]);

    const handleLogout = () => {
        adminLogout();
    };

    const routes = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/admin/products', label: 'Products', icon: Package },
        { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
        { path: '/admin/users', label: 'Users', icon: Users },
        { path: '/admin/dealer-requests', label: 'Dealer Requests', icon: Store },
        { path: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <AnimatePresence mode='wait'>
                {(isSidebarOpen || window.innerWidth >= 1024) && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        className="fixed lg:static inset-y-0 left-0 z-50 w-[min(18rem,100vw-2rem)] lg:w-72 bg-white border-r border-gray-200 shadow-lg lg:shadow-none overflow-y-auto"
                    >
                        <div className="h-full flex flex-col">
                            {/* specific header */}
                            <div className="h-14 sm:h-16 flex items-center justify-between px-4 sm:px-6 border-b border-gray-100 shrink-0">
                                <Link to="/admin/dashboard" className="flex items-center gap-2 min-w-0">
                                    <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                                        G
                                    </div>
                                    <span className="text-base sm:text-xl font-bold text-gray-900 truncate">AdminPanel</span>
                                </Link>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="lg:hidden p-1 hover:bg-gray-100 rounded-md"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Nav */}
                            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                                {routes.map((route) => (
                                    <SidebarItem
                                        key={route.path}
                                        {...route}
                                        isActive={location.pathname === route.path}
                                        onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                                    />
                                ))}
                            </nav>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-100">
                                <div className="flex items-center gap-3 px-4 py-3 mb-2">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                                        {adminUser.name?.[0] || 'A'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {adminUser.name || 'Admin'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {adminUser.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span>Logout</span>
                                </button>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                <Toaster position="top-right" richColors />
                {/* Header */}
                <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-4 lg:px-8 min-w-0">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
                    >
                        <Menu className="w-6 h-6 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <span className="text-sm text-gray-500 hidden sm:inline-block">
                            {new Date().toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                weekday: 'long'
                            })}
                        </span>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 min-w-0 overflow-auto bg-gray-50 p-3 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto min-w-0">
                        <Outlet />
                    </div>
                </main>
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
        </div>
    );
}
