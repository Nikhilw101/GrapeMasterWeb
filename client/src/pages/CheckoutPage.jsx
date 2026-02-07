import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/context/AuthContext';
import * as userService from '@/services/user.service';
import * as orderService from '@/services/order.service';
import * as paymentService from '@/services/payment.service';
import * as settingsService from '@/services/settings.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StripePaymentForm } from '@/components/payment';
import { toast } from 'sonner';
import {
    Loader,
    Check,
    MapPin,
    CreditCard,
    ShoppingBag,
    User,
    Phone,
    AlertCircle,
} from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { getAssetBaseUrl, STRIPE_PUBLISHABLE_KEY } from '@/config/env';

const PAYMENT_STRIPE = 'stripe';
const PAYMENT_COD = 'cod';

const stripePromise = STRIPE_PUBLISHABLE_KEY ? loadStripe(STRIPE_PUBLISHABLE_KEY) : null;

export default function CheckoutPage() {
    const navigate = useNavigate();
    const { cart, getCartTotal, clearCart, isLoading: isCartLoading } = useCart();
    const { user } = useAuth();

    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [deliveryCharge, setDeliveryCharge] = useState(0);
    const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
    const [isLoadingSettings, setIsLoadingSettings] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState(PAYMENT_STRIPE);

    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        addressLine: '',
        city: '',
        state: 'Maharashtra',
        pincode: '',
        isDefault: false,
    });
    const [addressErrors, setAddressErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [stripeClientSecret, setStripeClientSecret] = useState(null);
    const [stripeOrderId, setStripeOrderId] = useState(null);

    useEffect(() => {
        if (isCartLoading) return;
        if (cart.length === 0) {
            navigate('/', { replace: true });
            return;
        }
        fetchAddresses();
    }, [cart.length, isCartLoading, navigate]);

    useEffect(() => {
        let cancelled = false;
        const fetch = async () => {
            try {
                const result = await settingsService.getSettingByKey('deliveryCharge');
                if (!cancelled && result?.success && result?.data?.value != null) {
                    setDeliveryCharge(Number(result.data.value) || 0);
                }
            } catch {
                if (!cancelled) setDeliveryCharge(0);
            } finally {
                if (!cancelled) setIsLoadingSettings(false);
            }
        };
        fetch();
        return () => { cancelled = true; };
    }, []);

    const fetchAddresses = async () => {
        try {
            setIsLoadingAddresses(true);
            const result = await userService.getProfile();
            if (result?.success && result?.data?.addresses) {
                setAddresses(result.data.addresses);
                const defaultAddr = result.data.addresses.find((a) => a.isDefault);
                if (defaultAddr) setSelectedAddressId(defaultAddr._id);
            }
        } catch {
            toast.error('Failed to load addresses');
        } finally {
            setIsLoadingAddresses(false);
        }
    };

    const validateNewAddress = () => {
        const err = {};
        if (!newAddress.addressLine?.trim()) err.addressLine = 'Address line is required';
        if (!newAddress.city?.trim()) err.city = 'City is required';
        if (!newAddress.state?.trim()) err.state = 'State is required';
        if (!/^\d{6}$/.test(newAddress.pincode?.trim() || '')) err.pincode = 'Valid 6-digit pincode required';
        setAddressErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setSubmitError('');
        if (!validateNewAddress()) return;
        try {
            setIsProcessing(true);
            const result = await userService.addAddress(newAddress);
            if (result?.success && result?.data?.addresses) {
                toast.success('Address saved');
                setAddresses(result.data.addresses);
                const added = result.data.addresses[result.data.addresses.length - 1];
                if (added) setSelectedAddressId(added._id);
                setShowAddressForm(false);
                setNewAddress({
                    addressLine: '',
                    city: '',
                    state: 'Maharashtra',
                    pincode: '',
                    isDefault: false,
                });
                setAddressErrors({});
            } else {
                toast.error(result?.message || 'Failed to add address');
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to add address';
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const totalAmount = getCartTotal() + deliveryCharge;
    const canPlaceOrder = selectedAddressId && addresses.length > 0 && !isProcessing;

    const handlePlaceOrder = async () => {
        setSubmitError('');
        if (!selectedAddressId) {
            setSubmitError('Please select a delivery address.');
            toast.error('Please select a delivery address');
            return;
        }
        if (addresses.length === 0) {
            setSubmitError('Please add and select a delivery address.');
            toast.error('Please add a delivery address');
            return;
        }

        const selectedAddress = addresses.find((a) => a._id === selectedAddressId);
        if (!selectedAddress) {
            setSubmitError('Selected address is invalid.');
            return;
        }

        if (paymentMethod === PAYMENT_STRIPE && !STRIPE_PUBLISHABLE_KEY) {
            toast.error('Online payment is not configured. Use Cash on Delivery or contact support.');
            return;
        }

        try {
            setIsProcessing(true);
            const orderData = {
                deliveryAddress: {
                    addressLine: selectedAddress.addressLine,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pincode: selectedAddress.pincode,
                },
                paymentMethod,
            };

            const orderResult = await orderService.placeOrder(orderData);
            if (!orderResult?.success) {
                throw new Error(orderResult?.message || 'Failed to create order');
            }

            const order = orderResult.data;
            if (!order?.orderId) {
                throw new Error('Invalid order response');
            }

            const paymentResult = await paymentService.initiatePayment(order.orderId);
            if (!paymentResult?.success) {
                toast.error(paymentResult?.message || 'Payment initiation failed');
                return;
            }

            if (paymentResult.data?.paymentMethod === 'COD' || paymentMethod === PAYMENT_COD) {
                clearCart();
                toast.success('Order placed successfully! Pay when you receive your order.');
                navigate('/profile?tab=orders', { replace: true });
                return;
            }

            if (paymentResult.data?.clientSecret) {
                setStripeClientSecret(paymentResult.data.clientSecret);
                setStripeOrderId(order.orderId);
                setSubmitError('');
                return;
            }

            toast.error('Payment could not be started. Please try again or choose Cash on Delivery.');
        } catch (err) {
            const msg =
                err.response?.data?.message ||
                err.message ||
                'Unable to place order. Please try again.';
            setSubmitError(msg);
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const productImageUrl = (item) => {
        if (!item?.image) return null;
        if (item.image.startsWith('http')) return item.image;
        const path = item.image.startsWith('/') ? item.image : `/${item.image}`;
        return `${getAssetBaseUrl()}${path}`;
    };

    if (isCartLoading) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center">
                <Loader className="w-10 h-10 text-green-600 animate-spin" />
                <p className="text-gray-600 mt-3">Loading your cart...</p>
            </div>
        );
    }

    if (cart.length === 0) return null;

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto px-4 py-6 sm:py-8 max-w-6xl">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
                <p className="text-gray-600 mb-6 sm:mb-8">
                    Review your order and delivery details below.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Left: Address + Contact + Payment */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact (read-only from profile) */}
                        <motion.section
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <User className="w-5 h-5 text-green-600" />
                                    Contact details
                                </h2>
                            </div>
                            <div className="px-4 sm:px-6 py-4 space-y-2">
                                <p className="text-gray-900 font-medium">{user?.name || '—'}</p>
                                <p className="text-gray-600 text-sm flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {user?.mobile || '—'}
                                </p>
                                {user?.email && (
                                    <p className="text-gray-600 text-sm">{user.email}</p>
                                )}
                            </div>
                        </motion.section>

                        {/* Delivery Address */}
                        <motion.section
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-green-600" />
                                    Delivery address
                                </h2>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setShowAddressForm(!showAddressForm);
                                        setAddressErrors({});
                                        setSubmitError('');
                                    }}
                                >
                                    {showAddressForm ? 'Cancel' : 'Add new address'}
                                </Button>
                            </div>
                            <div className="px-4 sm:px-6 py-4">
                                {showAddressForm && (
                                    <form
                                        onSubmit={handleAddAddress}
                                        className="space-y-4 p-4 bg-gray-50 rounded-xl mb-4"
                                    >
                                        <div>
                                            <Input
                                                placeholder="Address line (house no., building, street)"
                                                value={newAddress.addressLine}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, addressLine: e.target.value })
                                                }
                                                className={addressErrors.addressLine ? 'border-red-500' : ''}
                                            />
                                            {addressErrors.addressLine && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-3.5 h-3.5" />
                                                    {addressErrors.addressLine}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <Input
                                                    placeholder="City"
                                                    value={newAddress.city}
                                                    onChange={(e) =>
                                                        setNewAddress({ ...newAddress, city: e.target.value })
                                                    }
                                                    className={addressErrors.city ? 'border-red-500' : ''}
                                                />
                                                {addressErrors.city && (
                                                    <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>
                                                )}
                                            </div>
                                            <div>
                                                <Input
                                                    placeholder="State"
                                                    value={newAddress.state}
                                                    onChange={(e) =>
                                                        setNewAddress({ ...newAddress, state: e.target.value })
                                                    }
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Input
                                                placeholder="Pincode (6 digits)"
                                                value={newAddress.pincode}
                                                onChange={(e) =>
                                                    setNewAddress({ ...newAddress, pincode: e.target.value })
                                                }
                                                maxLength={6}
                                                className={addressErrors.pincode ? 'border-red-500' : ''}
                                            />
                                            {addressErrors.pincode && (
                                                <p className="text-red-500 text-xs mt-1">{addressErrors.pincode}</p>
                                            )}
                                        </div>
                                        <Button type="submit" disabled={isProcessing} className="w-full sm:w-auto">
                                            {isProcessing ? (
                                                <Loader className="w-4 h-4 animate-spin" />
                                            ) : (
                                                'Save address'
                                            )}
                                        </Button>
                                    </form>
                                )}
                                {isLoadingAddresses ? (
                                    <div className="flex items-center gap-2 text-gray-500 py-4">
                                        <Loader className="w-5 h-5 animate-spin" />
                                        Loading addresses…
                                    </div>
                                ) : addresses.length === 0 && !showAddressForm ? (
                                    <p className="text-gray-500 py-4 text-center">
                                        No saved addresses. Add one above to continue.
                                    </p>
                                ) : (
                                    <div className="space-y-2">
                                        {addresses.map((addr) => (
                                            <button
                                                key={addr._id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedAddressId(addr._id);
                                                    setSubmitError('');
                                                }}
                                                className={cn(
                                                    'w-full text-left p-4 rounded-xl border-2 transition-all',
                                                    selectedAddressId === addr._id
                                                        ? 'border-green-600 bg-green-50/80'
                                                        : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100'
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {addr.addressLine}
                                                        </p>
                                                        <p className="text-sm text-gray-600 mt-0.5">
                                                            {addr.city}, {addr.state} – {addr.pincode}
                                                        </p>
                                                    </div>
                                                    {selectedAddressId === addr._id && (
                                                        <Check className="w-5 h-5 text-green-600 shrink-0" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        {/* Payment method */}
                        <motion.section
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                        >
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-green-600" />
                                    Payment method
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    Choose how you want to pay.
                                </p>
                            </div>
                            <div className="px-4 sm:px-6 py-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod(PAYMENT_STRIPE)}
                                        className={cn(
                                            'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                                            paymentMethod === PAYMENT_STRIPE
                                                ? 'border-green-600 bg-green-50/80'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        )}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                            <CreditCard className="w-6 h-6 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Pay online</p>
                                            <p className="text-sm text-gray-600">Card via Stripe – secure</p>
                                        </div>
                                        {paymentMethod === PAYMENT_STRIPE && (
                                            <Check className="w-5 h-5 text-green-600 ml-auto" />
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod(PAYMENT_COD)}
                                        className={cn(
                                            'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                                            paymentMethod === PAYMENT_COD
                                                ? 'border-green-600 bg-green-50/80'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        )}
                                    >
                                        <div className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                            <ShoppingBag className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">Cash on delivery</p>
                                            <p className="text-sm text-gray-600">Pay when you receive</p>
                                        </div>
                                        {paymentMethod === PAYMENT_COD && (
                                            <Check className="w-5 h-5 text-green-600 ml-auto" />
                                        )}
                                    </button>
                                </div>
                                {paymentMethod === PAYMENT_STRIPE && !STRIPE_PUBLISHABLE_KEY && (
                                    <div className="mx-4 sm:mx-6 mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>Online payment is not configured. Use <strong>Cash on delivery</strong> to place your order, or contact support to enable card payments.</span>
                                    </div>
                                )}
                            </div>
                        </motion.section>

                        {/* Embedded Stripe Payment Element (no redirect) */}
                        {stripeClientSecret && stripePromise && (
                            <motion.section
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                            >
                                <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-green-600" />
                                        Complete payment
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Enter your card details below. Payment is secure and never leaves this page.
                                    </p>
                                </div>
                                <div className="px-4 sm:px-6 py-4">
                                    <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                                        <StripePaymentForm
                                            amount={formatPrice(totalAmount)}
                                            orderId={stripeOrderId}
                                            onSuccess={() => {
                                                clearCart();
                                                toast.success('Payment successful!');
                                                setStripeClientSecret(null);
                                                setStripeOrderId(null);
                                                navigate(`/payment/success?order_id=${stripeOrderId}`, { replace: true });
                                            }}
                                            onCancel={() => {
                                                setStripeClientSecret(null);
                                                setStripeOrderId(null);
                                                toast.info('Payment cancelled. You can retry from My Orders.');
                                            }}
                                        />
                                    </Elements>
                                </div>
                            </motion.section>
                        )}
                    </div>

                    {/* Right: Order summary */}
                    <div className="lg:col-span-1">
                        <motion.aside
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden sticky top-24"
                        >
                            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900">Order summary</h2>
                                <p className="text-sm text-gray-500">
                                    {cart.length} {cart.length === 1 ? 'item' : 'items'}
                                </p>
                            </div>
                            <div className="px-4 sm:px-6 py-4 max-h-72 overflow-y-auto space-y-4">
                                {cart.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex gap-3"
                                    >
                                        <div className="w-14 h-14 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                                            {productImageUrl(item) ? (
                                                <img
                                                    src={productImageUrl(item)}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className={cn(
                                                    'w-full h-full flex items-center justify-center text-xs text-gray-400',
                                                    productImageUrl(item) ? 'hidden' : ''
                                                )}
                                            >
                                                No image
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium text-gray-900 text-sm truncate">
                                                {item.name}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {item.quantity} × {formatPrice(item.price)}
                                            </p>
                                        </div>
                                        <p className="font-semibold text-gray-900 text-sm shrink-0">
                                            {formatPrice(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="px-4 sm:px-6 py-4 border-t border-gray-100 space-y-2">
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(getCartTotal())}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 text-sm">
                                    <span>Delivery</span>
                                    <span className={deliveryCharge === 0 ? 'text-green-600' : ''}>
                                        {deliveryCharge === 0 ? 'Free' : formatPrice(deliveryCharge)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                                    <span>Total</span>
                                    <span>{formatPrice(totalAmount)}</span>
                                </div>
                            </div>
                            {submitError && (
                                <div className="px-4 sm:px-6 pb-2">
                                    <p className="text-red-600 text-sm flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {submitError}
                                    </p>
                                </div>
                            )}
                            {!stripeClientSecret && (
                                <div className="px-4 sm:px-6 pb-6">
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700"
                                        size="lg"
                                        onClick={handlePlaceOrder}
                                        disabled={!canPlaceOrder}
                                    >
                                        {isProcessing ? (
                                            <Loader className="w-5 h-5 animate-spin" />
                                        ) : (
                                            `Place order · ${formatPrice(totalAmount)}`
                                        )}
                                    </Button>
                                    {!selectedAddressId && addresses.length > 0 && (
                                        <p className="text-amber-600 text-xs mt-2 text-center">
                                            Select a delivery address above.
                                        </p>
                                    )}
                                </div>
                            )}
                        </motion.aside>
                    </div>
                </div>
            </div>
        </div>
    );
}
