import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Truck, Leaf, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * HeroSection Component
 * Main hero section with call-to-action and trust indicators
 */
export function HeroSection() {
    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                {/* Left Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="space-y-6"
                >
                    <Badge className="inline-flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Farm Fresh Quality</span>
                    </Badge>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                        Premium Grapes
                        <span className="block gradient-text">
                            Delivered Daily
                        </span>
                    </h1>

                    <p className="text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl">
                        Experience the finest organic grapes delivered straight to your door. Quality guaranteed, freshness assured.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button size="lg" className="w-full sm:w-auto group">
                                <span>Shop Now</span>
                                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                                Explore Varieties
                            </Button>
                        </motion.div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="grid grid-cols-3 gap-4 pt-8 border-t border-gray-200">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-center"
                        >
                            <Truck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900">Free Delivery</p>
                            <p className="text-xs text-gray-500">On orders $30+</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-center"
                        >
                            <Leaf className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900">100% Organic</p>
                            <p className="text-xs text-gray-500">Certified fresh</p>
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-center"
                        >
                            <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
                            <p className="text-sm font-medium text-gray-900">Safe & Secure</p>
                            <p className="text-xs text-gray-500">Quality checked</p>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Right Image */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
                    className="relative"
                >
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                        <img
                            src="https://images.unsplash.com/photo-1596363505729-4190a9506133?w=1200&auto=format&fit=crop&q=80"
                            alt="Fresh grapes"
                            className="w-full h-[400px] sm:h-[500px] object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>

                    {/* Floating Rating Badge */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8, type: 'spring' }}
                        className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6 animate-float"
                    >
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
                                <Star className="w-8 h-8 text-white fill-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-gray-900">4.9</p>
                                <p className="text-sm text-gray-500">Customer Rating</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

export default HeroSection;
