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
    const [categories, setCategories] = React.useState([]);

    React.useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { getCategories } = await import('@/services/product.service');
                const result = await getCategories();
                if (result.success) {
                    // Map fetched strings to category objects with icons
                    // Ideally, backend should provide this, but for now we map dynamically
                    const mappedCategories = result.data.map((catName, index) => {
                        // Find matching config from constants or use default
                        const match = CATEGORIES.find(c => c.name === catName) || {};
                        return {
                            id: index + 1,
                            name: catName,
                            slug: match.slug || catName.toLowerCase().replace(/\s+/g, '-'),
                            icon: match.icon || CATEGORIES[0].icon
                        };
                    });
                    setCategories(mappedCategories);
                }
            } catch (error) {
                console.error('Failed to fetch categories:', error);
                // Fallback to static if fail
                setCategories(CATEGORIES);
            }
        };
        fetchCategories();
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
                <button className="text-green-600 font-medium text-sm hover:text-green-700 flex items-center space-x-1 group">
                    <span className="hidden sm:inline">View All</span>
                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            </motion.div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
                {categories.map((category, index) => (
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
