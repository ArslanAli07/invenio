import { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { ShieldCheck, Truck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '@/Contexts/CartContext';
import toast from 'react-hot-toast';

export default function CheckoutIndex() {
    const { cart, cartSubtotal, clearCart } = useCart();
    const [isLoaded, setIsLoaded] = useState(false);
    const shippingFee = 350;

    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        customer_phone: '',
        customer_city: '',
        customer_address: '',
        honeypot: '',
        items: [],
        subtotal: 0,
        shipping_fee: shippingFee,
        total: 0,
        confirm_cod: false,
    });

    useEffect(() => {
        if (cart.length === 0 && isLoaded) {
            router.get(route('public.store.index'));
            return;
        }

        if (cart.length > 0) {
            const total = cartSubtotal + shippingFee;

            setData(prev => ({
                ...prev,
                items: cart.map(i => ({
                    product_id: i.product.id,
                    variant_id: i.variant ? i.variant.id : null,
                    quantity: i.quantity,
                    unit_price: i.variant ? parseFloat(i.variant.price) : parseFloat(i.product.price)
                })),
                subtotal: cartSubtotal,
                total
            }));
            
            setIsLoaded(true);
        }
    }, [cart, cartSubtotal]);

    const submitOrder = (e) => {
        e.preventDefault();
        
        if (!data.confirm_cod) {
            toast.error('Please confirm Cash on Delivery to proceed');
            return;
        }

        // We use router.post directly since Inertia's useForm doesn't let us easily clear localStorage on success
        post(route('public.checkout.store'), {
            onSuccess: () => {
                clearCart();
            },
            onError: (errs) => {
                toast.error('There was an error processing your order.');
                console.error(errs);
            }
        });
    };

    if (!isLoaded) return <PublicLayout><div className="min-h-screen"></div></PublicLayout>;

    return (
        <PublicLayout>
            <Head title="Checkout | Invenio" />

            <div className="bg-slate-900 py-8 border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Checkout</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <form onSubmit={submitOrder} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
                    
                    {/* Left: Customer Details Form */}
                    <div className="lg:col-span-7">
                        <div className="bg-white dark:bg-ink-800 rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 dark:border-ink-700">
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Delivery Details</h2>
                            
                            {/* Honeypot field - Hidden from users, catches bots */}
                            <input 
                                type="text" 
                                name="honeypot" 
                                value={data.honeypot} 
                                onChange={e => setData('honeypot', e.target.value)} 
                                style={{ display: 'none' }} 
                                tabIndex="-1" 
                                autoComplete="off" 
                            />

                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="customer_name" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                                    <input
                                        type="text"
                                        id="customer_name"
                                        required
                                        value={data.customer_name}
                                        onChange={e => setData('customer_name', e.target.value)}
                                        className="mt-2 block w-full border-slate-300 dark:border-ink-600 dark:bg-ink-900 dark:text-white rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-3 px-4"
                                    />
                                    {errors.customer_name && <p className="mt-1 text-sm text-rose-500">{errors.customer_name}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="customer_phone" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                                        <input
                                            type="tel"
                                            id="customer_phone"
                                            required
                                            placeholder="03XX XXXXXXX"
                                            value={data.customer_phone}
                                            onChange={e => setData('customer_phone', e.target.value)}
                                            className="mt-2 block w-full border-slate-300 dark:border-ink-600 dark:bg-ink-900 dark:text-white rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-3 px-4"
                                        />
                                        {errors.customer_phone && <p className="mt-1 text-sm text-rose-500">{errors.customer_phone}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="customer_city" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">City</label>
                                        <input
                                            type="text"
                                            id="customer_city"
                                            required
                                            value={data.customer_city}
                                            onChange={e => setData('customer_city', e.target.value)}
                                            className="mt-2 block w-full border-slate-300 dark:border-ink-600 dark:bg-ink-900 dark:text-white rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-3 px-4"
                                        />
                                        {errors.customer_city && <p className="mt-1 text-sm text-rose-500">{errors.customer_city}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="customer_address" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Full Delivery Address</label>
                                    <textarea
                                        id="customer_address"
                                        required
                                        rows={3}
                                        value={data.customer_address}
                                        onChange={e => setData('customer_address', e.target.value)}
                                        className="mt-2 block w-full border-slate-300 dark:border-ink-600 dark:bg-ink-900 dark:text-white rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-3 px-4"
                                    ></textarea>
                                    {errors.customer_address && <p className="mt-1 text-sm text-rose-500">{errors.customer_address}</p>}
                                </div>
                            </div>
                        </div>

                        {/* Security Badges */}
                        <div className="mt-6 flex justify-center space-x-6 text-sm text-slate-500 dark:text-slate-400">
                            <span className="flex items-center"><ShieldCheck className="w-5 h-5 mr-1.5 text-blue-500" /> Secure Checkout</span>
                            <span className="flex items-center"><Truck className="w-5 h-5 mr-1.5 text-blue-500" /> Fast Delivery</span>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="bg-white dark:bg-ink-800 rounded-3xl shadow-sm border border-slate-100 dark:border-ink-700 p-6 sm:p-8 sticky top-24">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Order Summary</h2>
                            
                            {/* Items list */}
                            <ul role="list" className="divide-y divide-slate-100 dark:divide-ink-700 mb-6 border-b border-slate-100 dark:border-ink-700 pb-6">
                                {cart.map((item, index) => (
                                    <li key={index} className="py-3 flex justify-between">
                                        <div className="flex items-center">
                                            <span className="font-semibold text-slate-900 dark:text-white mr-3 bg-slate-100 dark:bg-ink-700 w-6 h-6 flex items-center justify-center rounded-full text-xs">
                                                {item.quantity}
                                            </span>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{item.product.name}</p>
                                                {item.variant && <p className="text-xs text-slate-500 dark:text-slate-400">{item.variant.name}</p>}
                                            </div>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white ml-4">
                                            Rs {((item.variant ? parseFloat(item.variant.price) : parseFloat(item.product.price)) * item.quantity).toLocaleString()}
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            {/* Totals */}
                            <dl className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
                                <div className="flex justify-between">
                                    <dt>Subtotal</dt>
                                    <dd className="font-semibold text-slate-900 dark:text-white">Rs {data.subtotal.toLocaleString()}</dd>
                                </div>
                                <div className="flex justify-between">
                                    <dt>Shipping Fee</dt>
                                    <dd className="font-semibold text-slate-900 dark:text-white">Rs {shippingFee.toLocaleString()}</dd>
                                </div>
                                <div className="border-t border-slate-200 dark:border-ink-700 pt-4 flex justify-between items-center">
                                    <dt className="text-lg font-bold text-slate-900 dark:text-white">Total</dt>
                                    <dd className="text-2xl font-black text-blue-600 dark:text-blue-400">Rs {data.total.toLocaleString()}</dd>
                                </div>
                            </dl>

                            {/* COD Confirmation */}
                            <div className="mt-8 bg-blue-50 dark:bg-ink-900 rounded-xl p-4 border border-blue-100 dark:border-ink-700">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="confirm_cod"
                                            name="confirm_cod"
                                            type="checkbox"
                                            checked={data.confirm_cod}
                                            onChange={e => setData('confirm_cod', e.target.checked)}
                                            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="confirm_cod" className="font-bold text-slate-900 dark:text-white cursor-pointer">
                                            Confirm Cash on Delivery
                                        </label>
                                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                                            I agree to pay <strong className="text-slate-900 dark:text-white">Rs {data.total.toLocaleString()}</strong> in cash upon delivery of my order.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full flex items-center justify-center px-4 py-4 mt-6 border border-transparent rounded-xl shadow-lg text-lg font-bold text-white transition-all ${
                                    processing ? 'bg-blue-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30'
                                }`}
                            >
                                {processing ? 'Processing...' : 'Place Order Now'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </PublicLayout>
    );
}
