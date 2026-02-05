import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import * as userService from '@/services/user.service';
import * as orderService from '@/services/order.service';
import * as paymentService from '@/services/payment.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader, Check, MapPin, CreditCard, ShoppingBag } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'cod'

    // New Address Form State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        addressLine: '',
        city: '',
        state: 'Maharashtra',
        pincode: '',
        isDefault: false
    });

    useEffect(() => {
        if (cart.length === 0) {
            navigate('/');
            return;
        }
        fetchAddresses();
    }, [cart, navigate]);

    const fetchAddresses = async () => {
        try {
            const result = await userService.getProfile();
            if (result.success && result.data.addresses) {
                setAddresses(result.data.addresses);
                // Select default address if exists
                const defaultAddr = result.data.addresses.find(a => a.isDefault);
                if (defaultAddr) setSelectedAddressId(defaultAddr._id);
            }
        } catch (error) {
            toast.error('Failed to load addresses');
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try {
            setIsProcessing(true);
            const result = await userService.addAddress(newAddress);
            if (result.success) {
                toast.success('Address added successfully');
                setAddresses(result.data.addresses);
                // Auto-select the new address (last one in the list usually)
                const newAddr = result.data.addresses[result.data.addresses.length - 1];
                if (newAddr) setSelectedAddressId(newAddr._id);
                setShowAddressForm(false);
                setNewAddress({ addressLine: '', city: '', state: 'Maharashtra', pincode: '', isDefault: false });
            }
        } catch (error) {
            toast.error('Failed to add address');
        } finally {
            setIsProcessing(false);
        }
    };

    const [deliveryCharge, setDeliveryCharge] = useState(0);

    useEffect(() => {
        const fetchDeliveryCharge = async () => {
            try {
                // Determine if we need to fetch settings. Assuming settings service is available.
                // We'll import it at top of file
                const { getSettingByKey } = await import('@/services/settings.service');
                const result = await getSettingByKey('deliveryCharge');
                if (result.success && result.data) {
                    setDeliveryCharge(Number(result.data.value) || 0);
                }
            } catch (err) {
                console.error("Failed to fetch delivery charge", err);
            }
        };
        fetchDeliveryCharge();
    }, []);

    const totalAmount = getCartTotal() + deliveryCharge;

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) {
            toast.error('Please select a delivery address');
            return;
        }

        try {
            setIsProcessing(true);
            const selectedAddress = addresses.find(a => a._id === selectedAddressId);

            // 1. Create Order
            const orderData = {
                items: cart.map(item => ({
                    product: item.product,
                    quantity: item.quantity,
                    price: item.price
                })),
                deliveryAddress: {
                    addressLine: selectedAddress.addressLine,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pincode: selectedAddress.pincode
                },
                paymentMethod
            };

            // Note: Backend calculates final total with delivery charge, but we show it here for user clarity

            const orderResult = await orderService.createOrder(orderData);

            if (!orderResult.success) {
                throw new Error('Failed to create order');
            }

            const { order } = orderResult.data;

            // 2. Process Payment
            if (paymentMethod === 'online') {
                // Initialize Payment
                const paymentResult = await paymentService.initiatePayment(order.orderId, order.pricing.total);

                if (paymentResult.success) {
                    // In a real integration, here you would handle the Stripe/Razorpay/PhonePe flow
                    // For now, we simulate success or redirect to a payment URL if provided

                    if (paymentResult.data.paymentUrl) {
                        window.location.href = paymentResult.data.paymentUrl;
                        return;
                    }

                    // Simulating success callback for demonstration if no URL (fallback)
                    toast.success('Payment initiated');

                    // You would normally await the actual payment completion here or handle it via webhook/redirect
                    // For this integration verification, we'll assume it succeeds and clear cart

                    // Verify payment status (mocking 2s delay)
                    setTimeout(async () => {
                        await clearCart();
                        navigate('/profile?tab=orders');
                        toast.success('Order placed successfully!');
                    }, 1500);
                }
            } else {
                // COD - Just finish
                await clearCart();
                navigate('/profile?tab=orders');
                toast.success('Order placed successfully!');
            }

        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-900">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Address & Payment */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Address Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-600" /> Delivery Address
                            </h2>
                            <Button variant="outline" size="sm" onClick={() => setShowAddressForm(!showAddressForm)}>
                                {showAddressForm ? 'Cancel' : 'Add New'}
                            </Button>
                        </div>

                        {showAddressForm ? (
                            <form onSubmit={handleAddAddress} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-xl">
                                <Input
                                    placeholder="Address Line (House No, Building, Street)"
                                    value={newAddress.addressLine}
                                    onChange={e => setNewAddress({ ...newAddress, addressLine: e.target.value })}
                                    required
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="City"
                                        value={newAddress.city}
                                        onChange={e => setNewAddress({ ...newAddress, city: e.target.value })}
                                        required
                                    />
                                    <Input
                                        placeholder="Pincode"
                                        value={newAddress.pincode}
                                        onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" disabled={isProcessing} className="w-full">
                                    {isProcessing ? <Loader className="w-4 h-4 animate-spin" /> : 'Save Address'}
                                </Button>
                            </form>
                        ) : null}

                        <div className="space-y-3">
                            {addresses.length === 0 && !showAddressForm ? (
                                <p className="text-gray-500 text-center py-4">No addresses saved. Please add one.</p>
                            ) : (
                                addresses.map(addr => (
                                    <div
                                        key={addr._id}
                                        onClick={() => setSelectedAddressId(addr._id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id
                                            ? 'border-green-600 bg-green-50'
                                            : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{addr.addressLine}</p>
                                                <p className="text-sm text-gray-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                                            </div>
                                            {selectedAddressId === addr._id && <Check className="w-5 h-5 text-green-600" />}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Payment Section */}
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-green-600" /> Payment Method
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div
                                onClick={() => setPaymentMethod('online')}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${paymentMethod === 'online'
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-600 shadow-sm">
                                    <CreditCard className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Online Payment</span>
                            </div>

                            <div
                                onClick={() => setPaymentMethod('cod')}
                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${paymentMethod === 'cod'
                                    ? 'border-green-600 bg-green-50'
                                    : 'border-transparent bg-gray-50 hover:bg-gray-100'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 shadow-sm">
                                    <ShoppingBag className="w-5 h-5" />
                                </div>
                                <span className="font-medium">Cash on Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                        <div className="space-y-4 mb-6 max-h-80 overflow-y-auto pr-2">
                            {cart.map(item => (
                                <div key={item.id} className="flex justify-between items-start text-sm">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.name}</p>
                                        <p className="text-gray-500">{item.quantity} x {formatPrice(item.price)}</p>
                                    </div>
                                    <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(getCartTotal())}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Delivery</span>
                                <span className={deliveryCharge === 0 ? "text-green-600" : ""}>
                                    {deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}
                                </span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                                <span>Total</span>
                                <span>{formatPrice(totalAmount)}</span>
                            </div>
                        </div>

                        <Button
                            className="w-full mt-6 bg-green-600 hover:bg-green-700"
                            size="lg"
                            onClick={handlePlaceOrder}
                            disabled={isProcessing || addresses.length === 0}
                        >
                            {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : `Place Order • ${formatPrice(totalAmount)}`}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
