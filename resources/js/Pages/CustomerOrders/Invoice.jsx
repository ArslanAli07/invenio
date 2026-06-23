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

    const subtotal = order.items.reduce((sum, item) => {
        return sum + (Number(item.quantity) * Number(item.price || item.unit_price || 0));
    }, 0);

    const shipping = Number(order.shipping_cost || order.shipping_fee || 0);
    const total = subtotal + shipping;

    const getStatusColor = (status) => {
        const s = String(status).toLowerCase();
        if (s === 'cancelled') return 'text-red-600 font-medium text-xs text-right';
        if (s === 'completed') return 'text-emerald-600 font-medium text-xs text-right';
        if (s === 'pending') return 'text-amber-600 font-medium text-xs text-right';
        return 'text-zinc-600 font-medium text-xs text-right';
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-start py-10 px-4 print:py-0 print:px-0">
            <Head title={`Invoice - ${order.order_number}`} />

            <style>{`
                @media print {
                    body { background: white; }
                    .print\\:hidden { display: none !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:border-none { border: none !important; }
                    .print\\:p-8 { padding: 2rem !important; }
                }
            `}</style>

            {/* Invoice Document */}
            <div className="w-full max-w-3xl bg-white border border-zinc-200 rounded-lg shadow-sm p-10 print:shadow-none print:border-none print:rounded-none print:p-8">
                
                {/* SECTION 1: Header */}
                <div className="flex justify-between items-start">
                    
                    {/* LEFT — Company info */}
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="w-9 h-9 rounded-md bg-[#6b7c5c] flex items-center justify-center text-white text-sm font-bold mr-3">I</div>
                            <span className="text-xl font-bold tracking-tight text-zinc-900">Invenio.</span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-3 leading-relaxed">
                            Lahore, Pakistan<br />
                            support@invenio.pk<br />
                            0311-INVENIO
                        </div>
                    </div>

                    {/* RIGHT — Invoice meta */}
                    <div className="text-right">
                        <h2 className="text-3xl font-bold tracking-widest text-zinc-200 text-right uppercase">INVOICE</h2>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-right mt-3">
                            <span className="text-xs text-zinc-400 text-right">Invoice No:</span>
                            <span className="text-xs font-mono text-zinc-600 text-right">{order.order_number}</span>
                            
                            <span className="text-xs text-zinc-400 text-right">Date:</span>
                            <span className="text-xs text-zinc-600 text-right">{new Date(order.created_at).toLocaleDateString()}</span>
                            
                            <span className="text-xs text-zinc-400 text-right">Status:</span>
                            <span className={getStatusColor(order.status)}>{order.status}</span>
                        </div>
                    </div>

                </div>

                {/* Divider below header */}
                <div className="border-t border-zinc-200 my-8"></div>

                {/* SECTION 2: Bill To / Ship To */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">BILL TO</h3>
                        <p className="text-sm font-semibold text-zinc-900">{order.customer_name}</p>
                        <p className="text-sm text-zinc-500 mt-0.5">{order.customer_email}</p>
                        <p className="text-sm text-zinc-500 mt-0.5">{order.customer_phone}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">SHIP TO</h3>
                        <p className="text-sm font-semibold text-zinc-900">{order.customer_name}</p>
                        <p className="text-sm text-zinc-500 mt-0.5 whitespace-pre-line">{order.shipping_address}</p>
                    </div>
                </div>

                {/* SECTION 3: Items table */}
                <table className="w-full mb-8">
                    <thead>
                        <tr className="border-b-2 border-zinc-900">
                            <th className="text-xs font-semibold uppercase tracking-wider text-zinc-900 py-3 text-left w-1/2">ITEM DESCRIPTION</th>
                            <th className="text-xs font-semibold uppercase tracking-wider text-zinc-900 py-3 text-right">QTY</th>
                            <th className="text-xs font-semibold uppercase tracking-wider text-zinc-900 py-3 text-right">UNIT PRICE</th>
                            <th className="text-xs font-semibold uppercase tracking-wider text-zinc-900 py-3 text-right">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                        {order.items.map((item, index) => (
                            <tr key={index} className="border-b border-zinc-100 py-4">
                                <td className="py-4 text-left">
                                    <p className="text-sm font-medium text-zinc-900">
                                        {item.product?.name || item.product_name || item.name || '—'}
                                    </p>
                                    {(item.variant_label || item.variant_name || item.variant?.label) && (
                                        <p className="text-xs text-zinc-400 mt-0.5">
                                            {item.variant_label || item.variant_name || item.variant?.label || ''}
                                        </p>
                                    )}
                                </td>
                                <td className="py-4 text-sm text-zinc-600 text-right">{item.quantity}</td>
                                <td className="py-4 text-sm text-zinc-600 text-right">
                                    Rs {Number(item.price || item.unit_price || 0).toLocaleString()}
                                </td>
                                <td className="py-4 text-sm font-semibold text-zinc-900 text-right">
                                    Rs {(Number(item.quantity) * Number(item.price || item.unit_price || 0)).toLocaleString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* SECTION 4: Totals */}
                <div className="flex flex-col items-end gap-1">
                    <div className="flex justify-between w-64">
                        <span className="text-sm text-zinc-500">Subtotal</span>
                        <span className="text-sm text-zinc-700">Rs {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between w-64">
                        <span className="text-sm text-zinc-500">Shipping</span>
                        <span className="text-sm text-zinc-700">Rs {shipping.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-zinc-200 w-64 my-2"></div>
                    <div className="flex justify-between w-64">
                        <span className="text-base font-bold text-zinc-900">Total</span>
                        <span className="text-base font-bold text-zinc-900">Rs {total.toLocaleString()}</span>
                    </div>
                </div>

                {/* SECTION 5: Footer */}
                <div className="border-t border-zinc-200 mt-10 pt-6">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2">PAYMENT NOTES</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed">
                                Payment is due within 15 days of invoice date. For queries, contact us on WhatsApp at 0311-INVENIO.
                            </p>
                        </div>
                        <div className="text-right">
                            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-2 text-right">THANK YOU FOR YOUR BUSINESS</h4>
                            <p className="text-xs text-zinc-500 leading-relaxed text-right">
                                Thank you for choosing Invenio. For any questions regarding this invoice, reach us at support@invenio.pk.
                            </p>
                        </div>
                    </div>
                </div>

            </div>

            {/* PRINT BUTTON */}
            <button 
                onClick={() => window.print()}
                className="mt-6 bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-md px-6 py-2.5 text-sm font-medium transition-colors print:hidden"
            >
                Print Invoice
            </button>
            <p className="text-xs text-zinc-400 mt-2 print:hidden">This dialog should open automatically.</p>

        </div>
    );
}
