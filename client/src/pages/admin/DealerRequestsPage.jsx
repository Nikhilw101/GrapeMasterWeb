import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Store, Mail, Phone, Loader, Eye, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getDealerRequests, getDealerRequestById, updateDealerRequestStatus } from '@/services/dealer.service';
import { toast } from 'sonner';

const STATUS_COLORS = {
    pending: 'bg-amber-100 text-amber-800',
    reviewed: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
};

export default function DealerRequestsPage() {
    const [requests, setRequests] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
    const [statusFilter, setStatusFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedId, setSelectedId] = useState(null);
    const [detail, setDetail] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const res = await getDealerRequests({ page: pagination.page, limit: pagination.limit, status: statusFilter || undefined });
            if (res.success && res.data) {
                setRequests(res.data.requests || []);
                setPagination(prev => ({ ...prev, ...res.data.pagination }));
            }
        } catch (e) {
            toast.error('Failed to load dealer requests');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [pagination.page, statusFilter]);

    const openDetail = async (id) => {
        setSelectedId(id);
        try {
            const res = await getDealerRequestById(id);
            if (res.success) setDetail(res.data);
        } catch {
            toast.error('Failed to load details');
        }
    };

    const closeDetail = () => {
        setSelectedId(null);
        setDetail(null);
    };

    const handleStatusChange = async (id, status, statusNote = '') => {
        try {
            setUpdatingId(id);
            await updateDealerRequestStatus(id, status, statusNote);
            toast.success('Status updated');
            if (selectedId === id) setDetail(prev => prev ? { ...prev, status } : null);
            fetchRequests();
        } catch (e) {
            toast.error(e.response?.data?.message || 'Failed to update');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Dealer Requests</h1>
                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
                    >
                        <option value="">All statuses</option>
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={fetchRequests} disabled={isLoading}>
                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-green-600" />
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Store / Owner</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Contact</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Status</th>
                                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Submitted</th>
                                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {requests.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-12 text-gray-500">No dealer requests yet.</td>
                                    </tr>
                                ) : (
                                    requests.map((req) => (
                                        <tr key={req._id} className="hover:bg-gray-50/50">
                                            <td className="p-4">
                                                <p className="font-medium text-gray-900">{req.storeName}</p>
                                                <p className="text-sm text-gray-500">{req.ownerName}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm text-gray-600">{req.email}</p>
                                                <p className="text-sm text-gray-500">{req.phone}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[req.status] || 'bg-gray-100 text-gray-700'}`}>
                                                    {req.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right">
                                                <Button variant="ghost" size="sm" onClick={() => openDetail(req._id)}>
                                                    <Eye className="w-4 h-4" /> View
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>Previous</Button>
                                <Button variant="outline" size="sm" disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>Next</Button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}

            {selectedId && detail && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeDetail}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Dealer Request Details</h2>
                            <Button variant="ghost" size="sm" onClick={closeDetail}>Close</Button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div><span className="text-sm text-gray-500">Store / Business</span><p className="font-medium">{detail.storeName}</p></div>
                            <div><span className="text-sm text-gray-500">Owner</span><p className="font-medium">{detail.ownerName}</p></div>
                            <div><span className="text-sm text-gray-500">Email</span><p>{detail.email}</p></div>
                            <div><span className="text-sm text-gray-500">Phone</span><p>{detail.phone}</p></div>
                            {detail.address && <div><span className="text-sm text-gray-500">Address</span><p>{detail.address}</p></div>}
                            {detail.businessDetails && <div><span className="text-sm text-gray-500">Business details</span><p className="whitespace-pre-wrap">{detail.businessDetails}</p></div>}
                            {detail.notes && <div><span className="text-sm text-gray-500">Notes</span><p className="whitespace-pre-wrap">{detail.notes}</p></div>}
                            <div><span className="text-sm text-gray-500">Status</span><p><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[detail.status] || ''}`}>{detail.status}</span></p></div>
                            <div className="flex flex-wrap gap-2 pt-4 border-t">
                                {['pending', 'reviewed', 'approved', 'rejected'].map((status) => (
                                    <Button
                                        key={status}
                                        variant={detail.status === status ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={updatingId === detail._id}
                                        onClick={() => handleStatusChange(detail._id, status)}
                                    >
                                        {updatingId === detail._id ? <Loader className="w-3 h-3 animate-spin" /> : status}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
