import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader, AlertCircle } from 'lucide-react';

/**
 * Embedded Stripe Payment Element form.
 * Used on checkout page – no redirect; payment completes in-app (3DS may redirect back to our success page).
 */
export default function StripePaymentForm({ amount, orderId, onSuccess, onCancel }) {
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setError(null);
        setIsProcessing(true);

        const returnUrl = orderId
            ? `${window.location.origin}/payment/success?order_id=${encodeURIComponent(orderId)}`
            : `${window.location.origin}/payment/success`;

        const { error: submitError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: returnUrl,
                receipt_email: undefined,
            },
        });

        if (submitError) {
            setError(submitError.message || 'Payment failed');
            setIsProcessing(false);
            return;
        }

        onSuccess?.();
        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement
                options={{
                    layout: 'tabs',
                    defaultCollapsed: false,
                    radios: true,
                    spacedAccordionItems: true,
                }}
            />
            {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}
            <div className="flex gap-3 pt-2">
                <Button
                    type="submit"
                    disabled={!stripe || !elements || isProcessing}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                >
                    {isProcessing ? (
                        <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                        `Pay ${amount}`
                    )}
                </Button>
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel} disabled={isProcessing}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}
