import { Head } from '@inertiajs/react';
import { useEffect } from 'react';

export default function Invoice({ order }) {
    // Automatically open print dialog when component mounts
    useEffect(() => {
        // slight delay to ensure fonts/styles are loaded
        const timer = setTimeout(() => {
            window.print();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    const calculateSubtotal = () => {
        return order.items.reduce((sum, item) => sum + (parseFloat(item.unit_price) * item.quantity), 0);
    };

    const subtotal = calculateSubtotal();

    return (
        <div className="min-h-screen bg-white">
            <Head title={`Invoice - ${order.order_number}`} />

            {/* Print Area Container */}
            <div className="max-w-4xl mx-auto p-8 sm:p-12 text-slate-900 bg-white">
                
                {/* Header Section */}
                <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">I</span>
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">INVENIO</h1>
                        </div>
                        <p className="text-slate-500 text-sm">
                            123 Tech Avenue, Silicon Valley<br />
                            San Francisco, CA 94107<br />
                            contact@invenio.store<br />
                            +1 (555) 123-4567
                        </p>
                    </div>
                    <div className="text-right">
                        <h2 className="text-4xl font-light text-slate-400 mb-4 uppercase tracking-widest">Invoice</h2>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                            <span className="font-semibold text-slate-900">Invoice No:</span>
                            <span>{order.order_number}</span>
                            <span className="font-semibold text-slate-900">Date:</span>
                            <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            <span className="font-semibold text-slate-900">Status:</span>
                            <span className="capitalize font-medium text-emerald-600">{order.status}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Info Section */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Bill To</h3>
                        <p className="font-semibold text-slate-900 mb-1">{order.customer_name}</p>
                        <p className="text-slate-600 text-sm">{order.customer_email}</p>
                        <p className="text-slate-600 text-sm">{order.customer_phone}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Ship To</h3>
                        <p className="font-semibold text-slate-900 mb-1">{order.customer_name}</p>
                        <p className="text-slate-600 text-sm whitespace-pre-line">{order.shipping_address}</p>
                    </div>
                </div>

                {/* Order Items Table */}
                <div className="mb-8">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b-2 border-slate-900">
                                <th className="py-3 px-2 font-bold text-sm uppercase tracking-wider text-slate-900 w-1/2">Item Description</th>
                                <th className="py-3 px-2 font-bold text-sm uppercase tracking-wider text-slate-900 text-center">Qty</th>
                                <th className="py-3 px-2 font-bold text-sm uppercase tracking-wider text-slate-900 text-right">Price</th>
                                <th className="py-3 px-2 font-bold text-sm uppercase tracking-wider text-slate-900 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {order.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 px-2">
                                        <p className="font-semibold text-slate-900">{item.product_name}</p>
                                        {item.variant_name && (
                                            <p className="text-xs text-slate-500 mt-1">Variant: {item.variant_name}</p>
                                        )}
                                    </td>
                                    <td className="py-4 px-2 text-center text-slate-700">{item.quantity}</td>
                                    <td className="py-4 px-2 text-right text-slate-700">Rs {parseFloat(item.unit_price).toLocaleString()}</td>
                                    <td className="py-4 px-2 text-right font-medium text-slate-900">
                                        Rs {(parseFloat(item.unit_price) * item.quantity).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals Section */}
                <div className="flex justify-end mb-16">
                    <div className="w-1/2 sm:w-1/3">
                        <div className="flex justify-between py-2 border-b border-slate-200 text-sm">
                            <span className="text-slate-600">Subtotal</span>
                            <span className="font-medium">Rs {subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-slate-200 text-sm">
                            <span className="text-slate-600">Shipping</span>
                            <span className="font-medium">Rs {parseFloat(order.total_amount) > subtotal ? (parseFloat(order.total_amount) - subtotal).toLocaleString() : '0'}</span>
                        </div>
                        <div className="flex justify-between py-3 text-lg font-bold">
                            <span className="text-slate-900">Total</span>
                            <span className="text-slate-900">Rs {parseFloat(order.total_amount).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="border-t border-slate-200 pt-8 text-center sm:text-left grid sm:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Payment Notes</h4>
                        <p className="text-xs text-slate-500">
                            Payment is due within 15 days of invoice date. Please include the invoice number on your check.
                        </p>
                    </div>
                    <div className="sm:text-right">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Thank you for your business</h4>
                        <p className="text-xs text-slate-500">
                            If you have any questions concerning this invoice, contact our support at contact@invenio.store.
                        </p>
                    </div>
                </div>
                
                {/* Print action (only visible on screen) */}
                <div className="mt-12 text-center print:hidden">
                    <button 
                        onClick={() => window.print()}
                        className="bg-slate-900 text-white px-6 py-2 rounded-full font-medium hover:bg-slate-800 transition-colors"
                    >
                        Print Invoice Again
                    </button>
                    <p className="text-xs text-slate-400 mt-3">This dialog should open automatically.</p>
                </div>

            </div>
        </div>
    );
}
