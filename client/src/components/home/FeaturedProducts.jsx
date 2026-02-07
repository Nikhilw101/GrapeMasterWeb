import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { ProductGrid } from '@/components/product/ProductGrid';

/**
 * FeaturedProducts Component
 * Displays featured/fresh products section
 */
export function FeaturedProducts({ products = [], searchQuery, onAddToCart, onToggleWishlist, isInWishlist }) {
    const hasFilter = !!searchQuery?.trim();
    const isEmpty = !products?.length;

    return (
        <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex flex-wrap items-center justify-between gap-2 mb-6"
            >
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{hasFilter ? 'Search results' : 'Fresh This Week'}</h2>
                <a href="#products" className="text-green-600 font-medium text-sm hover:text-green-700 flex items-center space-x-1 group rounded-xl transition-colors">
                    <span>See All</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
            </motion.div>

            {isEmpty ? (
                <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
                    <p className="text-gray-500">{hasFilter ? 'No products match your search or category.' : 'No products available.'}</p>
                </div>
            ) : (
                <ProductGrid
                    products={products}
                    onAddToCart={onAddToCart}
                    onToggleWishlist={onToggleWishlist}
                    isInWishlist={isInWishlist}
                />
            )}
        </section>
    );
}

export default FeaturedProducts;
