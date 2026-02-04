import React from 'react';
import { motion } from 'framer-motion';

/**
 * CategoryCard Component
 * Displays category with icon and name
 */
export function CategoryCard({ category }) {
    const Icon = category.icon;

    return (
        <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="group bg-white rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 hover:border-green-200"
        >
            <div className="flex flex-col items-center space-y-2">
                <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className="w-12 h-12 sm:w-14 sm:h-14 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors"
                >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                </motion.div>
                <p className="text-sm font-medium text-gray-700 group-hover:text-green-700 transition-colors">
                    {category.name}
                </p>
            </div>
        </motion.button>
    );
}

export default CategoryCard;
