import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { adminForgotPassword } from '@/services/admin.service';
import { toast } from 'sonner';

export default function AdminForgotPasswordPage() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setIsLoading(true);
        try {
            const res = await adminForgotPassword(email.trim());
            if (res?.success) {
                setSent(true);
                toast.success(res.message || 'Check your email for the reset link.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-green-500/10 blur-[100px]" />
                    <div className="absolute -bottom-[40%] -right-[20%] w-[70%] h-[70%] rounded-full bg-blue-500/10 blur-[100px]" />
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 relative z-10 text-center"
                >
                    <h2 className="text-xl font-semibold text-white mb-2">Check your email</h2>
                    <p className="text-gray-400 mb-6">
                        If an admin account exists for <strong className="text-gray-300">{email}</strong>, we sent a password reset link. The link expires in 10 minutes.
                    </p>
                    <Link to="/admin/login">
                        <Button variant="outline" className="rounded-xl border-white/20 text-white hover:bg-white/10">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
                        </Button>
                    </Link>
                </motion.div>
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
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Forgot password?</h1>
                    <p className="text-gray-400">Enter your admin email to receive a reset link</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <Input
                            type="email"
                            placeholder="Admin email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-green-500/50 focus:ring-green-500/20 rounded-xl"
                            required
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-xl shadow-lg shadow-green-500/20 transition-all duration-200"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <span className="flex items-center gap-2">Send reset link <ArrowRight className="w-4 h-4" /></span>}
                    </Button>

                    <div className="text-center">
                        <Link to="/admin/login" className="text-sm text-gray-400 hover:text-green-400 transition-colors inline-flex items-center gap-1">
                            <ArrowLeft className="w-4 h-4" /> Back to login
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
