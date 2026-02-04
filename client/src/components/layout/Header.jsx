import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Search, Menu, Grape } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { APP_CONFIG } from '@/constants/config';
import logo from '@/assets/logo.png';

/**
 * Header Component
 * Sticky header with logo, search, wishlist, and cart
 */
export function Header({ cartCount, wishlistCount, onCartClick }) {
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
                                    <a href="#" className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors">
                                        Home
                                    </a>
                                    <a href="#products" className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors">
                                        Products
                                    </a>
                                    <a href="#categories" className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors">
                                        Categories
                                    </a>
                                    <a href="#about" className="text-lg font-medium text-gray-900 hover:text-green-600 transition-colors">
                                        About
                                    </a>
                                </nav>
                            </SheetContent>
                        </Sheet>

                        {/* Logo */}
                        <div className="flex items-center space-x-2">
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
                        </div>
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
                    </div>
                </div>
            </div>
        </motion.header>
    );
}

export default Header;
