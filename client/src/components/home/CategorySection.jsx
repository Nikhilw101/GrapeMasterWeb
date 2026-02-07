import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { CategoryCard } from '@/components/product/CategoryCard';
import { CATEGORIES } from '@/constants/categories';
import { getCategories } from '@/services/product.service';

/**
 * CategorySection Component
 * Real categories from DB; selection filters products on home
 */
export function CategorySection({ selectedCategory = '', onSelectCategory }) {
    const [categories, setCategories] = useState(CATEGORIES);

    useEffect(() => {
        let cancelled = false;
        const fetchCategories = async () => {
            try {
                const result = await getCategories();
                if (cancelled) return;
                if (result?.success && Array.isArray(result?.data)) {
                    const mapped = result.data.map((catName, index) => {
                        const match = CATEGORIES.find(c => c.name === catName) || {};
                        return {
                            id: index + 1,
                            name: catName,
                            slug: match.slug || catName.toLowerCase().replace(/\s+/g, '-'),
                            icon: match.icon || CATEGORIES[0]?.icon
                        };
                    });
                    if (mapped.length > 0) setCategories(mapped);
                }
            } catch {
                if (!cancelled) setCategories(CATEGORIES);
            }
        };
        fetchCategories();
        return () => { cancelled = true; };
    }, []);

    if (categories.length === 0) return null;

    return (
        <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="flex items-center justify-between mb-8"
            >
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Shop by Category</h2>
                <button
                    type="button"
                    onClick={() => onSelectCategory?.('')}
                    className="text-green-600 font-medium text-sm hover:text-green-700 flex items-center space-x-1 group rounded-xl transition-colors"
                >
                    <span className="hidden sm:inline">View All</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {categories.map((category, index) => (
                    <motion.div
                        key={category.id ?? category.name}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <CategoryCard
                            category={category}
                            isSelected={selectedCategory && category.name.toLowerCase() === selectedCategory.toLowerCase()}
                            onClick={() => onSelectCategory?.(category.name)}
                        />
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

export default CategorySection;
