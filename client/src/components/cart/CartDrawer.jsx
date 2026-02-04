import React from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatPrice } from '@/lib/utils';

/**
 * CartDrawer Component
 * Side drawer showing cart contents using Shadcn Sheet
 */
export function CartDrawer({ isOpen, onClose, cart, onUpdateQuantity, onRemove, cartTotal }) {
    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Shopping Cart</SheetTitle>
                    <SheetDescription>
                        {cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col h-full pt-6">
                    {cart.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
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
                            {/* Cart Items */}
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                                {cart.map((item) => (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="flex gap-4 p-3 bg-gray-50 rounded-xl"
                                    >
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
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

                            <div className="pt-4 space-y-4">
                                <Separator />
                                {/* Subtotal */}
                                <div className="flex items-center justify-between text-lg font-semibold">
                                    <span>Subtotal</span>
                                    <span className="text-green-600">{formatPrice(cartTotal)}</span>
                                </div>
                                {/* Checkout Button */}
                                <Button size="lg" className="w-full">
                                    Checkout
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

export default CartDrawer;
