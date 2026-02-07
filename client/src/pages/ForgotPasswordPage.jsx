import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPassword } from '@/services/auth.service';
import { toast } from 'sonner';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;
        setIsLoading(true);
        try {
            const res = await forgotPassword(email.trim());
            if (res?.success !== false) {
                setSent(true);
                toast.success(res?.message || 'If an account exists with this email, you will receive a reset link.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Something went wrong. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-3 sm:p-4 pb-20 md:pb-4 bg-gray-50/50 overflow-x-hidden">
                <Card className="w-full max-w-md min-w-0 mx-auto">
                    <CardHeader>
                        <CardTitle>Check your email</CardTitle>
                        <CardDescription>
                            If an account exists for <strong>{email}</strong>, we sent a password reset link. The link expires in 10 minutes.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col gap-2">
                        <Link to="/login" className="w-full">
                            <Button variant="outline" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
                            </Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-3 sm:p-4 pb-20 md:pb-4 bg-gray-50/50 overflow-x-hidden">
            <Card className="w-full max-w-md min-w-0 mx-auto">
                <CardHeader className="space-y-1 px-4 sm:px-6 pt-4 sm:pt-6">
                    <CardTitle className="text-xl sm:text-2xl font-bold">Forgot password?</CardTitle>
                    <CardDescription>
                        Enter the email address linked to your account. We'll send you a link to reset your password.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="email"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Sending...' : 'Send reset link'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Link to="/login" className="text-sm text-green-600 hover:text-green-500 hover:underline flex items-center gap-1">
                        <ArrowLeft className="w-4 h-4" /> Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
