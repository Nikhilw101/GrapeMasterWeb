import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';

export const SignupPage = () => {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const validateForm = () => {
        // Validate mobile number
        const mobilePattern = /^[6-9]\d{9}$/;
        if (!mobilePattern.test(formData.mobile)) {
            setError('Mobile number must be 10 digits starting with 6-9');
            return false;
        }

        // Validate password
        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }

        // Validate name
        if (formData.name.trim().length < 2) {
            setError('Name must be at least 2 characters long');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Client-side validation
        if (!validateForm()) {
            setIsLoading(false);
            return;
        }

        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to register';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-gray-50/50">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription>
                        Enter your details to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                minLength={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="tel"
                                name="mobile"
                                placeholder="Mobile Number (10 digits)"
                                value={formData.mobile}
                                onChange={handleChange}
                                required
                                pattern="[6-9][0-9]{9}"
                                maxLength={10}
                            />
                            <p className="text-xs text-gray-500">
                                Enter 10-digit mobile number (starting with 6-9)
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="email"
                                name="email"
                                placeholder="Email Address (optional)"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-gray-500">
                                Minimum 6 characters
                            </p>
                        </div>
                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                                {error}
                            </div>
                        )}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating account...' : 'Create Account'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-center text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-semibold text-green-600 hover:text-green-500 hover:underline"
                        >
                            Sign in
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};
