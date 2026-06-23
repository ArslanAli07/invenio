import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import InputError from '@/Components/InputError';
import {
    ArrowLeft,
    ClipboardList,
    Building2,
    MapPin,
    Calendar,
    User,
    Send,
    PackageCheck,
    X,
    Edit3,
    XCircle,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Package,
    Truck,
    FileText,
    ChevronRight,
} from 'lucide-react';

// ── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    draft: {
        label: 'Draft',
        icon:  FileText,
        dot:   'bg-slate-400',
        badge: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600',
        desc:  'This order has not been sent to the supplier yet.',
    },
    sent: {
        label: 'Sent',
        icon:  Send,
        dot:   'bg-blue-500',
        badge: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600',
        desc:  'Order has been sent. Waiting for delivery.',
    },
    partially_received: {
        label: 'Partially Received',
        icon:  Truck,
        dot:   'bg-amber-500',
        badge: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
        desc:  'Some items received. Outstanding items still expected.',
    },
    received: {
        label: 'Fully Received',
        icon:  CheckCircle2,
        dot:   'bg-emerald-500',
        badge: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
        desc:  'All items received. Order complete.',
    },
    cancelled: {
        label: 'Cancelled',
        icon:  XCircle,
        dot:   'bg-rose-400',
        badge: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        desc:  'This order was cancelled. No stock reversals applied.',
    },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt   = (n) => 'Rs ' + parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtQty = (n) => parseFloat(n || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

function StatusBadge({ status, large = false }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 border rounded-full font-semibold ${large ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs'} ${cfg.badge}`}>
            <Icon className={large ? 'h-4 w-4' : 'h-3.5 w-3.5'} />
            {cfg.label}
        </span>
    );
}

// ── Progress bar (receipt progress per item) ─────────────────────────────────
function ProgressBar({ received, ordered }) {
    const pct = ordered > 0 ? Math.min(100, (received / ordered) * 100) : 0;
    const full = pct >= 100;
    return (
        <div className="flex items-center gap-2 min-w-[80px]">
            <div className="flex-1 h-1.5 bg-slate-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${full ? 'bg-emerald-500' : 'bg-blue-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className={`text-[10px] font-bold tabular-nums whitespace-nowrap ${full ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                {Math.round(pct)}%
            </span>
        </div>
    );
}

// ── Receive Items Modal ──────────────────────────────────────────────────────
function ReceiveModal({ purchaseOrder, onClose }) {
    // Only items with outstanding qty
    const outstanding = purchaseOrder.items.filter(
        (i) => parseFloat(i.qty_ordered) > parseFloat(i.qty_received)
    );

    const { data, setData, post, processing, errors } = useForm({
        items: outstanding.map((i) => ({
            item_id:      i.id,
            qty_received: String(parseFloat(i.qty_ordered) - parseFloat(i.qty_received)),
        })),
    });

    const updateQty = (idx, val) => {
        const updated = data.items.map((row, i) =>
            i === idx ? { ...row, qty_received: val } : row
        );
        setData('items', updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('po.receive', purchaseOrder.id), {
            onSuccess: onClose,
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50"
                onClick={onClose}
            />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-2xl dark: w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in-0 zoom-in-95 duration-200">

                    {/* Modal header */}
                    <div className="flex items-start justify-between px-6 py-5 border-b border-zinc-100 dark:border-zinc-700">
                        <div>
                            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <PackageCheck className="h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400" />
                                Record Received Items
                            </h2>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                <span className="font-mono font-semibold text-[#6b7c5c] dark:text-[#8fa67a]">{purchaseOrder.po_number}</span>
                                {' — '}{purchaseOrder.location?.name}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-ink-100 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Modal body */}
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 min-h-0">
                            {outstanding.length === 0 ? (
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center py-8">
                                    All items have been fully received.
                                </p>
                            ) : (
                                outstanding.map((item, idx) => {
                                    const remainingQty = parseFloat(item.qty_ordered) - parseFloat(item.qty_received);
                                    return (
                                        <div
                                            key={item.id}
                                            className="bg-slate-50 dark:bg-zinc-700/50 rounded-xl border border-zinc-200 dark:border-zinc-700 p-4"
                                        >
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div>
                                                    <span className="font-mono text-[11px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-600">
                                                        {item.product?.sku}
                                                    </span>
                                                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 mt-1.5">
                                                        {item.product?.name}
                                                    </p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                                        Outstanding:{' '}
                                                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                                                            {fmtQty(remainingQty)} {item.product?.unit}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="w-28 shrink-0">
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1">
                                                        Qty to Receive
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={remainingQty}
                                                        step="any"
                                                        value={data.items[idx]?.qty_received ?? ''}
                                                        onChange={(e) => updateQty(idx, e.target.value)}
                                                        className="block w-full bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 tabular-nums"
                                                    />
                                                </div>
                                            </div>

                                            {/* Progress so far */}
                                            <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                                <span>Already received:</span>
                                                <span className="font-semibold text-zinc-700 dark:text-zinc-200">
                                                    {fmtQty(item.qty_received)} / {fmtQty(item.qty_ordered)} {item.product?.unit}
                                                </span>
                                                <div className="flex-1">
                                                    <ProgressBar received={parseFloat(item.qty_received)} ordered={parseFloat(item.qty_ordered)} />
                                                </div>
                                            </div>

                                            {errors[`items.${idx}.qty_received`] && (
                                                <p className="mt-2 text-xs text-rose-500 font-medium">
                                                    {errors[`items.${idx}.qty_received`]}
                                                </p>
                                            )}
                                            {errors[`items.${idx}.item_id`] && (
                                                <p className="mt-2 text-xs text-rose-500 font-medium">
                                                    {errors[`items.${idx}.item_id`]}
                                                </p>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal footer */}
                        <div className="px-6 py-4 border-t border-zinc-100 dark:border-zinc-700 flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 rounded-xl py-5 dark:border-zinc-700 dark:text-zinc-200 font-semibold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing || outstanding.length === 0}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl py-5 flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all"
                            >
                                {processing ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <>
                                        <PackageCheck className="h-4 w-4" />
                                        Confirm Receipt
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Show({ purchaseOrder, can }) {
    const [receiveOpen, setReceiveOpen] = useState(false);

    const status = STATUS_CONFIG[purchaseOrder.status] ?? STATUS_CONFIG.draft;

    // Grand totals
    const grandTotal = purchaseOrder.items.reduce(
        (sum, i) => sum + parseFloat(i.qty_ordered) * parseFloat(i.unit_cost),
        0
    );

    // Send action
    const handleSend = () => {
        if (!confirm(`Send ${purchaseOrder.po_number} to ${purchaseOrder.supplier?.name}? An email will be queued to their address.`)) return;
        router.post(route('po.send', purchaseOrder.id));
    };

    // Cancel action
    const handleCancel = () => {
        if (!confirm(`Cancel ${purchaseOrder.po_number}? This cannot be undone. Any stock already received will NOT be reversed.`)) return;
        router.post(route('po.cancel', purchaseOrder.id));
    };

    // Delete action
    const handleDelete = () => {
        if (!confirm(`Permanently delete ${purchaseOrder.po_number}? This action cannot be undone.`)) return;
        router.delete(route('po.destroy', purchaseOrder.id));
    };

    const isReceivable = ['sent', 'partially_received'].includes(purchaseOrder.status);

    return (
        <AuthenticatedLayout>
            <Head title={purchaseOrder.po_number} />

            {/* ── Back link ───────────────────────────────────────────────── */}
            <div className="mb-6">
                <Link
                    href={route('po.index')}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-ink-100 transition-colors font-medium mb-3"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Purchase Orders
                </Link>

                {/* Title row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-zinc-100 dark:bg-zinc-700 rounded-md border border-zinc-200 dark:border-zinc-600">
                            <ClipboardList className="h-5 w-5 text-[#6b7c5c] dark:text-[#8fa67a]" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="font-mono text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                                    {purchaseOrder.po_number}
                                </h1>
                                <StatusBadge status={purchaseOrder.status} large />
                            </div>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                                {status.desc}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons — context-sensitive per status */}
                    <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
                        {can.edit && (
                            <Link href={route('po.edit', purchaseOrder.id)}>
                                <Button variant="outline" size="sm"
                                    className="rounded-xl gap-1.5 dark:border-zinc-700 dark:text-zinc-200 font-semibold">
                                    <Edit3 className="h-3.5 w-3.5" />
                                    Edit Draft
                                </Button>
                            </Link>
                        )}
                        {can.send && (
                            <Button
                                size="sm"
                                onClick={handleSend}
                                className="rounded-xl gap-1.5 bg-blue-600 hover:bg-[#5a6b4c] text-white font-semibold shadow-md "
                            >
                                <Send className="h-3.5 w-3.5" />
                                Send to Supplier
                            </Button>
                        )}
                        {can.receive && (
                            <Button
                                size="sm"
                                onClick={() => setReceiveOpen(true)}
                                className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-500/20"
                            >
                                <PackageCheck className="h-3.5 w-3.5" />
                                {purchaseOrder.status === 'partially_received' ? 'Receive More' : 'Receive Items'}
                            </Button>
                        )}
                        {can.cancel && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleCancel}
                                className="rounded-xl gap-1.5 border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-semibold"
                            >
                                <XCircle className="h-3.5 w-3.5" />
                                Cancel Order
                            </Button>
                        )}
                        {can.delete && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDelete}
                                className="rounded-xl gap-1.5 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-semibold"
                            >
                                Delete
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Meta cards row ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

                {/* Supplier */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
                        Supplier
                    </span>
                    <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                            {purchaseOrder.supplier?.name || '—'}
                        </span>
                    </div>
                    {purchaseOrder.supplier?.email && (
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 truncate">
                            {purchaseOrder.supplier.email}
                        </p>
                    )}
                </div>

                {/* Location */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
                        Receiving Location
                    </span>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                        <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                            {purchaseOrder.location?.name || '—'}
                        </span>
                    </div>
                    {purchaseOrder.location?.code && (
                        <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500 mt-1 block uppercase">
                            {purchaseOrder.location.code}
                        </span>
                    )}
                </div>

                {/* Dates */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
                        Dates
                    </span>
                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs">
                            <Calendar className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                            <span className="text-zinc-500 dark:text-zinc-400">Created:</span>
                            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{fmtDate(purchaseOrder.created_at)}</span>
                        </div>
                        {purchaseOrder.sent_at && (
                            <div className="flex items-center gap-2 text-xs">
                                <Send className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                <span className="text-zinc-500 dark:text-zinc-400">Sent:</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-200">{fmtDate(purchaseOrder.sent_at)}</span>
                            </div>
                        )}
                        {purchaseOrder.expected_at && (
                            <div className="flex items-center gap-2 text-xs">
                                <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                <span className="text-zinc-500 dark:text-zinc-400">Expected:</span>
                                <span className="font-semibold text-zinc-700 dark:text-zinc-200">{fmtDate(purchaseOrder.expected_at)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Created by */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 shadow-sm">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block mb-1.5">
                        Created By
                    </span>
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-full from-[#1B4FD8] to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-inner uppercase shrink-0">
                            {purchaseOrder.created_by?.name?.charAt(0) || '?'}
                        </div>
                        <div>
                            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 block">
                                {purchaseOrder.created_by?.name || '—'}
                            </span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 capitalize">
                                {purchaseOrder.created_by?.role || ''}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Notes (if any) ───────────────────────────────────────────── */}
            {purchaseOrder.notes && (
                <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-lg px-5 py-4 mb-6 flex gap-3">
                    <AlertTriangle className="h-4 w-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-0.5">Order Notes</p>
                        <p className="text-sm text-amber-800 dark:text-amber-300">{purchaseOrder.notes}</p>
                    </div>
                </div>
            )}

            {/* ── Items table ──────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Package className="h-4 w-4 text-[#6b7c5c]" />
                        Line Items
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300">
                            {purchaseOrder.items.length}
                        </span>
                    </h2>
                    {isReceivable && can.receive && (
                        <button
                            onClick={() => setReceiveOpen(true)}
                            className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 hover:underline"
                        >
                            <PackageCheck className="h-3.5 w-3.5" />
                            Record receipt
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                        <thead>
                            <tr className="border-b border-zinc-100 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-700">
                                <th className="px-6 py-3">SKU</th>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3 text-right">Qty Ordered</th>
                                <th className="px-6 py-3 text-right">Qty Received</th>
                                <th className="px-6 py-3 text-right">Outstanding</th>
                                <th className="px-6 py-3 text-right">Unit Cost</th>
                                <th className="px-6 py-3 text-right">Line Total</th>
                                <th className="px-6 py-3">Progress</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                            {purchaseOrder.items.map((item) => {
                                const ordered    = parseFloat(item.qty_ordered);
                                const received   = parseFloat(item.qty_received);
                                const outstanding = ordered - received;
                                const fullFill   = outstanding <= 0;

                                return (
                                    <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-700/30 transition-colors">
                                        {/* SKU */}
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('products.show', item.product?.id)}
                                                className="font-mono text-[11px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-600 whitespace-nowrap hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                                            >
                                                {item.product?.sku}
                                            </Link>
                                        </td>

                                        {/* Product name */}
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('products.show', item.product?.id)}
                                                className="group"
                                            >
                                                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                                    {item.product?.name}
                                                </span>
                                                {item.variant && (
                                                    <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                                                        {item.variant.name}
                                                    </span>
                                                )}
                                                <span className="block text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5 uppercase font-semibold">
                                                    {item.product?.unit}
                                                </span>
                                            </Link>
                                        </td>

                                        {/* Qty ordered */}
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 tabular-nums">
                                                {fmtQty(ordered)}
                                            </span>
                                        </td>

                                        {/* Qty received */}
                                        <td className="px-6 py-4 text-right">
                                            <span className={`text-sm font-semibold tabular-nums ${received > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-ink-600'}`}>
                                                {fmtQty(received)}
                                            </span>
                                        </td>

                                        {/* Outstanding */}
                                        <td className="px-6 py-4 text-right">
                                            {fullFill ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                                    Done
                                                </span>
                                            ) : (
                                                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400 tabular-nums">
                                                    {fmtQty(outstanding)}
                                                </span>
                                            )}
                                        </td>

                                        {/* Unit cost */}
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm text-zinc-600 dark:text-zinc-300 tabular-nums">
                                                {fmt(item.unit_cost)}
                                            </span>
                                        </td>

                                        {/* Line total */}
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100 tabular-nums">
                                                {fmt(ordered * parseFloat(item.unit_cost))}
                                            </span>
                                        </td>

                                        {/* Progress bar */}
                                        <td className="px-6 py-4 min-w-[120px]">
                                            <ProgressBar received={received} ordered={ordered} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>

                        {/* Grand total footer row */}
                        <tfoot>
                            <tr className="border-t-2 border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700">
                                <td colSpan="6" className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                    Grand Total
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <span className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 tabular-nums">
                                        {fmt(grandTotal)}
                                    </span>
                                </td>
                                <td className="px-6 py-4" />
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            {/* ── Receive Items Modal ──────────────────────────────────────── */}
            {receiveOpen && (
                <ReceiveModal
                    purchaseOrder={purchaseOrder}
                    onClose={() => setReceiveOpen(false)}
                />
            )}
        </AuthenticatedLayout>
    );
}
