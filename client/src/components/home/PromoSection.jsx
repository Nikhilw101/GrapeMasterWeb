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
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-8 sm:p-12 relative overflow-hidden"
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

                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Get 20% Off Your First Order
                    </h2>
                    <p className="text-green-50 text-lg mb-6">
                        Join our community and enjoy exclusive deals on fresh, organic grapes delivered to your doorstep.
                    </p>
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="flex-1"
                        />
                        <Button type="submit" variant="secondary" size="lg" className="sm:w-auto">
                            Subscribe
                        </Button>
                    </form>
                </div>
            </motion.div>
        </section>
    );
}

export default PromoSection;
