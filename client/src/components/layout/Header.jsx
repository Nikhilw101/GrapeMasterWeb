import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Search, Menu, Grape, User, LogOut, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { APP_CONFIG } from '@/constants/config';
import logo from '@/assets/logo.png';

/**
 * Header Component
 * Sticky header with logo, search, My Orders, and cart
 */
export function Header({ cartCount, onCartClick, user, searchQuery, onSearchChange }) {
    const { logout } = useAuth();

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="sticky top-0 bg-white/95 backdrop-blur-md shadow-sm z-50 transition-all duration-300"
        >
            <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14 sm:h-20 gap-2 min-w-0">
                    {/* Left Section: Menu + Logo */}
                    <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1">
                        {/* Mobile Menu */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden -ml-2">
                                    <Menu className="w-6 h-6 text-gray-700" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left">
                                <nav className="flex flex-col space-y-4 mt-8">
                                    <Link to="/" className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors">
                                        Home
                                    </Link>
                                    <a href="#products" className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors">
                                        Products
                                    </a>
                                    <a href="#categories" className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors">
                                        Categories
                                    </a>
                                    <a href="#about" className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors">
                                        About
                                    </a>
                                    <Link to="/be-a-dealer" className="text-lg font-medium text-green-600 hover:text-green-700 transition-colors font-semibold">
                                        Be a Dealer
                                    </Link>
                                    {user ? (
                                        <>
                                            <Link to="/profile?tab=orders" className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors flex items-center">
                                                <Package className="w-5 h-5 mr-2" /> My Orders
                                            </Link>
                                            <div className="pt-4 border-t border-gray-100">
                                                <p className="text-sm text-gray-500 mb-2">Signed in as</p>
                                                <p className="font-semibold text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.mobile}</p>
                                            </div>
                                            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl" onClick={logout}>
                                                <LogOut className="w-4 h-4 mr-2" />
                                                Logout
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                                            <Link to="/login">
                                                <Button className="w-full">Login</Button>
                                            </Link>
                                            <Link to="/signup">
                                                <Button variant="outline" className="w-full">Create Account</Button>
                                            </Link>
                                        </div>
                                    )}
                                </nav>
                            </SheetContent>
                        </Sheet>

                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 min-w-0 shrink-0">
                            <img
                                src={logo}
                                alt="GrapeMaster Logo"
                                className="h-8 w-auto sm:h-12 object-contain shrink-0"
                            />
                            <span className="text-sm sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
                                {APP_CONFIG.name}
                            </span>
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 sm:space-x-4 shrink-0">
                        <Link to="/be-a-dealer" className="hidden sm:block">
                            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                                Be a Dealer
                            </Button>
                        </Link>
                        {typeof searchQuery === 'string' && (
                            <div className="hidden sm:flex items-center rounded-full border border-gray-200 bg-gray-50/80 pl-3 pr-2 py-1.5 min-w-0 w-20 sm:w-40 md:max-w-[220px] focus-within:border-green-500 focus-within:bg-white transition-all shrink">
                                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                                <input
                                    type="search"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={e => onSearchChange?.(e.target.value)}
                                    className="flex-1 bg-transparent border-0 text-sm outline-none ml-2 placeholder:text-gray-400 min-w-0"
                                />
                            </div>
                        )}

                        {user && (
                            <Link to="/profile?tab=orders">
                                <Button variant="ghost" size="icon" className="rounded-xl" title="My Orders">
                                    <Package className="w-5 h-5 text-gray-600" />
                                </Button>
                            </Link>
                        )}

                        <Button variant="ghost" size="icon" className="relative rounded-xl" onClick={onCartClick}>
                            <ShoppingCart className="w-5 h-5 text-gray-600" />
                            {cartCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs flex items-center justify-center rounded-full font-semibold"
                                >
                                    {cartCount}
                                </motion.span>
                            )}
                        </Button>

                        {/* Auth Buttons / User Profile */}
                        {user ? (
                            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 ml-2">
                                <Link to="/profile" className="hidden md:flex flex-col items-end mr-2 hover:opacity-80">
                                    <span className="text-sm font-medium text-gray-700 leading-none">{user.name}</span>
                                </Link>
                                <Button variant="ghost" size="icon" onClick={logout} title="Logout" className="text-gray-500 hover:text-red-600">
                                    <LogOut className="w-5 h-5" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 ml-2">
                                <Link to="/login" className="hidden sm:block">
                                    <Button variant="ghost" size="sm">Login</Button>
                                </Link>
                                <Link to="/signup" className="hidden sm:block">
                                    <Button size="sm">Sign Up</Button>
                                </Link>
                                <Link to="/login" className="sm:hidden">
                                    <Button variant="ghost" size="icon">
                                        <User className="w-5 h-5 text-gray-600" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

export default Header;
