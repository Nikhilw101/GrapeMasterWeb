import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader, Filter, Check, X, Clock, Truck, Package, ChevronDown, ChevronUp, MapPin, CreditCard, User, Calendar, IndianRupee } from 'lucide-react';
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
import { getOrders, updateOrderStatus, approveOrder, rejectOrder } from '@/services/admin.service';
import { toast } from 'sonner';

export default function OrderManager() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [expandedOrder, setExpandedOrder] = useState(null);

    // Action Modal State
    const [actionModal, setActionModal] = useState({
        open: false,
        orderId: null,
        type: null, // 'approve', 'reject', 'status'
        newStatus: null,
        note: ''
    });

    useEffect(() => {
        fetchOrders();
    }, [page, statusFilter]);

    const fetchOrders = async () => {
        try {
            setIsLoading(true);
            const params = { page, limit: 10 };
            if (statusFilter !== 'all') params.orderStatus = statusFilter;

            const result = await getOrders(params);
            if (result.success) {
                setOrders(result.data.orders);
                setTotalPages(result.data.pagination.pages);
            }
        } catch (error) {
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async () => {
        const { orderId, type, newStatus, note } = actionModal;
        if (!orderId || isUpdating) return;

        try {
            setIsUpdating(true);
            toast.loading('Updating order...', { id: 'order-update' });

            let result;
            if (type === 'approve') {
                result = await approveOrder(orderId, note);
            } else if (type === 'reject') {
                result = await rejectOrder(orderId, note);
            } else if (type === 'status') {
                result = await updateOrderStatus(orderId, newStatus, note);
            }

            if (result && result.success) {
                toast.success('Order updated successfully', { id: 'order-update' });
                fetchOrders();
                setActionModal({ open: false, orderId: null, type: null, note: '' });
            } else {
                toast.error(result?.message || 'Failed to update order', { id: 'order-update' });
            }
        } catch (error) {
            console.error('Order update error:', error);
            toast.error(error.response?.data?.message || 'Failed to update order', { id: 'order-update' });
        } finally {
            setIsUpdating(false);
        }
    };

    const toggleOrderDetails = (orderId) => {
        setExpandedOrder(expandedOrder === orderId ? null : orderId);
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'created': return { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Placed' };
            case 'submitted': return { color: 'bg-blue-100 text-blue-700', icon: Clock, label: 'Submitted' };
            case 'approved': return { color: 'bg-purple-100 text-purple-700', icon: Check, label: 'Approved' };
            case 'confirmed': return { color: 'bg-purple-100 text-purple-700', icon: Package, label: 'Confirmed' };
            case 'dispatched': return { color: 'bg-indigo-100 text-indigo-700', icon: Truck, label: 'Dispatched' };
            case 'delivered': return { color: 'bg-green-100 text-green-700', icon: Check, label: 'Delivered' };
            case 'cancelled': return { color: 'bg-red-100 text-red-700', icon: X, label: 'Cancelled' };
            case 'rejected': return { color: 'bg-red-100 text-red-700', icon: X, label: 'Rejected' };
            default: return { color: 'bg-gray-100 text-gray-700', icon: Clock, label: status };
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${amount?.toLocaleString('en-IN') || 0}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                    <p className="text-gray-500">Manage and track customer orders</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                    {['all', 'submitted', 'approved', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map(status => (
                        <button
                            key={status}
                            onClick={() => { setStatusFilter(status); setPage(1); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === status
                                ? 'bg-green-600 text-white'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="text-center py-12">
                        <Loader className="w-8 h-8 animate-spin mx-auto text-green-600" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">No orders found</p>
                    </div>
                ) : (
                    orders.map(order => {
                        const status = getStatusConfig(order.orderStatus);
                        const StatusIcon = status.icon;
                        const isExpanded = expandedOrder === order._id;

                        return (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                {/* Order Summary */}
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        {/* Order Info */}
                                        <div className="flex items-start gap-4 flex-1">
                                            <div className={`p-3 rounded-xl ${status.color}`}>
                                                <StatusIcon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-1 flex-wrap">
                                                    <h3 className="font-bold text-gray-900">Order #{order.orderId || order._id.slice(-8).toUpperCase()}</h3>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-2">
                                                    {formatDate(order.createdAt)} • {order.items.length} Items • {formatCurrency(order.pricing.total)}
                                                </p>
                                                <div className="flex items-center gap-2 text-sm">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium text-gray-700">{order.user?.name || order.userDetails?.name || 'Unknown User'}</span>
                                                    <span className="text-gray-400">•</span>
                                                    <span className="text-gray-500">{order.user?.mobile || order.userDetails?.mobile}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 items-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => toggleOrderDetails(order._id)}
                                            >
                                                {isExpanded ? (
                                                    <>Hide Details <ChevronUp className="w-4 h-4 ml-1" /></>
                                                ) : (
                                                    <>View Details <ChevronDown className="w-4 h-4 ml-1" /></>
                                                )}
                                            </Button>

                                            {/* Status Update Dropdown */}
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        Update Status <ChevronDown className="w-4 h-4 ml-2" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {['confirmed', 'dispatched', 'delivered', 'cancelled'].map(s => (
                                                        <DropdownMenuItem
                                                            key={s}
                                                            onClick={() => setActionModal({
                                                                open: true, orderId: order.orderId, type: 'status', newStatus: s, note: ''
                                                            })}
                                                        >
                                                            Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                                                        </DropdownMenuItem>
                                                    ))}
                                                </DropdownMenuContent>
                                            </DropdownMenu>

                                            {/* Approve/Reject for Placed Orders */}
                                            {order.orderStatus === 'placed' && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => setActionModal({
                                                            open: true, orderId: order.orderId, type: 'approve', note: ''
                                                        })}
                                                    >
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => setActionModal({
                                                            open: true, orderId: order.orderId, type: 'reject', note: ''
                                                        })}
                                                    >
                                                        Reject
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="border-t border-gray-100"
                                        >
                                            <div className="p-6 space-y-6">
                                                {/* Customer & Delivery Info */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Customer Details */}
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <User className="w-4 h-4" />
                                                            Customer Details
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div>
                                                                <span className="text-gray-500">Name:</span>
                                                                <span className="ml-2 font-medium text-gray-900">{order.userDetails?.name || order.user?.name}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Mobile:</span>
                                                                <span className="ml-2 font-medium text-gray-900">{order.userDetails?.mobile || order.user?.mobile}</span>
                                                            </div>
                                                            {(order.userDetails?.email || order.user?.email) && (
                                                                <div>
                                                                    <span className="text-gray-500">Email:</span>
                                                                    <span className="ml-2 font-medium text-gray-900">{order.userDetails?.email || order.user?.email}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Delivery Address */}
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <MapPin className="w-4 h-4" />
                                                            Delivery Address
                                                        </h4>
                                                        <div className="text-sm text-gray-900">
                                                            <p>{order.deliveryAddress?.addressLine}</p>
                                                            <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state}</p>
                                                            <p>PIN: {order.deliveryAddress?.pincode}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Order Items */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                        <Package className="w-4 h-4" />
                                                        Order Items
                                                    </h4>
                                                    <div className="space-y-2">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                                                <div className="flex-1">
                                                                    <p className="font-medium text-gray-900">{item.productName || item.product?.name}</p>
                                                                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className="font-semibold text-gray-900">{formatCurrency(item.price)} each</p>
                                                                    <p className="text-sm text-gray-500">Subtotal: {formatCurrency(item.subtotal || item.price * item.quantity)}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Payment & Pricing */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {/* Payment Details */}
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <CreditCard className="w-4 h-4" />
                                                            Payment Details
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div>
                                                                <span className="text-gray-500">Method:</span>
                                                                <span className="ml-2 font-medium text-gray-900">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Status:</span>
                                                                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${order.paymentStatus === 'success' ? 'bg-green-100 text-green-700' :
                                                                        order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-red-100 text-red-700'
                                                                    }`}>
                                                                    {order.paymentStatus}
                                                                </span>
                                                            </div>
                                                            {order.paymentDetails?.transactionId && (
                                                                <div>
                                                                    <span className="text-gray-500">Transaction ID:</span>
                                                                    <span className="ml-2 font-medium text-gray-900">{order.paymentDetails.transactionId}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Pricing Breakdown */}
                                                    <div className="bg-gray-50 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <IndianRupee className="w-4 h-4" />
                                                            Pricing
                                                        </h4>
                                                        <div className="space-y-2 text-sm">
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Items Total:</span>
                                                                <span className="font-medium text-gray-900">{formatCurrency(order.pricing.itemsTotal)}</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-gray-500">Delivery Charges:</span>
                                                                <span className="font-medium text-gray-900">{formatCurrency(order.pricing.deliveryCharges)}</span>
                                                            </div>
                                                            <div className="flex justify-between pt-2 border-t border-gray-200">
                                                                <span className="font-semibold text-gray-900">Total:</span>
                                                                <span className="font-bold text-green-600">{formatCurrency(order.pricing.total)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Status History */}
                                                {order.statusHistory && order.statusHistory.length > 0 && (
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                            <Calendar className="w-4 h-4" />
                                                            Status History
                                                        </h4>
                                                        <div className="space-y-2">
                                                            {order.statusHistory.map((history, idx) => (
                                                                <div key={idx} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                                                                    <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5"></div>
                                                                    <div className="flex-1">
                                                                        <p className="font-medium text-gray-900">{history.status}</p>
                                                                        {history.note && <p className="text-sm text-gray-600">{history.note}</p>}
                                                                        <p className="text-xs text-gray-500 mt-1">{formatDate(history.updatedAt)}</p>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Admin Review */}
                                                {order.adminReview && order.adminReview.reviewNote && (
                                                    <div className="bg-blue-50 rounded-lg p-4">
                                                        <h4 className="font-semibold text-blue-900 mb-2">Admin Review Note</h4>
                                                        <p className="text-sm text-blue-800">{order.adminReview.reviewNote}</p>
                                                        {order.adminReview.reviewedAt && (
                                                            <p className="text-xs text-blue-600 mt-2">Reviewed on {formatDate(order.adminReview.reviewedAt)}</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })
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

            {/* Action Dialog */}
            <Dialog open={actionModal.open} onOpenChange={(open) => setActionModal(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {actionModal.type === 'approve' && 'Approve Order'}
                            {actionModal.type === 'reject' && 'Reject Order'}
                            {actionModal.type === 'status' && 'Update Status'}
                        </DialogTitle>
                        <DialogDescription>
                            {actionModal.type === 'approve' && 'Add an optional note for the customer.'}
                            {actionModal.type === 'reject' && 'Please provide a reason for rejection.'}
                            {actionModal.type === 'status' && `Update status to ${actionModal.newStatus}?`}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <label className="text-sm font-medium mb-2 block">
                            {actionModal.type === 'reject' ? 'Reason (Required)' : 'Note (Optional)'}
                        </label>
                        <Input
                            value={actionModal.note}
                            onChange={(e) => setActionModal(prev => ({ ...prev, note: e.target.value }))}
                            placeholder={actionModal.type === 'reject' ? "Item out of stock..." : "Tracking ID: XYZ..."}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionModal(prev => ({ ...prev, open: false }))} disabled={isUpdating}>Cancel</Button>
                        <Button
                            variant={actionModal.type === 'reject' ? 'destructive' : 'default'}
                            onClick={handleAction}
                            disabled={(actionModal.type === 'reject' && !actionModal.note) || isUpdating}
                        >
                            {isUpdating ? <Loader className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
