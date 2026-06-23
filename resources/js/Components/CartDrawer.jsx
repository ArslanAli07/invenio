import React from 'react';
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { useCart } from '@/Contexts/CartContext';
import { Plus, Minus, Trash2, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

export default function CartDrawer() {
    const { cart, cartCount, cartSubtotal, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity } = useCart();

    return (
        <SheetPrimitive.Root open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetPrimitive.Portal>
                <SheetPrimitive.Overlay className="fixed inset-0 bg-black/40 z-[200] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
                <SheetPrimitive.Content className="fixed right-0 top-0 h-full w-[400px] max-w-full bg-white dark:bg-zinc-900 border-l border-stone-200 dark:border-zinc-700 shadow-xl z-[210] flex flex-col focus:outline-none transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
                    
                    {/* Drawer Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-zinc-700">
                        <SheetPrimitive.Title className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                            Your Cart ({cartCount})
                        </SheetPrimitive.Title>
                        <SheetPrimitive.Description className="sr-only">
                            Review your items and proceed to checkout.
                        </SheetPrimitive.Description>
                        <SheetPrimitive.Close className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none">
                            <X className="w-5 h-5" />
                        </SheetPrimitive.Close>
                    </div>

                    {/* Cart Items */}
                    {cart.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
                            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                Your cart is empty
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                Add some products to get started
                            </p>
                            <Link href={route('public.store.index')} onClick={() => setIsCartOpen(false)} className="mt-4 inline-flex items-center justify-center bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-md px-5 py-2 text-sm font-medium transition-colors">
                                Browse Store
                            </Link>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
                            {cart.map((item, index) => {
                                const price = item.variant ? parseFloat(item.variant.price) : parseFloat(item.product.price);
                                return (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md relative group">
                                        
                                        <div className="w-16 h-16 rounded-md overflow-hidden bg-white dark:bg-zinc-700 border border-stone-200 dark:border-zinc-600 shrink-0">
                                            {item.product.primary_image && item.product.primary_image.length > 0 ? (
                                                <img src={`/storage/${item.product.primary_image[0].path}`} alt={item.product.name} className="w-full h-full object-contain p-1 mix-blend-multiply dark:mix-blend-normal" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center" />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 flex flex-col">
                                            <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{item.product.name}</h4>
                                            {item.variant && (
                                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{item.variant.name}</p>
                                            )}
                                            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1">Rs {price.toLocaleString()}</div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2 ml-auto shrink-0">
                                            <button 
                                                onClick={() => updateQuantity(item.product.id, item.variant ? item.variant.id : null, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                                className="w-7 h-7 rounded-md border border-stone-200 dark:border-zinc-600 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-700 text-sm font-medium transition-colors disabled:opacity-50"
                                            >
                                                <Minus className="w-3.5 h-3.5" />
                                            </button>
                                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 w-6 text-center">{item.quantity}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.product.id, item.variant ? item.variant.id : null, item.quantity + 1)}
                                                className="w-7 h-7 rounded-md border border-stone-200 dark:border-zinc-600 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-700 text-sm font-medium transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                        
                                        <button 
                                            onClick={() => removeFromCart(item.product.id, item.variant ? item.variant.id : null)}
                                            className="absolute -top-2 -right-2 p-1.5 bg-white dark:bg-zinc-700 border border-stone-200 dark:border-zinc-600 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md opacity-0 xl:opacity-100 group-hover:opacity-100 transition-opacity shadow-sm focus:outline-none"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Drawer Footer */}
                    {cart.length > 0 && (
                        <div className="border-t border-stone-200 dark:border-zinc-700 px-6 py-5 mt-auto bg-white dark:bg-zinc-900">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Subtotal</span>
                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Rs {cartSubtotal.toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 text-center mb-4">Shipping and taxes calculated at checkout.</p>
                            <Link 
                                href={route('public.checkout')} 
                                onClick={() => setIsCartOpen(false)}
                                className="block w-full bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-md py-3 text-sm font-semibold transition-colors text-center"
                            >
                                Proceed to Checkout
                            </Link>
                        </div>
                    )}
                </SheetPrimitive.Content>
            </SheetPrimitive.Portal>
        </SheetPrimitive.Root>
    );
}
