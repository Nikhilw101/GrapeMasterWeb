import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as userService from '@/services/user.service';
import * as orderService from '@/services/order.service';
import * as settingsService from '@/services/settings.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader, User, MapPin, Package, LogOut, X, CreditCard } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTabParam = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState(activeTabParam || 'profile'); // 'profile', 'orders', 'addresses', 'payments'
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [profile, setProfile] = useState({ name: '', email: '', mobile: '' });
    const [mobileError, setMobileError] = useState('');
    const [addressForm, setAddressForm] = useState({ addressLine: '', city: '', state: '', pincode: '', isDefault: true });
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [cancellationEnabled, setCancellationEnabled] = useState(true);
    const [cancellationDays, setCancellationDays] = useState(5);

    useEffect(() => {
        if (activeTabParam) setActiveTab(activeTabParam);
    }, [activeTabParam]);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setIsLoading(true);
            const profileResult = await userService.getProfile();
            if (profileResult.success) {
                setProfile(profileResult.data);
                setAddresses(profileResult.data.addresses || []);
            }

            if (activeTab === 'orders' || activeTab === 'payments') {
                const promises = [orderService.getUserOrders()];
                if (activeTab === 'orders') {
                    promises.push(settingsService.getSettingByKey('orderCancellationEnabled'), settingsService.getSettingByKey('orderCancellationDays'));
                }
                const results = await Promise.all(promises);
                const ordersResult = results[0];
                if (ordersResult?.success) {
                    setOrders(Array.isArray(ordersResult.data) ? ordersResult.data : ordersResult.data?.orders || []);
                }
                if (activeTab === 'orders' && results[1]) {
                    const enabledRes = results[1];
                    if (enabledRes?.success && enabledRes.data?.value !== undefined) setCancellationEnabled(enabledRes.data.value === true || enabledRes.data.value === 'true');
                }
                if (activeTab === 'orders' && results[2]) {
                    const daysRes = results[2];
                    if (daysRes?.success && daysRes.data?.value != null) setCancellationDays(Math.max(0, Number(daysRes.data.value) || 5));
                }
            }
        } catch (error) {
            toast.error('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const validateMobile = (value) => {
        const v = (value || '').replace(/\D/g, '');
        if (v.length === 0) return '';
        if (!/^[6-9]/.test(v)) return 'Must start with 6, 7, 8 or 9';
        if (v.length !== 10) return 'Must be 10 digits';
        return '';
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        const err = validateMobile(profile.mobile);
        setMobileError(err);
        if (err) return;
        try {
            const result = await userService.updateProfile(profile);
            if (result.success) {
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        }
    };

    const handleMobileChange = (e) => {
        const v = e.target.value.replace(/\D/g, '').slice(0, 10);
        setProfile(p => ({ ...p, mobile: v }));
        setMobileError(validateMobile(v));
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        if (!addressForm.addressLine?.trim() || !addressForm.city?.trim() || !addressForm.state?.trim() || !/^\d{6}$/.test(addressForm.pincode)) {
            toast.error('Please fill all address fields; pincode must be 6 digits.');
            return;
        }
        try {
            await userService.addAddress(addressForm);
            toast.success('Address added');
            setAddressForm({ addressLine: '', city: '', state: '', pincode: '', isDefault: true });
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add address');
        }
    };

    const handleUpdateAddress = async (e) => {
        e.preventDefault();
        if (!editingAddressId) return;
        if (!addressForm.addressLine?.trim() || !addressForm.city?.trim() || !addressForm.state?.trim() || !/^\d{6}$/.test(addressForm.pincode)) {
            toast.error('Please fill all address fields; pincode must be 6 digits.');
            return;
        }
        try {
            await userService.updateAddress(editingAddressId, addressForm);
            toast.success('Address updated');
            setEditingAddressId(null);
            setAddressForm({ addressLine: '', city: '', state: '', pincode: '', isDefault: true });
            loadData();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update address');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const nonCancellableStatuses = ['dispatched', 'delivered', 'completed', 'cancelled', 'rejected'];
    const isWithinCancellationWindow = (order) => {
        const orderDate = new Date(order.createdAt);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - cancellationDays);
        cutoff.setHours(0, 0, 0, 0);
        return orderDate >= cutoff;
    };
    const canCancelOrder = (order) =>
        cancellationEnabled &&
        order.orderId &&
        !nonCancellableStatuses.includes(order.orderStatus) &&
        isWithinCancellationWindow(order);

    const getCancelTooltip = (order) => {
        if (nonCancellableStatuses.includes(order.orderStatus)) return 'This order can no longer be cancelled.';
        if (!cancellationEnabled) return 'Order cancellation is currently disabled.';
        if (!isWithinCancellationWindow(order)) return `Cancellation is allowed only within ${cancellationDays} days of placement.`;
        return '';
    };

    const OrderCard = ({ order }) => {
        const canCancel = canCancelOrder(order);
        const cancelTooltip = getCancelTooltip(order);
        return (
            <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-6 mb-4 hover:shadow-sm transition-all">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                    <div>
                        <h3 className="font-bold text-gray-900">Order #{order.orderId}</h3>
                        <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                            ${order.orderStatus === 'delivered' || order.orderStatus === 'completed' ? 'bg-green-100 text-green-700' :
                                order.orderStatus === 'cancelled' || order.orderStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                                    order.orderStatus === 'approved' || order.orderStatus === 'confirmed' ? 'bg-purple-100 text-purple-700' :
                                        order.orderStatus === 'dispatched' ? 'bg-indigo-100 text-indigo-700' :
                                            'bg-blue-100 text-blue-700'}`}>
                            {order.orderStatus?.replace(/_/g, ' ')}
                        </span>
                        <span className="font-bold text-gray-900">{formatPrice(order.pricing.total)}</span>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                            <span className="font-medium">{item.quantity}x</span>
                            <span className="flex-1">{item.productName || item.name || item.product?.name}</span>
                            <span>{formatPrice(item.price)}</span>
                        </div>
                    ))}
                </div>

                {order.orderId && !nonCancellableStatuses.includes(order.orderStatus) && (
                    <div className="flex flex-col gap-1">
                        <Button
                            variant="outline"
                            disabled={!canCancel}
                            title={cancelTooltip}
                            className="w-full md:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-white"
                            onClick={async () => {
                                if (!canCancel) return;
                                if (confirm('Are you sure you want to cancel this order?')) {
                                    try {
                                        await orderService.cancelOrder(order.orderId);
                                        toast.success('Order cancelled');
                                        loadData();
                                    } catch (e) {
                                        toast.error(e.response?.data?.message || 'Failed to cancel order');
                                    }
                                }
                            }}
                        >
                            Cancel Order
                        </Button>
                        {!canCancel && cancelTooltip && (
                            <p className="text-xs text-gray-500">{cancelTooltip}</p>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 space-y-2">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-2xl font-bold mx-auto mb-3">
                            {user?.name?.[0].toUpperCase()}
                        </div>
                        <h2 className="font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>

                    <div className="space-y-1">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <User className="w-5 h-5 mr-3" /> Profile
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Package className="w-5 h-5 mr-3" /> Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'addresses' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <MapPin className="w-5 h-5 mr-3" /> Addresses
                        </button>
                        <button
                            onClick={() => setActiveTab('payments')}
                            className={`w-full flex items-center p-3 rounded-xl transition-all ${activeTab === 'payments' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <CreditCard className="w-5 h-5 mr-3" /> Payment History
                        </button>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center p-3 rounded-xl bg-white text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
                        >
                            <LogOut className="w-5 h-5 mr-3" /> Logout
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader className="w-8 h-8 animate-spin text-green-600" />
                        </div>
                    ) : (
                        <>
                            {/* Profile Tab */}
                            {activeTab === 'profile' && (
                                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                                    <h2 className="text-xl font-bold mb-6">Personal Information</h2>
                                    <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Full Name</label>
                                            <Input
                                                value={profile.name}
                                                onChange={e => setProfile({ ...profile, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Email</label>
                                            <Input
                                                value={profile.email}
                                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Mobile Number</label>
                                            <Input
                                                value={profile.mobile}
                                                onChange={handleMobileChange}
                                                placeholder="10-digit number"
                                                maxLength={10}
                                                className={mobileError ? 'border-red-500' : ''}
                                            />
                                            {mobileError && <p className="text-xs text-red-600 mt-1">{mobileError}</p>}
                                            {!mobileError && <p className="text-xs text-gray-500 mt-1">10 digits, starting with 6–9</p>}
                                        </div>
                                        <Button type="submit" className="rounded-xl bg-green-600 hover:bg-green-700">Save Changes</Button>
                                    </form>
                                </div>
                            )}

                            {/* Orders Tab */}
                            {activeTab === 'orders' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">My Orders ({orders.length})</h2>
                                    {orders.length === 0 ? (
                                        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                            <p className="text-gray-500">You haven't placed any orders yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {orders.map(order => (
                                                <OrderCard key={order._id} order={order} />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payment History Tab - from orders with successful payment */}
                            {activeTab === 'payments' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">Payment History</h2>
                                    {(() => {
                                        const paymentOrders = orders.filter(o => o.paymentStatus === 'success');
                                        if (paymentOrders.length === 0) {
                                            return (
                                                <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                                                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                    <p className="text-gray-500">{orders.length === 0 ? 'No payment history yet.' : 'No successful payments yet.'}</p>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div className="space-y-4">
                                                {paymentOrders.map(order => {
                                                    const paidAt = order.paymentDetails?.paidAt || order.updatedAt || order.createdAt;
                                                    const txId = order.paymentDetails?.transactionId || order.orderId || '—';
                                                    return (
                                                        <div key={order._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</p>
                                                                    <p className="font-mono text-sm text-gray-900 break-all">{txId}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</p>
                                                                    <p className="font-bold text-gray-900">{formatPrice(order.pricing?.total ?? 0)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment status</p>
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">
                                                                        {order.paymentStatus || 'Success'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date & time</p>
                                                                    <p className="text-gray-900">
                                                                        {paidAt ? new Date(paidAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                                                                Order #{order.orderId} · {order.paymentMethod ? String(order.paymentMethod).toUpperCase() : '—'}
                                                            </p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        );
                                    })()}
                                </div>
                            )}

                            {/* Addresses Tab */}
                            {activeTab === 'addresses' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold">Saved Addresses</h2>

                                    <form
                                        onSubmit={editingAddressId ? handleUpdateAddress : handleAddAddress}
                                        className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4"
                                    >
                                        <h3 className="font-semibold text-gray-900">{editingAddressId ? 'Edit address' : 'Add new address'}</h3>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Street / Address line</label>
                                            <Input
                                                value={addressForm.addressLine}
                                                onChange={e => setAddressForm(f => ({ ...f, addressLine: e.target.value }))}
                                                placeholder="House no., building, street"
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1 block">City</label>
                                                <Input
                                                    value={addressForm.city}
                                                    onChange={e => setAddressForm(f => ({ ...f, city: e.target.value }))}
                                                    placeholder="City"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium text-gray-700 mb-1 block">State</label>
                                                <Input
                                                    value={addressForm.state}
                                                    onChange={e => setAddressForm(f => ({ ...f, state: e.target.value }))}
                                                    placeholder="State"
                                                    className="rounded-xl"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-700 mb-1 block">Pincode (6 digits)</label>
                                            <Input
                                                value={addressForm.pincode}
                                                onChange={e => setAddressForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                                                placeholder="Pincode"
                                                maxLength={6}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <label className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={addressForm.isDefault}
                                                onChange={e => setAddressForm(f => ({ ...f, isDefault: e.target.checked }))}
                                                className="rounded border-gray-300"
                                            />
                                            <span className="text-sm text-gray-700">Set as default address</span>
                                        </label>
                                        <div className="flex gap-2">
                                            <Button type="submit" className="rounded-xl bg-green-600 hover:bg-green-700">
                                                {editingAddressId ? 'Update address' : 'Add address'}
                                            </Button>
                                            {editingAddressId && (
                                                <Button type="button" variant="outline" className="rounded-xl" onClick={() => { setEditingAddressId(null); setAddressForm({ addressLine: '', city: '', state: '', pincode: '', isDefault: true }); }}>
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </form>

                                    <div className="grid grid-cols-1 gap-4">
                                        {addresses.map(addr => (
                                            <div key={addr._id} className="bg-white border border-gray-100 rounded-2xl p-4 flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">{addr.addressLine}</p>
                                                    <p className="text-gray-500 text-sm">{addr.city}, {addr.state} – {addr.pincode}</p>
                                                    {addr.isDefault && (
                                                        <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Default</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        className="text-green-600 hover:text-green-700 p-2 rounded-lg"
                                                        onClick={() => {
                                                            setEditingAddressId(addr._id);
                                                            setAddressForm({
                                                                addressLine: addr.addressLine || '',
                                                                city: addr.city || '',
                                                                state: addr.state || '',
                                                                pincode: addr.pincode || '',
                                                                isDefault: !!addr.isDefault
                                                            });
                                                        }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="text-red-500 hover:text-red-700 p-2 rounded-lg"
                                                        onClick={async () => {
                                                            if (confirm('Delete this address?')) {
                                                                await userService.deleteAddress(addr._id);
                                                                loadData();
                                                                toast.success('Address deleted');
                                                            }
                                                        }}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
