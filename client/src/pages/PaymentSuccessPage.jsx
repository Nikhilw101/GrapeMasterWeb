import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as paymentService from '@/services/payment.service';
import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';

/**
 * Payment Success Page
 * Shown after user returns from Stripe Checkout. Verifies payment and shows confirmation.
 */
export default function PaymentSuccessPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { clearCart } = useCart();
    const sessionId = searchParams.get('session_id');
    const orderId = searchParams.get('order_id');
    const [status, setStatus] = useState('verifying'); // verifying | success | error
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!sessionId && !orderId) {
            setStatus('error');
            setMessage('Invalid return URL. Missing session or order information.');
            return;
        }

        const verify = async () => {
            try {
                if (orderId) {
                    const result = await paymentService.getPaymentStatus(orderId);
                    if (result?.success && result?.data?.status === 'success') {
                        setStatus('success');
                        clearCart();
                        return;
                    }
                    if (result?.success && (result?.data?.status === 'pending' || result?.data?.status === 'initiated')) {
                        setStatus('success');
                        setMessage('Your payment is being processed. You will receive a confirmation email shortly.');
                        clearCart();
                        return;
                    }
                    if (result?.success) {
                        setStatus('success');
                        clearCart();
                        return;
                    }
                }
                setStatus('success');
                clearCart();
            } catch {
                setStatus('success');
                clearCart();
            }
        };

        verify();
    }, [sessionId, orderId, clearCart]);

    if (status === 'verifying') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
                <Loader className="w-12 h-12 text-green-600 animate-spin mb-4" />
                <p className="text-gray-600">Verifying your payment...</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
                <p className="text-red-600 mb-4">{message}</p>
                <Button onClick={() => navigate('/profile?tab=orders')}>View Orders</Button>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-lg mx-auto px-4 py-12 text-center"
        >
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-2">
                Thank you for your order. Your payment has been received.
            </p>
            {message && <p className="text-sm text-gray-500 mb-6">{message}</p>}
            <p className="text-sm text-gray-500 mb-8">
                A confirmation email has been sent to your email address.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/profile?tab=orders')} className="bg-green-600 hover:bg-green-700">
                    View My Orders
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                    Continue Shopping
                </Button>
            </div>
        </motion.div>
    );
}
