import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { getAssetBaseUrl } from '@/config/env';

/**
 * ProductCard Component
 * Displays individual product with image, details, and actions
 * Features Framer Motion animations for smooth interactions
 */
export function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            whileHover={{ scale: 1.02 }}
            className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
        >
            {/* Product Image */}
            <Link to={`/product/${product.id || product._id}`} className="block relative aspect-square overflow-hidden bg-gray-50">
                <motion.img
                    src={(() => {
                        if (!product.image) return '/placeholder.jpg';
                        if (product.image.startsWith('http')) return product.image;
                        const path = product.image.startsWith('/') ? product.image : `/${product.image}`;
                        return `${getAssetBaseUrl()}${path}`;
                    })()}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/400x400?text=No+Image';
                    }}
                />

                {/* Wishlist Button */}
                <motion.button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleWishlist(product.id || product._id);
                    }}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200 z-10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Heart
                        className={`w-5 h-5 transition-colors ${isInWishlist
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-600'
                            }`}
                    />
                </motion.button>

                {/* Rating Badge – only when product has a rating (dynamic) */}
                {typeof product.rating === 'number' && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-semibold text-gray-900">{product.rating}</span>
                    </div>
                )}
            </Link>

            {/* Product Info - compact on mobile */}
            <div className="p-2 sm:p-4">
                <Link to={`/product/${product.id || product._id}`} className="block">
                    <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 line-clamp-2 text-sm sm:text-base hover:text-green-600 transition-colors">{product.name}</h3>
                </Link>
                <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">{product.weight || product.unit || '1 kg'}</p>

                <div className="flex items-center justify-between gap-1">
                    <span className="text-lg sm:text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="icon"
                            onClick={() => onAddToCart(product)}
                            className="rounded-xl h-8 w-8 sm:h-10 sm:w-10"
                        >
                            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

export default ProductCard;
