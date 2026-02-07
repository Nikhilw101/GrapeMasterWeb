import React from 'react';
import { motion } from 'framer-motion';

/**
 * CategoryCard Component
 * Displays category with icon and name; supports selection for filtering
 */
export function CategoryCard({ category, isSelected, onClick }) {
    const Icon = category.icon;

    return (
        <motion.button
            type="button"
            onClick={onClick}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`group rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 border flex flex-col items-center w-full ${
                isSelected
                    ? 'bg-green-50 border-green-400 ring-2 ring-green-200'
                    : 'bg-white border-gray-100 hover:border-green-200'
            }`}
        >
            <div className="flex flex-col items-center space-y-2">
                <motion.div
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected ? 'bg-green-200' : 'bg-green-50 group-hover:bg-green-100'
                    }`}
                >
                    <Icon className={`w-6 h-6 sm:w-7 sm:h-7 ${isSelected ? 'text-green-800' : 'text-green-600'}`} />
                </motion.div>
                <p className={`text-sm font-medium transition-colors ${isSelected ? 'text-green-800' : 'text-gray-700 group-hover:text-green-700'}`}>
                    {category.name}
                </p>
            </div>
        </motion.button>
    );
}

export default CategoryCard;
