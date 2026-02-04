import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';

/**
 * FeaturedProducts Component
 * Displays featured/fresh products section
 */
export function FeaturedProducts({ products, onAddToCart, onToggleWishlist, isInWishlist }) {
    return (
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between mb-6"
            >
                <h2 className="text-2xl font-bold text-gray-900">Fresh This Week</h2>
                <button className="text-green-600 font-medium text-sm hover:text-green-700 flex items-center space-x-1 group">
                    <span>See All</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>

            <ProductGrid
                products={products}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={isInWishlist}
            />
        </section>
    );
}

export default FeaturedProducts;
