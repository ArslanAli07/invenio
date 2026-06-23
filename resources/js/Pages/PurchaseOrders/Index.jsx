import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import {
    ClipboardList,
    Plus,
    Search,
    Eye,
    ChevronLeft,
    ChevronRight,
    Building2,
    MapPin,
    Package,
} from 'lucide-react';

// ── Status badge config (PRD §3.3) ──────────────────────────────────────────
const STATUS_CONFIG = {
    draft: {
        label: 'Draft',
        dot:   'bg-slate-400',
        class: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600',
    },
    sent: {
        label: 'Sent',
        dot:   'bg-blue-500',
        class: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600',
    },
    partially_received: {
        label: 'Partial',
        dot:   'bg-amber-500',
        class: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
    },
    received: {
        label: 'Received',
        dot:   'bg-emerald-500',
        class: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    },
    cancelled: {
        label: 'Cancelled',
        dot:   'bg-rose-400',
        class: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
    },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${cfg.class}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

export default function Index({ purchaseOrders, suppliers, filters, can }) {
    const [search, setSearch]     = useState(filters.search || '');
    const [status, setStatus]     = useState(filters.status || '');
    const [supplierId, setSupplierId] = useState(filters.supplier_id || '');

    const { auth } = usePage().props;
    const isSupplierRole = auth.user.role === 'supplier';

    const applyFilters = (newSearch, newStatus, newSupplier) => {
        router.get(
            route('po.index'),
            {
                search:      newSearch      || undefined,
                status:      newStatus      || undefined,
                supplier_id: newSupplier    || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        applyFilters(val, status, supplierId);
    };

    const handleStatus = (e) => {
        const val = e.target.value;
        setStatus(val);
        applyFilters(search, val, supplierId);
    };

    const handleSupplier = (e) => {
        const val = e.target.value;
        setSupplierId(val);
        applyFilters(search, status, val);
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setSupplierId('');
        router.get(route('po.index'), {}, { preserveState: true, replace: true });
    };

    const hasFilters = search || status || supplierId;

    return (
        <AuthenticatedLayout>
            <Head title="Purchase Orders" />

            {/* Page header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Purchase Orders</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Track incoming stock orders from draft through to full receipt.
                    </p>
                </div>
                {can.create && (
                    <Link href={route('po.create')}>
                        <Button className="bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto">
                            <Plus className="h-4.5 w-4.5" />
                            <span>New Purchase Order</span>
                        </Button>
                    </Link>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search by PO number…"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400/30 placeholder-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                        {/* Status */}
                        <select
                            value={status}
                            onChange={handleStatus}
                            className="w-full md:w-44 px-3 py-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
                        >
                            <option value="">All Statuses</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="partially_received">Partially Received</option>
                            <option value="received">Received</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Supplier */}
                        {!isSupplierRole && (
                            <select
                                value={supplierId}
                                onChange={handleSupplier}
                                className="w-full md:w-48 px-3 py-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
                            >
                                <option value="">All Suppliers</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        )}

                        {/* Clear */}
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-ink-100 font-semibold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap"
                            >
                                × Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/75 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                <th className="px-6 py-4">PO Number</th>
                                <th className="px-6 py-4">Supplier</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Expected</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Created By</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                            {purchaseOrders.data.length > 0 ? (
                                purchaseOrders.data.map((po) => (
                                    <tr key={po.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/40 transition-colors">
                                        {/* PO Number */}
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('po.show', po.id)}
                                                className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-600 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors whitespace-nowrap"
                                            >
                                                {po.po_number}
                                            </Link>
                                        </td>

                                        {/* Supplier */}
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                                <Building2 className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                                {po.supplier?.name || '—'}
                                            </span>
                                        </td>

                                        {/* Location */}
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400">
                                                <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                                {po.location?.name || '—'}
                                                {po.location?.code && (
                                                    <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500 uppercase">({po.location.code})</span>
                                                )}
                                            </span>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={po.status} />
                                        </td>

                                        {/* Expected date */}
                                        <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                            {po.expected_at
                                                ? new Date(po.expected_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
                                                : <span className="italic text-slate-400 dark:text-ink-600">—</span>
                                            }
                                        </td>

                                        {/* Item count */}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-700 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-zinc-700">
                                                <Package className="h-3 w-3" />
                                                {po.items?.length ?? 0}
                                            </span>
                                        </td>

                                        {/* Created by */}
                                        <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                            {po.created_by?.name || '—'}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <Link href={route('po.show', po.id)}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1.5 rounded-xl text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 text-[#6b7c5c] dark:text-[#8fa67a] hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="p-4 bg-zinc-100 dark:bg-zinc-700 rounded-lg text-zinc-400 dark:text-zinc-500 mb-4">
                                                <ClipboardList className="h-10 w-10" />
                                            </div>
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No purchase orders found</h3>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 text-center leading-relaxed">
                                                {hasFilters
                                                    ? 'Try clearing your filters to see all orders.'
                                                    : 'Create your first purchase order to start tracking incoming stock.'
                                                }
                                            </p>
                                            {can.create && !hasFilters && (
                                                <Link href={route('po.create')} className="mt-4">
                                                    <Button className="bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-xl text-sm gap-2">
                                                        <Plus className="h-4 w-4" />
                                                        New Purchase Order
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {purchaseOrders.links && purchaseOrders.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between bg-zinc-50 dark:bg-zinc-700">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{purchaseOrders.from}</span> to{' '}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{purchaseOrders.to}</span> of{' '}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{purchaseOrders.total}</span> orders
                        </span>
                        <div className="flex gap-1.5">
                            {purchaseOrders.links.map((link, idx) => {
                                if (link.url === null) return null;
                                if (link.label.includes('Previous')) {
                                    return (
                                        <Button key={idx} variant="outline" size="sm"
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                            <ChevronLeft className="h-4 w-4" /><span>Previous</span>
                                        </Button>
                                    );
                                }
                                if (link.label.includes('Next')) {
                                    return (
                                        <Button key={idx} variant="outline" size="sm"
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                            <span>Next</span><ChevronRight className="h-4 w-4" />
                                        </Button>
                                    );
                                }
                                return (
                                    <Button key={idx}
                                        variant={link.active ? 'default' : 'outline'} size="sm"
                                        className={`rounded-xl h-9 w-9 p-0 ${link.active ? 'bg-[#6b7c5c] text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200'}`}
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                        {link.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
