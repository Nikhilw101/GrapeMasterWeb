import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader, MoreVertical, Ban, CheckCircle, UserX, UserCheck } from 'lucide-react';
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
import { getUsers, updateUserStatus } from '@/services/admin.service';
import { toast } from 'sonner';

export default function UserManager() {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [confirmModal, setConfirmModal] = useState({ open: false, userId: null, action: null, name: '' });

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

            {/* Users Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">User</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Contact</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                                <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Joined</th>
                                <th className="text-right py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center">
                                        <Loader className="w-6 h-6 animate-spin mx-auto text-green-600" />
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-8 text-center text-gray-500">
                                        No users found
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">ID: {user._id.slice(-6)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-sm text-gray-900">{user.mobile}</p>
                                            <p className="text-sm text-gray-500">{user.email || 'No email'}</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            {getStatusBadge(user.status)}
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-right">
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
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex justify-center gap-2">
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
            </div>

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
