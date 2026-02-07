import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
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
import { resetPassword } from '@/services/auth.service';
import { toast } from 'sonner';
import { Lock, CheckCircle } from 'lucide-react';

export default function ResetPasswordPage() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token') || '';

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

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
            const res = await resetPassword(token, password);
            if (res?.success !== false) {
                setSuccess(true);
                toast.success('Password reset successfully. You can now log in.');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired link. Request a new reset.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-gray-50/50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <div className="flex justify-center mb-2">
                            <CheckCircle className="w-12 h-12 text-green-600" />
                        </div>
                        <CardTitle className="text-center">Password reset successful</CardTitle>
                        <CardDescription className="text-center">
                            You can now log in with your new password.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter>
                        <Link to="/login" className="w-full">
                            <Button className="w-full">Go to login</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!token) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-gray-50/50">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Invalid link</CardTitle>
                        <CardDescription>
                            This reset link is invalid or has expired. Please request a new one.
                        </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex flex-col gap-2">
                        <Link to="/forgot-password">
                            <Button variant="outline" className="w-full">Request new link</Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="ghost" className="w-full">Back to login</Button>
                        </Link>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-gray-50/50">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Set new password</CardTitle>
                    <CardDescription>
                        Enter your new password below (at least 6 characters).
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">New password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="password"
                                    placeholder="New password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    minLength={6}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirm password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <Input
                                    type="password"
                                    placeholder="Confirm password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={6}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Resetting...' : 'Reset password'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter>
                    <Link to="/login" className="text-sm text-gray-500 hover:text-green-600">
                        Back to login
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
