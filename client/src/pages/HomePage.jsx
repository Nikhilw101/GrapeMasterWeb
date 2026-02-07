import React, { useMemo } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { PromoSection } from '@/components/home/PromoSection';

/**
 * HomePage Component
 * Main landing page with keyword search and category filter (real data)
 */
export function HomePage({
    products,
    searchQuery = '',
    categoryFilter = '',
    onSearchQueryChange,
    onCategoryFilterChange,
    onAddToCart,
    onToggleWishlist,
    isInWishlist
}) {
    const filteredProducts = useMemo(() => {
        let list = Array.isArray(products) ? products : [];
        const q = (searchQuery || '').trim().toLowerCase();
        const cat = (categoryFilter || '').trim().toLowerCase();
        if (q) {
            list = list.filter(
                p =>
                    (p.name && p.name.toLowerCase().includes(q)) ||
                    (p.category && p.category.toLowerCase().includes(q))
            );
        }
        if (cat) {
            list = list.filter(p => p.category && p.category.toLowerCase() === cat);
        }
        return list;
    }, [products, searchQuery, categoryFilter]);

    return (
        <>
            <HeroSection />
            <CategorySection
                selectedCategory={categoryFilter}
                onSelectCategory={onCategoryFilterChange}
            />
            <FeaturedProducts
                products={filteredProducts}
                searchQuery={searchQuery}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={isInWishlist}
            />
            <PromoSection />
        </>
    );
}

export default HomePage;
