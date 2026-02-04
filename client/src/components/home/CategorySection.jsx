import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CategoryCard } from '@/components/product/CategoryCard';
import { CATEGORIES } from '@/constants/categories';

/**
 * CategorySection Component
 * Browse categories section with grid layout
 */
export function CategorySection() {
    return (
        <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between mb-6"
            >
                <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
                <button className="text-green-600 font-medium text-sm hover:text-green-700 flex items-center space-x-1 group">
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
                {CATEGORIES.map((category, index) => (
                    <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <CategoryCard category={category} />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

export default CategorySection;
