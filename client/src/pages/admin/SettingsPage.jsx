import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Truck, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { getSettingByKey, updateSetting } from '@/services/settings.service';

export default function SettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [deliveryCharge, setDeliveryCharge] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const result = await getSettingByKey('deliveryCharge');
            if (result.success && result.data) {
                setDeliveryCharge(result.data.value);
            } else {
                // Default if not set
                setDeliveryCharge('0');
            }
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

        try {
            setIsSaving(true);
            const result = await updateSetting('deliveryCharge', Number(deliveryCharge));
            if (result.success) {
                toast.success('Settings updated successfully');
            } else {
                toast.error(result.message || 'Failed to update settings');
            }
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
        </div>
    );
}
