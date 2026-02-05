import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as userService from '@/services/user.service';
import * as orderService from '@/services/order.service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader, User, MapPin, Package, LogOut, ChevronRight, Plus, X } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatPrice } from '@/lib/utils';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const activeTabParam = searchParams.get('tab');

    const [activeTab, setActiveTab] = useState(activeTabParam || 'profile'); // 'profile', 'orders', 'addresses'
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [profile, setProfile] = useState({ name: '', email: '', mobile: '' });
    const [isLoading, setIsLoading] = useState(true);

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
                setProfile(profileResult.data.user);
                setAddresses(profileResult.data.addresses);
            }

            if (activeTab === 'orders') {
                const ordersResult = await orderService.getMyOrders();
                if (ordersResult.success) {
                    setOrders(ordersResult.data.orders);
                }
            }
        } catch (error) {
            toast.error('Failed to load profile data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const result = await userService.updateProfile(profile);
            if (result.success) {
                toast.success('Profile updated successfully');
            }
        } catch (error) {
            toast.error('Failed to update profile');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const OrderCard = ({ order }) => (
        <div className="bg-white border border-gray-100 rounded-xl p-4 md:p-6 mb-4 hover:shadow-sm transition-all">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
                <div>
                    <h3 className="font-bold text-gray-900">Order #{order.orderId}</h3>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-blue-100 text-blue-700'}`}>
                        {order.orderStatus}
                    </span>
                    <span className="font-bold text-gray-900">{formatPrice(order.pricing.total)}</span>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                        <span className="font-medium">{item.quantity}x</span>
                        <span className="flex-1">{item.name || item.product?.name}</span>
                        <span>{formatPrice(item.price)}</span>
                    </div>
                ))}
            </div>

            {order.orderStatus === 'placed' && (
                <Button
                    variant="outline"
                    className="w-full md:w-auto text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={async () => {
                        if (confirm('Are you sure you want to cancel this order?')) {
                            try {
                                await orderService.cancelOrder(order.orderId);
                                toast.success('Order cancelled');
                                loadData();
                            } catch (e) {
                                toast.error('Failed to cancel order');
                            }
                        }
                    }}
                >
                    Cancel Order
                </Button>
            )}
        </div>
    );

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
                                                disabled
                                                className="bg-gray-50 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Mobile number cannot be changed.</p>
                                        </div>
                                        <Button type="submit" className="bg-green-600 hover:bg-green-700">Save Changes</Button>
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

                            {/* Addresses Tab */}
                            {activeTab === 'addresses' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold">Saved Addresses</h2>
                                        {/* Simplified adder */}
                                    </div>
                                    <p className="text-gray-500 text-sm">Manage addresses in Cart or Checkout page for now.</p>

                                    <div className="grid grid-cols-1 gap-4">
                                        {addresses.map(addr => (
                                            <div key={addr._id} className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-gray-900">{addr.addressLine}</p>
                                                    <p className="text-gray-500 text-sm">{addr.city}, {addr.state} - {addr.pincode}</p>
                                                    {addr.isDefault && (
                                                        <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Default</span>
                                                    )}
                                                </div>
                                                <button
                                                    className="text-red-500 hover:text-red-700 p-2"
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
