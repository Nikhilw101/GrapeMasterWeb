import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Search, Menu, Grape, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { APP_CONFIG } from '@/constants/config';
import logo from '@/assets/logo.png';

/**
 * Header Component
 * Sticky header with logo, search, wishlist, and cart
 */
export function Header({ cartCount, wishlistCount, onCartClick, user }) {
    const { logout } = useAuth();

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="sticky top-0 bg-white/95 backdrop-blur-md shadow-sm z-50 transition-all duration-300"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    {/* Left Section: Menu + Logo */}
                    <div className="flex items-center gap-2 sm:gap-4">
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
                                    {user ? (
                                        <>
                                            <div className="pt-4 border-t border-gray-100">
                                                <p className="text-sm text-gray-500 mb-2">Signed in as</p>
                                                <p className="font-semibold text-gray-900">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.mobile}</p>
                                            </div>
                                            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={logout}>
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
                        <Link to="/" className="flex items-center space-x-2">
                            <img
                                src={logo}
                                alt="GrapeMaster Logo"
                                className="h-10 sm:h-12 w-auto object-contain"
                            />
                            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent hidden sm:inline-block">
                                {APP_CONFIG.name}
                            </span>
                            <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent sm:hidden">
                                {APP_CONFIG.name}
                            </span>
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1 sm:space-x-4">
                        <Button variant="ghost" size="icon" className="hidden sm:flex">
                            <Search className="w-5 h-5 text-gray-600" />
                        </Button>

                        <Button variant="ghost" size="icon" className="relative">
                            <Heart className="w-5 h-5 text-gray-600" />
                            {wishlistCount > 0 && (
                                <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-semibold"
                                >
                                    {wishlistCount}
                                </motion.span>
                            )}
                        </Button>

                        <Button variant="ghost" size="icon" className="relative" onClick={onCartClick}>
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
                                <div className="hidden md:flex flex-col items-end mr-2">
                                    <span className="text-sm font-medium text-gray-700 leading-none">{user.name}</span>
                                    {/* Optional: Add role or other info */}
                                </div>
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
