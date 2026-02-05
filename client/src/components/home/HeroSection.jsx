import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Truck, Leaf, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * HeroSection Component
 * Main hero section with call-to-action and trust indicators
 */
export function HeroSection() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-center">
                {/* Left Content - Takes 7 columns */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="space-y-6 sm:space-y-8 lg:col-span-7"
                >
                    <Badge className="inline-flex items-center space-x-2 px-4 py-2">
                        <Shield className="w-4 h-4" />
                        <span>Premium Quality Guaranteed</span>
                    </Badge>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                        Fresh Grapes
                        <span className="block gradient-text mt-2">
                            Delivered to Your Door
                        </span>
                    </h1>

                    <p className="text-base sm:text-lg lg:text-xl text-gray-600 leading-relaxed max-w-xl">
                        Premium selection of organic grapes, carefully sourced from trusted farms.
                        Experience exceptional freshness with every order.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button size="lg" className="w-full sm:w-auto group">
                                <span>Shop Now</span>
                                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                View Collection
                            </Button>
                        </motion.div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-3 gap-4 sm:gap-6 pt-8 border-t border-gray-200">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center sm:text-left"
                        >
                            <Truck className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 mx-auto sm:mx-0 mb-2" />
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">Fast Delivery</p>
                            <p className="text-xs text-gray-500 hidden sm:block">Orders over ₹500</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center sm:text-left"
                        >
                            <Leaf className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 mx-auto sm:mx-0 mb-2" />
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">100% Organic</p>
                            <p className="text-xs text-gray-500 hidden sm:block">Certified fresh</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-center sm:text-left"
                        >
                            <Award className="w-6 h-6 sm:w-7 sm:h-7 text-green-600 mx-auto sm:mx-0 mb-2" />
                            <p className="text-xs sm:text-sm font-semibold text-gray-900">Top Quality</p>
                            <p className="text-xs text-gray-500 hidden sm:block">Hand-selected</p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right Image - Takes 5 columns */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                    className="relative mt-8 lg:mt-0 order-first lg:order-last lg:col-span-5"
                >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-square max-h-[500px] mx-auto w-full">
                        <img
                            src="https://images.unsplash.com/photo-1596363505729-4190a9506133?w=800&auto=format&fit=crop&q=80"
                            alt="Fresh premium grapes"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent"></div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-green-600/10 rounded-full blur-3xl"></div>
                </motion.div>
            </div>
        </section>
    );
}

export default HeroSection;
