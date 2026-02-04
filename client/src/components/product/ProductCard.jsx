import React from 'react';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';

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
            className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden"
        >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
                <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                />

                {/* Wishlist Button */}
                <motion.button
                    onClick={() => onToggleWishlist(product.id)}
                    className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-all duration-200"
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

                {/* Rating Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-semibold text-gray-900">{product.rating}</span>
                </div>
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{product.weight}</p>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="icon"
                            onClick={() => onAddToCart(product)}
                            className="rounded-xl"
                        >
                            <ShoppingCart className="w-5 h-5" />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

export default ProductCard;
