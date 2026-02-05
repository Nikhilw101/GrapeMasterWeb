import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * PromoSection Component
 * Newsletter subscription promotional banner
 */
export function PromoSection() {
    const [email, setEmail] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle newsletter signup (UI only for now)
        alert(`Thank you for subscribing with ${email}!`);
        setEmail('');
    };

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden"
            >
                {/* Decorative Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                            backgroundSize: '30px 30px',
                        }}
                    ></div>
                </div>

                <div className="relative z-10 max-w-2xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
                        Subscribe for Exclusive Offers
                    </h2>
                    <p className="text-green-50 text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 leading-relaxed">
                        Join our community to receive special promotions, seasonal offers, and updates on our freshest selections.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto">
                        <Input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-1 h-12 sm:h-14 text-base"
                        />
                        <Button type="submit" variant="secondary" size="lg" className="sm:w-auto h-12 sm:h-14 px-8">
                            Subscribe
                        </Button>
                    </form>
                    <p className="text-green-100 text-xs sm:text-sm mt-4">
                        We respect your privacy. Unsubscribe anytime.
                    </p>
                </div>
            </motion.div>
        </section>
    );
}

export default PromoSection;
