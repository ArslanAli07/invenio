import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/Components/ui/sheet";
import { useCart } from '@/Contexts/CartContext';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function CartDrawer() {
    const { cart, cartCount, cartSubtotal, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();

    return (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-white dark:bg-ink-900 border-l border-slate-200 dark:border-ink-700 p-0 overflow-hidden">
                <SheetHeader className="p-6 border-b border-slate-100 dark:border-ink-800">
                    <SheetTitle className="flex items-center text-slate-900 dark:text-white text-xl">
                        <ShoppingCart className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                        Your Cart ({cartCount})
                    </SheetTitle>
                    <SheetDescription className="hidden">
                        Review your items and proceed to checkout.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400 space-y-4">
                            <ShoppingCart className="w-16 h-16 opacity-20" />
                            <p className="text-lg font-medium">Your cart is empty.</p>
                            <button 
                                onClick={() => setIsCartOpen(false)}
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {cart.map((item, index) => {
                                const price = item.variant ? parseFloat(item.variant.price) : parseFloat(item.product.price);
                                return (
                                    <div key={index} className="flex gap-4 p-4 bg-slate-50 dark:bg-ink-800 rounded-xl border border-slate-100 dark:border-ink-700 relative group">
                                        <div className="w-20 h-20 bg-white dark:bg-ink-900 rounded-lg p-2 flex-shrink-0 flex items-center justify-center">
                                            {item.product.primary_image && item.product.primary_image.length > 0 ? (
                                                <img src={`/storage/${item.product.primary_image[0].path}`} alt={item.product.name} className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal" />
                                            ) : (
                                                <ShoppingCart className="w-8 h-8 text-slate-300 dark:text-ink-600" />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <h4 className="font-semibold text-slate-900 dark:text-white line-clamp-1">{item.product.name}</h4>
                                                {item.variant && (
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.variant.name}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="font-bold text-blue-600 dark:text-blue-400">Rs {price.toLocaleString()}</span>
                                                <div className="flex items-center bg-white dark:bg-ink-900 border border-slate-200 dark:border-ink-700 rounded-lg overflow-hidden shadow-sm">
                                                    <button 
                                                        onClick={() => updateQuantity(item.product.id, item.variant ? item.variant.id : null, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-ink-700 disabled:opacity-50"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium text-slate-900 dark:text-white">{item.quantity}</span>
                                                    <button 
                                                        onClick={() => updateQuantity(item.product.id, item.variant ? item.variant.id : null, item.quantity + 1)}
                                                        className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-ink-700"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.product.id, item.variant ? item.variant.id : null)}
                                            className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-ink-700 border border-slate-200 dark:border-ink-600 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {cart.length > 0 && (
                    <div className="p-6 border-t border-slate-100 dark:border-ink-800 bg-slate-50 dark:bg-ink-900/50">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-slate-600 dark:text-slate-400 font-medium">Subtotal</span>
                            <span className="text-xl font-bold text-slate-900 dark:text-white">Rs {cartSubtotal.toLocaleString()}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-center">Shipping and taxes calculated at checkout.</p>
                        <Link 
                            href={route('public.checkout')} 
                            onClick={() => setIsCartOpen(false)}
                            className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all flex justify-center items-center"
                        >
                            Proceed to Checkout
                        </Link>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
