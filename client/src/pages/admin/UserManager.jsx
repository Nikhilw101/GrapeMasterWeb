import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, Loader, MoreVertical, Ban, CheckCircle, UserX, UserCheck,
    ChevronDown, ChevronUp, ShoppingBag, DollarSign, Calendar, MapPin, Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { getUsers, updateUserStatus, getUserDetails } from '@/services/admin.service';
import { toast } from 'sonner';

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [confirmModal, setConfirmModal] = useState({ open: false, userId: null, action: null, name: '' });
    const [expandedUser, setExpandedUser] = useState(null);
    const [userDetails, setUserDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchUsers();
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [searchTerm, page]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const result = await getUsers({ page, search: searchTerm, limit: 10 });
            if (result.success) {
                setUsers(result.data.users);
                setTotalPages(result.data.pagination.pages);
            }
        } catch (error) {
            toast.error('Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async () => {
        const { userId, action } = confirmModal;
        if (!userId || !action) return;

        try {
            const newStatus = action === 'block' ? 'blocked' : 'active';
            const result = await updateUserStatus(userId, newStatus);
            if (result.success) {
                toast.success(`User ${action}ed successfully`);
                fetchUsers();
                setConfirmModal({ open: false, userId: null, action: null, name: '' });
            }
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const toggleUserDetails = async (userId) => {
        if (expandedUser === userId) {
            setExpandedUser(null);
            setUserDetails(null);
        } else {
            setExpandedUser(userId);
            setLoadingDetails(true);
            try {
                const result = await getUserDetails(userId);
                if (result.success) {
                    setUserDetails(result.data);
                }
            } catch (error) {
                toast.error('Failed to load user details');
            } finally {
                setLoadingDetails(false);
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">Active</span>;
            case 'blocked':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">Blocked</span>;
            case 'inactive':
                return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700">Inactive</span>;
            default:
                return null;
        }
    };

    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                    <p className="text-gray-500">Manage user accounts and access</p>
                </div>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <Search className="w-5 h-5 text-gray-400" />
                <Input
                    placeholder="Search by name, email, or mobile..."
                    className="border-0 focus-visible:ring-0 px-0 text-base"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Users List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <Loader className="w-8 h-8 animate-spin mx-auto text-green-600" />
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500">No users found</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <motion.div
                            key={user._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                        >
                            {/* User Summary */}
                            <div className="p-6">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                                                {getStatusBadge(user.status)}
                                                {user.orderCount > 0 && (
                                                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                                                        {user.orderCount} {user.orderCount === 1 ? 'Order' : 'Orders'}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                                <span>{user.mobile}</span>
                                                {user.email && <span>{user.email}</span>}
                                                <span>Joined {formatDate(user.createdAt)}</span>
                                            </div>
                                            {user.totalSpent > 0 && (
                                                <div className="mt-1 text-sm font-medium text-green-600">
                                                    Total Spent: {formatCurrency(user.totalSpent)}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => toggleUserDetails(user._id)}
                                        >
                                            {expandedUser === user._id ? (
                                                <>Details <ChevronUp className="w-4 h-4 ml-1" /></>
                                            ) : (
                                                <>Details <ChevronDown className="w-4 h-4 ml-1" /></>
                                            )}
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {user.status === 'blocked' ? (
                                                    <DropdownMenuItem
                                                        onClick={() => setConfirmModal({ open: true, userId: user._id, action: 'unblock', name: user.name })}
                                                        className="text-green-600"
                                                    >
                                                        <UserCheck className="w-4 h-4 mr-2" /> Unblock User
                                                    </DropdownMenuItem>
                                                ) : (
                                                    <DropdownMenuItem
                                                        onClick={() => setConfirmModal({ open: true, userId: user._id, action: 'block', name: user.name })}
                                                        className="text-red-600"
                                                    >
                                                        <UserX className="w-4 h-4 mr-2" /> Block User
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            <AnimatePresence>
                                {expandedUser === user._id && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t border-gray-100"
                                    >
                                        {loadingDetails ? (
                                            <div className="p-6 text-center">
                                                <Loader className="w-6 h-6 animate-spin mx-auto text-green-600" />
                                            </div>
                                        ) : userDetails ? (
                                            <div className="p-6 space-y-6">
                                                {/* Statistics */}
                                                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                                    <div className="bg-blue-50 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 text-blue-600 mb-1">
                                                            <ShoppingBag className="w-4 h-4" />
                                                            <span className="text-xs font-medium">Total Orders</span>
                                                        </div>
                                                        <p className="text-2xl font-bold text-blue-900">{userDetails.statistics.orderCount}</p>
                                                    </div>
                                                    <div className="bg-green-50 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 text-green-600 mb-1">
                                                            <DollarSign className="w-4 h-4" />
                                                            <span className="text-xs font-medium">Total Spent</span>
                                                        </div>
                                                        <p className="text-2xl font-bold text-green-900">{formatCurrency(userDetails.statistics.totalSpent)}</p>
                                                    </div>
                                                    <div className="bg-purple-50 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 text-purple-600 mb-1">
                                                            <Package className="w-4 h-4" />
                                                            <span className="text-xs font-medium">Avg Order Value</span>
                                                        </div>
                                                        <p className="text-2xl font-bold text-purple-900">{formatCurrency(userDetails.statistics.averageOrderValue)}</p>
                                                    </div>
                                                    <div className="bg-orange-50 rounded-lg p-4">
                                                        <div className="flex items-center gap-2 text-orange-600 mb-1">
                                                            <Calendar className="w-4 h-4" />
                                                            <span className="text-xs font-medium">Last Order</span>
                                                        </div>
                                                        <p className="text-sm font-bold text-orange-900">{formatDate(userDetails.statistics.lastOrderDate)}</p>
                                                    </div>
                                                </div>

                                                {/* Addresses */}
                                                {userDetails.user.addresses && userDetails.user.addresses.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <MapPin className="w-4 h-4" />
                                                            Saved Addresses
                                                        </h4>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                            {userDetails.user.addresses.map((address, idx) => (
                                                                <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                                                                    <p className="text-gray-900">{address.addressLine}</p>
                                                                    <p className="text-gray-600">
                                                                        {address.city}, {address.state} - {address.pincode}
                                                                    </p>
                                                                    {address.isDefault && (
                                                                        <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                                                            Default
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Recent Orders */}
                                                {userDetails.recentOrders && userDetails.recentOrders.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <Package className="w-4 h-4" />
                                                            Recent Orders
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {userDetails.recentOrders.map((order) => (
                                                                <div key={order._id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">#{order.orderId}</p>
                                                                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                                                                    </div>
                                                                    <div className="text-right">
                                                                        <p className="font-semibold text-gray-900">{formatCurrency(order.pricing.total)}</p>
                                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                                order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                                                    'bg-blue-100 text-blue-700'
                                                                            }`}>
                                                                            {order.orderStatus}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 flex justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                    >
                        Previous
                    </Button>
                    <span className="flex items-center px-4 text-sm font-medium text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                    >
                        Next
                    </Button>
                </div>
            )}

            {/* Confirmation Dialog */}
            <Dialog open={confirmModal.open} onOpenChange={(open) => setConfirmModal(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{confirmModal.action === 'block' ? 'Block User' : 'Unblock User'}</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to {confirmModal.action} <strong>{confirmModal.name}</strong>?
                            {confirmModal.action === 'block' && ' They will be logged out immediately.'}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}>Cancel</Button>
                        <Button
                            variant={confirmModal.action === 'block' ? 'destructive' : 'default'}
                            onClick={handleStatusChange}
                        >
                            {confirmModal.action === 'block' ? 'Block User' : 'Unblock User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
