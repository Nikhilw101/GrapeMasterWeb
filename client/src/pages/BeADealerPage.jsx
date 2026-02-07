import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, User, Mail, Phone, MapPin, FileText, Send, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { submitDealerRequest } from '@/services/dealer.service';

export default function BeADealerPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [form, setForm] = useState({
        storeName: '',
        ownerName: '',
        email: '',
        phone: '',
        address: '',
        businessDetails: '',
        notes: ''
    });

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.storeName?.trim() || !form.ownerName?.trim() || !form.email?.trim() || !form.phone?.trim()) {
            toast.error('Please fill in Store name, Owner name, Email, and Phone');
            return;
        }
        try {
            setIsSubmitting(true);
            const result = await submitDealerRequest(form);
            if (result.success) {
                toast.success('Request submitted successfully! We will get back to you soon.');
                setForm({ storeName: '', ownerName: '', email: '', phone: '', address: '', businessDetails: '', notes: '' });
            } else {
                toast.error(result.message || 'Failed to submit');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4">
            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-3xl font-bold text-gray-900">Be a Dealer</h1>
                    <p className="text-gray-600 mt-2">Partner with us. Fill in the form below and we’ll get in touch.</p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-5"
                >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Store / Business Name *</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                name="storeName"
                                value={form.storeName}
                                onChange={handleChange}
                                className="pl-10"
                                placeholder="Your store or business name"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Owner Name *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                name="ownerName"
                                value={form.ownerName}
                                onChange={handleChange}
                                className="pl-10"
                                placeholder="Full name"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                className="pl-10"
                                placeholder="email@example.com"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                name="phone"
                                value={form.phone}
                                onChange={handleChange}
                                className="pl-10"
                                placeholder="10-digit mobile number"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <textarea
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                rows={2}
                                className="w-full rounded-md border border-gray-200 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Business address"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Business Details</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <textarea
                                name="businessDetails"
                                value={form.businessDetails}
                                onChange={handleChange}
                                rows={3}
                                className="w-full rounded-md border border-gray-200 px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="Tell us about your business (e.g. type, size, current products)"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                        <textarea
                            name="notes"
                            value={form.notes}
                            onChange={handleChange}
                            rows={2}
                            className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Any other message"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-green-600 hover:bg-green-700"
                    >
                        {isSubmitting ? <Loader className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4 mr-2" /> Submit Request</>}
                    </Button>
                </motion.form>
            </div>
        </div>
    );
}
