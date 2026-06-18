import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Trash2, Plus, Minus, ShoppingCart, Smartphone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CartIndex() {
    const [cart, setCart] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const shippingFee = 350;

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('invenio_cart')) || [];
        setCart(storedCart);
        setIsLoaded(true);
    }, []);

    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('invenio_cart', JSON.stringify(newCart));
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const updateQuantity = (index, delta) => {
        const newCart = [...cart];
        const newQty = newCart[index].quantity + delta;
        if (newQty > 0) {
            newCart[index].quantity = newQty;
            updateCart(newCart);
        }
    };

    const removeItem = (index) => {
        const newCart = [...cart];
        newCart.splice(index, 1);
        updateCart(newCart);
        toast.success('Item removed');
    };

    const subtotal = cart.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
    const total = subtotal > 0 ? subtotal + shippingFee : 0;

    if (!isLoaded) return <PublicLayout><div className="min-h-screen"></div></PublicLayout>;

    return (
        <PublicLayout>
            <Head title="Your Cart | Invenio" />

            <div className="bg-slate-900 py-12 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">Your Cart</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {cart.length === 0 ? (
                    <div className="bg-white dark:bg-ink-800 rounded-3xl p-16 text-center border border-slate-100 dark:border-ink-700 shadow-sm max-w-2xl mx-auto">
                        <div className="bg-blue-50 dark:bg-ink-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Your cart is empty</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">Looks like you haven't added any premium smartphones to your cart yet.</p>
                        <Link href={route('public.store.index')} className="inline-flex items-center justify-center px-8 py-4 border border-transparent rounded-full shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                        {/* Cart Items */}
                        <div className="lg:col-span-8">
                            <div className="bg-white dark:bg-ink-800 rounded-2xl shadow-sm border border-slate-100 dark:border-ink-700 overflow-hidden">
                                <ul role="list" className="divide-y divide-slate-200 dark:divide-ink-700">
                                    {cart.map((item, index) => (
                                        <li key={`${item.product_id}-${item.variant_id}`} className="flex py-6 px-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-ink-700/50 transition-colors">
                                            <div className="flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 bg-slate-50 dark:bg-ink-900 rounded-xl overflow-hidden flex items-center justify-center">
                                                {item.image ? (
                                                    <img src={`/storage/${item.image}`} alt={item.name} className="w-full h-full object-contain p-2 mix-blend-multiply dark:mix-blend-normal" />
                                                ) : (
                                                    <Smartphone className="h-10 w-10 text-slate-300 dark:text-ink-600" />
                                                )}
                                            </div>

                                            <div className="ml-4 sm:ml-6 flex-1 flex flex-col justify-between">
                                                <div className="flex justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                                            <Link href={route('public.store.product', { category_slug: 'all', product_slug: item.product_id })}>{item.name}</Link>
                                                        </h3>
                                                        {item.variant_name && (
                                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.variant_name}</p>
                                                        )}
                                                    </div>
                                                    <p className="text-lg font-black text-slate-900 dark:text-white">Rs {parseFloat(item.unit_price).toLocaleString()}</p>
                                                </div>

                                                <div className="mt-4 flex items-center justify-between">
                                                    <div className="flex items-center border border-slate-200 dark:border-ink-600 rounded-lg bg-white dark:bg-ink-800 overflow-hidden">
                                                        <button type="button" onClick={() => updateQuantity(index, -1)} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-ink-700 transition-colors">
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="px-4 font-semibold text-slate-900 dark:text-white border-x border-slate-200 dark:border-ink-600">{item.quantity}</span>
                                                        <button type="button" onClick={() => updateQuantity(index, 1)} className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-ink-700 transition-colors">
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    
                                                    <button type="button" onClick={() => removeItem(index)} className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-full transition-colors" title="Remove item">
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-4 mt-8 lg:mt-0">
                            <div className="bg-white dark:bg-ink-800 rounded-2xl shadow-sm border border-slate-100 dark:border-ink-700 p-6 sm:p-8 sticky top-24">
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>
                                
                                <dl className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                                    <div className="flex justify-between">
                                        <dt>Subtotal</dt>
                                        <dd className="font-semibold text-slate-900 dark:text-white">Rs {subtotal.toLocaleString()}</dd>
                                    </div>
                                    <div className="flex justify-between">
                                        <dt>Shipping Fee</dt>
                                        <dd className="font-semibold text-slate-900 dark:text-white">Rs {shippingFee.toLocaleString()}</dd>
                                    </div>
                                    <div className="border-t border-slate-200 dark:border-ink-700 pt-4 flex justify-between items-center">
                                        <dt className="text-lg font-bold text-slate-900 dark:text-white">Total</dt>
                                        <dd className="text-2xl font-black text-slate-900 dark:text-white">Rs {total.toLocaleString()}</dd>
                                    </div>
                                </dl>

                                <div className="mt-8">
                                    <Link href={route('public.checkout')} className="w-full flex items-center justify-center px-4 py-4 border border-transparent rounded-xl shadow-sm text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all hover:shadow-blue-500/30">
                                        Proceed to Checkout <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                    <Link href={route('public.store.index')} className="w-full flex items-center justify-center px-4 py-4 mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
