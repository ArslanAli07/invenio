import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    User,
    MapPin,
    Phone,
    Package,
    Truck,
    Clock,
    Ban,
    Printer
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/Components/ui/dialog';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function Show({ order, can }) {
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancellationReason, setCancellationReason] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const handleUpdateStatus = (newStatus) => {
        setIsUpdatingStatus(true);
        router.patch(route('orders.update-status', order.id), {
            status: newStatus,
        }, {
            preserveScroll: true,
            onFinish: () => setIsUpdatingStatus(false),
        });
    };

    const handleCancelOrder = () => {
        if (!cancellationReason.trim()) return;
        setIsCancelling(true);
        router.post(route('orders.cancel', order.id), {
            cancellation_reason: cancellationReason,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                setIsCancelModalOpen(false);
                setCancellationReason('');
            },
            onFinish: () => setIsCancelling(false),
        });
    };

    // Helper for status progression button
    const getNextStatus = () => {
        if (order.status === 'cancelled') return null;
        const currentIndex = STATUS_STEPS.indexOf(order.status);
        if (currentIndex >= 0 && currentIndex < STATUS_STEPS.length - 1) {
            return STATUS_STEPS[currentIndex + 1];
        }
        return null;
    };

    const nextStatus = getNextStatus();

    return (
        <AuthenticatedLayout>
            <Head title={`Order ${order.order_number}`} />

            {/* Back button */}
            <Link
                href={route('orders.index')}
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-ink-100 transition-colors mb-6 font-medium"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Orders
            </Link>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            {order.order_number}
                        </h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400' :
                            order.status === 'cancelled' ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400' :
                            'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                        }`}>
                            {order.status}
                        </span>
                    </div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Placed on {new Date(order.created_at).toLocaleString()}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {can.cancel && (
                        <Button
                            variant="destructive"
                            onClick={() => setIsCancelModalOpen(true)}
                            className="gap-2"
                        >
                            <Ban className="h-4 w-4" />
                            Cancel Order
                        </Button>
                    )}

                    <a
                        href={route('orders.invoice', order.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                    >
                        <Printer className="h-4 w-4" />
                        Print Invoice
                    </a>

                    {can.update && nextStatus && (
                        <Button
                            onClick={() => handleUpdateStatus(nextStatus)}
                            disabled={isUpdatingStatus}
                            className="gap-2 bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark as {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                        </Button>
                    )}
                </div>
            </div>

            {/* Cancellation Notice */}
            {order.status === 'cancelled' && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20 flex gap-3 items-start">
                    <XCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300">Order Cancelled</h3>
                        <p className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                            {order.cancellation_reason}
                        </p>
                        <p className="text-xs text-rose-500 dark:text-rose-500 mt-2 font-medium">
                            Cancelled by {order.cancelled_by?.name || 'Unknown'} on {new Date(order.cancelled_at).toLocaleString()}. Stock has been returned to the fulfilling location.
                        </p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Items */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items Card */}
                    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-700/50">
                            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <Package className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                                Order Items
                            </h2>
                            <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                                {order.items.reduce((acc, item) => acc + item.quantity, 0)} Units
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/75 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        <th className="px-6 py-3">Product</th>
                                        <th className="px-6 py-3 text-right">Price</th>
                                        <th className="px-6 py-3 text-right">Qty</th>
                                        <th className="px-6 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                    {order.items.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/25 dark:hover:bg-zinc-700/25">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                                                        {item.product?.name}
                                                    </span>
                                                    {item.variant && (
                                                        <span className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                            {item.variant.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-zinc-600 dark:text-zinc-300 font-mono">
                                                Rs. {parseFloat(item.unit_price).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-zinc-600 dark:text-zinc-300 font-mono">
                                                {item.quantity}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                                                Rs. {parseFloat(item.unit_price * item.quantity).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4">Payment Summary</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                                <span>Subtotal</span>
                                <span className="font-mono">Rs. {parseFloat(order.subtotal).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-zinc-600 dark:text-zinc-300">
                                <span>Shipping Fee</span>
                                <span className="font-mono">Rs. {parseFloat(order.shipping_fee).toLocaleString()}</span>
                            </div>
                            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-700 flex justify-between text-base font-bold text-zinc-900 dark:text-zinc-100">
                                <span>Total to Collect (COD)</span>
                                <span className="font-mono text-[#6b7c5c] dark:text-[#8fa67a]">Rs. {parseFloat(order.total).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Customer Info & Meta */}
                <div className="space-y-6">
                    {/* Customer Details */}
                    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <User className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                            Customer Details
                        </h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Name</label>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">{order.customer_name}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                                    <Phone className="h-3 w-3" /> Phone
                                </label>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">{order.customer_phone}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">City</label>
                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1">{order.customer_city}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Delivery Address</label>
                                <p className="text-sm text-slate-700 dark:text-zinc-300 mt-1 leading-relaxed whitespace-pre-wrap">{order.customer_address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Fulfilling Location */}
                    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm p-6">
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                            Fulfillment
                        </h2>
                        {order.fulfilling_location ? (
                            <div>
                                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{order.fulfilling_location.name}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Code: {order.fulfilling_location.code}</p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 flex items-center gap-1">
                                    <Truck className="h-3 w-3" />
                                    Stock deducted from this location
                                </p>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 italic">No fulfilling location assigned.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
                <DialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-900 dark:text-zinc-100">Cancel Order</DialogTitle>
                        <DialogDescription className="text-zinc-500 dark:text-zinc-400">
                            This will reverse the stock deduction and mark the order as cancelled. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-zinc-300 mb-1">
                            Reason for Cancellation <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            value={cancellationReason}
                            onChange={(e) => setCancellationReason(e.target.value)}
                            placeholder="e.g. Customer requested cancellation, out of stock, fake order..."
                            className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500/30 min-h-[100px]"
                        />
                    </div>

                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsCancelModalOpen(false)}
                            className="bg-white dark:bg-zinc-700 border-zinc-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700"
                        >
                            Nevermind
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleCancelOrder}
                            disabled={!cancellationReason.trim() || isCancelling}
                            className="gap-2"
                        >
                            {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </AuthenticatedLayout>
    );
}
