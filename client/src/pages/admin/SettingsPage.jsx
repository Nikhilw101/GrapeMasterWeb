import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Truck, IndianRupee, Mail, Ban, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getSettingByKey, updateSetting } from '@/services/settings.service';

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deliveryCharge, setDeliveryCharge] = useState('');
    const [orderCancellationEnabled, setOrderCancellationEnabled] = useState(true);
    const [orderCancellationDays, setOrderCancellationDays] = useState(5);
    const [adminEmail, setAdminEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [companyAddress, setCompanyAddress] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyEmail, setCompanyEmail] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const [deliveryRes, cancelEnabledRes, cancelDaysRes, adminEmailRes, nameRes, addrRes, phoneRes, emailRes] = await Promise.all([
                getSettingByKey('deliveryCharge'),
                getSettingByKey('orderCancellationEnabled'),
                getSettingByKey('orderCancellationDays'),
                getSettingByKey('adminEmail'),
                getSettingByKey('companyName'),
                getSettingByKey('companyAddress'),
                getSettingByKey('companyPhone'),
                getSettingByKey('companyEmail')
            ]);
            if (deliveryRes?.success && deliveryRes.data?.value != null) setDeliveryCharge(String(deliveryRes.data.value));
            else setDeliveryCharge('0');
            if (cancelEnabledRes?.success && cancelEnabledRes.data?.value !== undefined) setOrderCancellationEnabled(cancelEnabledRes.data.value === true || cancelEnabledRes.data.value === 'true');
            if (cancelDaysRes?.success && cancelDaysRes.data?.value != null) setOrderCancellationDays(Math.max(0, Number(cancelDaysRes.data.value) || 5));
            if (adminEmailRes?.success && adminEmailRes.data?.value) setAdminEmail(String(adminEmailRes.data.value));
            if (nameRes?.success && nameRes.data?.value) setCompanyName(String(nameRes.data.value));
            if (addrRes?.success && addrRes.data?.value) setCompanyAddress(String(addrRes.data.value));
            if (phoneRes?.success && phoneRes.data?.value) setCompanyPhone(String(phoneRes.data.value));
            if (emailRes?.success && emailRes.data?.value) setCompanyEmail(String(emailRes.data.value));
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            toast.error('Failed to load settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!deliveryCharge || isNaN(deliveryCharge) || Number(deliveryCharge) < 0) {
            toast.error('Please enter a valid delivery charge amount');
            return;
        }
        if (orderCancellationDays < 0 || orderCancellationDays > 365) {
            toast.error('Cancellation days must be between 0 and 365');
            return;
        }

        try {
            setIsSaving(true);
            await Promise.all([
                updateSetting('deliveryCharge', Number(deliveryCharge)),
                updateSetting('orderCancellationEnabled', orderCancellationEnabled),
                updateSetting('orderCancellationDays', orderCancellationDays),
                updateSetting('adminEmail', adminEmail.trim() || null),
                updateSetting('companyName', companyName.trim() || null),
                updateSetting('companyAddress', companyAddress.trim() || null),
                updateSetting('companyPhone', companyPhone.trim() || null),
                updateSetting('companyEmail', companyEmail.trim() || null)
            ]);
            toast.success('Settings updated successfully');
            fetchSettings();
        } catch (error) {
            console.error('Failed to save settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-500">Manage store configuration and defaults</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Truck className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Delivery Configuration</h2>
                            <p className="text-sm text-gray-500">Set delivery charges and thresholds</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    <div className="max-w-md space-y-2">
                        <label className="text-sm font-medium text-gray-700">Delivery Charge</label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                                type="number"
                                min="0"
                                value={deliveryCharge}
                                onChange={(e) => setDeliveryCharge(e.target.value)}
                                className="pl-9"
                                placeholder="0.00"
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            This amount will be added to the customer's total at checkout.
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Order Cancellation */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Order Cancellation</h2>
                            <p className="text-sm text-gray-500">Allow customers to cancel orders within a time window</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="cancelEnabled"
                            checked={orderCancellationEnabled}
                            onChange={(e) => setOrderCancellationEnabled(e.target.checked)}
                            className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <label htmlFor="cancelEnabled" className="text-sm font-medium text-gray-700">Allow order cancellation</label>
                    </div>
                    <div className="max-w-xs space-y-2">
                        <label className="text-sm font-medium text-gray-700">Cancellation window (days)</label>
                        <Input
                            type="number"
                            min="0"
                            max="365"
                            value={orderCancellationDays}
                            onChange={(e) => setOrderCancellationDays(Number(e.target.value) || 0)}
                            placeholder="5"
                        />
                        <p className="text-xs text-gray-500">Customers can cancel only within this many days after placement.</p>
                    </div>
                </div>
            </motion.div>

            {/* Admin Email */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-violet-100 rounded-lg">
                            <Mail className="w-5 h-5 text-violet-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Admin Email</h2>
                            <p className="text-sm text-gray-500">Used for order notifications, dealer requests, and alerts</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="max-w-md space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email address</label>
                        <Input
                            type="email"
                            value={adminEmail}
                            onChange={(e) => setAdminEmail(e.target.value)}
                            placeholder="admin@example.com"
                        />
                        <p className="text-xs text-gray-500">Used for order/dealer notifications. Leave empty to use server .env fallback.</p>
                    </div>
                </div>
            </motion.div>

            {/* Company information (emails & templates) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Building2 className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
                            <p className="text-sm text-gray-500">Used in email templates and footers (password reset, order emails, etc.)</p>
                        </div>
                    </div>
                </div>
                <div className="p-6 space-y-4">
                    <div className="max-w-md space-y-2">
                        <label className="text-sm font-medium text-gray-700">Company name</label>
                        <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Grape Master" />
                    </div>
                    <div className="max-w-md space-y-2">
                        <label className="text-sm font-medium text-gray-700">Address</label>
                        <Input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} placeholder="123 Grape Street, Vineyard City" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <Input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} placeholder="+1 234 567 8900" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <Input type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} placeholder="hello@grapemaster.com" />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500">Leave fields empty to use server .env fallbacks.</p>
                </div>
            </motion.div>
        </div>
    );
}
