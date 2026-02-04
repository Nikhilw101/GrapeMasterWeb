import React from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { CategorySection } from '@/components/home/CategorySection';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { PromoSection } from '@/components/home/PromoSection';

/**
 * HomePage Component
 * Main landing page composing all sections
 */
export function HomePage({ products, onAddToCart, onToggleWishlist, isInWishlist }) {
    return (
        <>
            <HeroSection />
            <CategorySection />
            <FeaturedProducts
                products={products}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                isInWishlist={isInWishlist}
            />
            <PromoSection />
        </>
    );
}

export default HomePage;
