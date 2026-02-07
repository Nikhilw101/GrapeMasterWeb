import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader, ArrowRight, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminResetPassword } from '@/services/admin.service';
import { toast } from 'sonner';

export default function AdminResetPasswordPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    useEffect(() => {
        if (!token) toast.error('Invalid or missing reset link.');
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) return;
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setIsLoading(true);
        try {
            const res = await adminResetPassword(token, password);
            if (res?.success) {
                setSuccess(true);
                toast.success(res.message || 'Password reset successfully.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired link. Request a new reset.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-green-500/10 blur-[100px]" />
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative z-10 text-center"
                >
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-white mb-2">Password reset successful</h2>
                    <p className="text-gray-400 mb-6">You can now log in with your new password.</p>
                    <Button
                        onClick={() => navigate('/admin/login')}
                        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl"
                    >
                        Go to login <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="text-center text-gray-400">
                    <p className="mb-4">Invalid or missing reset link.</p>
                    <Link to="/admin/forgot-password" className="text-green-400 hover:underline">Request a new link</Link>
                    <span className="mx-2">|</span>
                    <Link to="/admin/login" className="text-green-400 hover:underline">Back to login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-green-500/10 blur-[100px]" />
                <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative z-10 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                        <Lock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Set new password</h1>
                    <p className="text-gray-400">Enter your new password below (min 6 characters)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                            type="password"
                            placeholder="New password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            minLength={6}
                            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50 focus:ring-green-500/20 rounded-xl"
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                            type="password"
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            minLength={6}
                            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50 focus:ring-green-500/20 rounded-xl"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-green-500/20 transition-all duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Reset password <ArrowRight className="w-4 h-4" /></span>}
                    </Button>

                    <div className="text-center">
                        <Link to="/admin/login" className="text-sm text-gray-400 hover:text-green-400 transition-colors">Back to login</Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
