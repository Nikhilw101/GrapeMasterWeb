import React from 'react';
import { motion } from 'framer-motion';
import { ProductCard } from './ProductCard';

/**
 * ProductGrid Component
 * Responsive grid layout for product cards with stagger animation
 */
export function ProductGrid({ products, onAddToCart, onToggleWishlist, isInWishlist }) {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
        >
            {products.map((product) => (
                <motion.div key={product.id} variants={item}>
                    <ProductCard
                        product={product}
                        onAddToCart={onAddToCart}
                        onToggleWishlist={onToggleWishlist}
                        isInWishlist={isInWishlist(product.id)}
                    />
                </motion.div>
            ))}
        </motion.div>
    );
}

export default ProductGrid;
