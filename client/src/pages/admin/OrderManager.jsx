import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader, Filter, Check, X, Clock, Truck, Package, ChevronDown } from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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
            if (statusFilter !== 'all') params.status = statusFilter;

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
        if (!orderId) return;

        try {
            let result;
            if (type === 'approve') {
                result = await approveOrder(orderId, note);
            } else if (type === 'reject') {
                result = await rejectOrder(orderId, note); // note acts as reason
            } else if (type === 'status') {
                result = await updateOrderStatus(orderId, newStatus, note);
            }

            if (result && result.success) {
                toast.success('Order updated successfully');
                fetchOrders();
                setActionModal({ open: false, orderId: null, type: null, note: '' });
            }
        } catch (error) {
            toast.error('Failed to update order');
        }
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

                        return (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    {/* Order Info */}
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-xl ${status.color}`}>
                                            <StatusIcon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-gray-900">Order #{order._id.slice(-8).toUpperCase()}</h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} Items • ₹{order.pricing.total}
                                            </p>
                                            <div className="mt-2 text-sm">
                                                <span className="font-medium text-gray-700">{order.user?.name || 'Unknown User'}</span>
                                                <span className="text-gray-400 mx-2">|</span>
                                                <span className="text-gray-500">{order.user?.mobile}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items Preview */}
                                    <div className="flex-1 lg:max-w-md">
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {order.items.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg text-sm min-w-[140px]">
                                                    <div className="font-medium text-gray-700 truncate">{item.product?.name}</div>
                                                    <div className="text-gray-400 text-xs">x{item.quantity}</div>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <div className="flex items-center justify-center bg-gray-50 px-3 py-2 rounded-lg text-sm text-gray-500">
                                                    +{order.items.length - 3} more
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {/* Status Update Dropdown */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline">
                                                    Update Status <ChevronDown className="w-4 h-4 ml-2" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {['confirmed', 'dispatched', 'delivered', 'cancelled'].map(s => (
                                                    <DropdownMenuItem
                                                        key={s}
                                                        onClick={() => setActionModal({
                                                            open: true, orderId: order._id, type: 'status', newStatus: s, note: ''
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
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => setActionModal({
                                                        open: true, orderId: order._id, type: 'approve', note: ''
                                                    })}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => setActionModal({
                                                        open: true, orderId: order._id, type: 'reject', note: ''
                                                    })}
                                                >
                                                    Reject
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
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
                        <Button variant="outline" onClick={() => setActionModal(prev => ({ ...prev, open: false }))}>Cancel</Button>
                        <Button
                            variant={actionModal.type === 'reject' ? 'destructive' : 'default'}
                            onClick={handleAction}
                            disabled={actionModal.type === 'reject' && !actionModal.note}
                        >
                            Confirm
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
