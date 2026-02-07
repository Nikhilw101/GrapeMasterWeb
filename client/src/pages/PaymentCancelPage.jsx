import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Payment Cancel Page
 * Shown when user cancels Stripe Checkout. Cart is preserved; user can retry or go back.
 */
export default function PaymentCancelPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('order_id');

    return (
        <div className="max-w-lg mx-auto px-4 py-12 text-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-12 h-12 text-amber-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Cancelled</h1>
            <p className="text-gray-600 mb-8">
                You cancelled the payment. Your cart has been preserved. You can complete the payment from your
                orders or try again at checkout.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => navigate('/checkout')} className="bg-green-600 hover:bg-green-700">
                    Back to Checkout
                </Button>
                <Button variant="outline" onClick={() => navigate('/')}>
                    Continue Shopping
                </Button>
            </div>
        </div>
    );
}
