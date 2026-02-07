import React from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';
import { getAssetBaseUrl } from '@/config/env';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

/**
 * CartDrawer Component
 * Side drawer showing cart contents using Shadcn Sheet
 */
export function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemove, cartTotal }) {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleProceedToCheckout = () => {
        onClose();
        navigate(isAuthenticated ? '/checkout' : '/login', { state: !isAuthenticated ? { from: '/checkout' } : undefined });
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="flex flex-col p-0">
                <SheetHeader className="px-6 pt-6 pb-2 shrink-0">
                    <SheetTitle>Shopping Cart</SheetTitle>
                    <SheetDescription>
                        {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col flex-1 min-h-0 pt-4">
                    {cart.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-6">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-10 h-10 text-gray-400" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</p>
                                <p className="text-sm text-gray-500">Add some delicious grapes to get started!</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items - scrollable */}
                            <div className="flex-1 min-h-0 overflow-y-auto space-y-4 px-6 pr-4">
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex gap-4 p-3 bg-gray-50 rounded-xl"
                                    >
                                        <div className="w-20 h-20 rounded-lg bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                            {item.image ? (
                                                <img
                                                    src={item.image?.startsWith('http') ? item.image : `${getAssetBaseUrl()}${item.image?.startsWith('/') ? item.image : `/${item.image || ''}`}`}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23f3f4f6" width="80" height="80"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="10"%3ENo image%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400">No image</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">{item.name}</h4>
                                            <p className="text-xs text-gray-500 mb-2">{item.weight}</p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                                                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                                    className="w-7 h-7 bg-white rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-between">
                                            <button
                                                onClick={() => onRemove(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            <p className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer with subtotal + button - always visible at bottom */}
                            <div className="shrink-0 px-6 pb-6 pt-4 bg-white border-t border-gray-100">
                                <Separator className="mb-4" />
                                <div className="flex items-center justify-between text-lg font-semibold mb-4">
                                    <span>Subtotal</span>
                                    <span className="text-green-600">{formatPrice(cartTotal)}</span>
                                </div>
                                <Button
                                    size="lg"
                                    className="w-full bg-green-600 hover:bg-green-700 font-semibold"
                                    onClick={handleProceedToCheckout}
                                >
                                    Proceed to Checkout
                                </Button>
                                {!isAuthenticated && (
                                    <p className="text-xs text-center text-gray-500 mt-2">
                                        You will be asked to log in to continue.
                                    </p>
                                )}
                                {isAuthenticated && (
                                    <p className="text-xs text-center text-gray-500 mt-2">
                                        Add address and pay on the checkout page.
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default CartDrawer;
