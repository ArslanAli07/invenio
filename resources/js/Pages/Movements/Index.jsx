import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import {
    Activity,
    ArrowDownToLine,
    ArrowUpFromLine,
    SlidersHorizontal,
    Calendar,
    User,
    FileText,
    MapPin,
    Search,
    X,
    ChevronLeft,
    ChevronRight,
    Package,
} from 'lucide-react';

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtQty = (n, type) => {
    const v = parseFloat(n || 0);
    if (type === 'in')     return `+${v}`;
    if (type === 'out')    return `-${v}`;
    return v > 0 ? `+${v}` : `${v}`;
};

const TYPE_CONFIG = {
    in: {
        label:      'Stock In',
        icon:       ArrowDownToLine,
        badge:      'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
        qty:        'text-emerald-600 dark:text-emerald-400',
    },
    out: {
        label:      'Stock Out',
        icon:       ArrowUpFromLine,
        badge:      'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
        qty:        'text-rose-600 dark:text-rose-400',
    },
    adjust: {
        label:      'Adjustment',
        icon:       SlidersHorizontal,
        badge:      'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
        qty:        'text-amber-600 dark:text-amber-400',
    },
};

function TypeBadge({ type }) {
    const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.adjust;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
        </span>
    );
}

// ── Reference cell — blue link for PO refs, grey pill for manual refs ─────────
function RefCell({ movement }) {
    if (!movement.reference_type) {
        return <span className="text-slate-400 dark:text-ink-600 italic">—</span>;
    }
    const isPo      = movement.reference_type.includes('PurchaseOrder');
    const refLabel  = movement.reference_type.includes('\\')
        ? `${movement.reference_type.split('\\').pop()} #${movement.reference_id}`
        : movement.reference_type;

    if (isPo && movement.reference_id) {
        return (
            <Link
                href={route('po.show', movement.reference_id)}
                className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-100/50 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
                <FileText className="h-3 w-3 flex-shrink-0" />
                {refLabel}
            </Link>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-slate-600 dark:text-ink-400 bg-slate-100 dark:bg-ink-800 px-2 py-0.5 rounded border border-slate-200 dark:border-ink-700">
            <FileText className="h-3 w-3 text-slate-400 flex-shrink-0" />
            {refLabel}
        </span>
    );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────
function StatChip({ label, value, color }) {
    const colors = {
        slate:   'bg-slate-100 dark:bg-ink-800 text-slate-700 dark:text-ink-200 border-slate-200 dark:border-ink-700',
        emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
        rose:    'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
        amber:   'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
    };
    return (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-semibold text-sm ${colors[color]}`}>
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-70">{label}</span>
            <span className="text-base font-extrabold tabular-nums">{value.toLocaleString()}</span>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Index({ movements, locations, filters = {}, summary }) {
    const [search, setSearch] = useState(filters.search || '');

    const applyFilter = (key, value) => {
        router.get(
            route('movements.index'),
            { ...filters, [key]: value || undefined },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(
            route('movements.index'),
            { ...filters, search: search || undefined },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const clearAll = () => {
        setSearch('');
        router.get(route('movements.index'), {}, { preserveState: false, replace: true });
    };

    const hasFilters = filters.search || filters.filter_location || filters.filter_type
        || filters.filter_from || filters.filter_to;

    return (
        <AuthenticatedLayout>
            <Head title="Stock Log" />

            {/* ── Page header ───────────────────────────────────────────────── */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className="p-2 bg-violet-50 dark:bg-violet-500/10 rounded-xl border border-violet-100 dark:border-violet-500/20">
                                <Activity className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-ink-100">
                                Global Stock Log
                            </h1>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-ink-400 ml-12">
                            Every stock movement across all products and locations, newest first.
                        </p>
                    </div>

                    {/* Summary chips */}
                    <div className="flex flex-wrap items-center gap-2">
                        <StatChip label="Total"  value={summary.total}  color="slate"   />
                        <StatChip label="In"     value={summary.in}     color="emerald" />
                        <StatChip label="Out"    value={summary.out}    color="rose"    />
                        <StatChip label="Adjust" value={summary.adjust} color="amber"   />
                    </div>
                </div>
            </div>

            {/* ── Filter bar ────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm p-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">

                    {/* Product / SKU search */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-ink-500 pointer-events-none" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search product name or SKU…"
                                className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-ink-800 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 placeholder-slate-400 dark:placeholder-ink-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                            />
                        </div>
                        <Button
                            type="submit"
                            size="sm"
                            className="rounded-xl bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold px-4 shrink-0"
                        >
                            Search
                        </Button>
                    </form>

                    {/* Location */}
                    <select
                        value={filters.filter_location || ''}
                        onChange={(e) => applyFilter('filter_location', e.target.value)}
                        className="text-sm bg-slate-50 dark:bg-ink-800 border border-slate-200 dark:border-ink-700 text-slate-700 dark:text-ink-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                    >
                        <option value="">All Locations</option>
                        {locations.map((l) => (
                            <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                        ))}
                    </select>

                    {/* Type */}
                    <select
                        value={filters.filter_type || ''}
                        onChange={(e) => applyFilter('filter_type', e.target.value)}
                        className="text-sm bg-slate-50 dark:bg-ink-800 border border-slate-200 dark:border-ink-700 text-slate-700 dark:text-ink-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                    >
                        <option value="">All Types</option>
                        <option value="in">Stock In</option>
                        <option value="out">Stock Out</option>
                        <option value="adjust">Adjustment</option>
                    </select>

                    {/* From date */}
                    <input
                        type="date"
                        value={filters.filter_from || ''}
                        onChange={(e) => applyFilter('filter_from', e.target.value)}
                        title="From date"
                        className="text-sm bg-slate-50 dark:bg-ink-800 border border-slate-200 dark:border-ink-700 text-slate-700 dark:text-ink-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                    />

                    {/* To date */}
                    <input
                        type="date"
                        value={filters.filter_to || ''}
                        onChange={(e) => applyFilter('filter_to', e.target.value)}
                        title="To date"
                        className="text-sm bg-slate-50 dark:bg-ink-800 border border-slate-200 dark:border-ink-700 text-slate-700 dark:text-ink-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                    />

                    {/* Clear */}
                    {hasFilters && (
                        <button
                            onClick={clearAll}
                            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-ink-400 hover:text-rose-600 dark:hover:text-rose-400 font-semibold px-3 py-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* ── Table ─────────────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm overflow-hidden flex flex-col">

                {/* Table header meta */}
                <div className="px-6 py-3.5 border-b border-slate-100 dark:border-ink-700 bg-slate-50/50 dark:bg-ink-800/30 flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-ink-400 font-medium">
                        {movements.total > 0
                            ? <>Showing <span className="font-semibold text-slate-700 dark:text-ink-200">{movements.from}–{movements.to}</span> of <span className="font-semibold text-slate-700 dark:text-ink-200">{movements.total.toLocaleString()}</span> entries</>
                            : 'No entries match your filters'}
                    </span>
                    {hasFilters && (
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                            Filtered
                        </span>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/75 dark:bg-ink-800/50 border-b border-slate-200 dark:border-ink-700 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-ink-400">
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4 text-right">Qty</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Reference</th>
                                <th className="px-6 py-4">Notes</th>
                                <th className="px-6 py-4">By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-ink-750">
                            {movements.data.length > 0 ? (
                                movements.data.map((m) => {
                                    const cfg = TYPE_CONFIG[m.type] ?? TYPE_CONFIG.adjust;
                                    return (
                                        <tr key={m.id} className="hover:bg-slate-50/30 dark:hover:bg-ink-800/40 transition-colors group">

                                            {/* Timestamp */}
                                            <td className="px-6 py-3.5 text-xs text-slate-500 dark:text-ink-400 font-medium whitespace-nowrap">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    {new Date(m.created_at).toLocaleString()}
                                                </span>
                                            </td>

                                            {/* Type */}
                                            <td className="px-6 py-3.5">
                                                <TypeBadge type={m.type} />
                                            </td>

                                            {/* Product */}
                                            <td className="px-6 py-3.5">
                                                <Link
                                                    href={route('products.show', m.product?.id)}
                                                    className="group/link"
                                                >
                                                    <span className="block text-sm font-semibold text-slate-800 dark:text-ink-100 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors">
                                                        {m.product?.name ?? '—'}
                                                    </span>
                                                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-100/50 dark:border-blue-500/20 mt-0.5 inline-block">
                                                        {m.product?.sku}
                                                    </span>
                                                </Link>
                                            </td>

                                            {/* Qty */}
                                            <td className="px-6 py-3.5 text-right">
                                                <span className={`font-bold text-sm tabular-nums ${cfg.qty}`}>
                                                    {fmtQty(m.quantity, m.type)}
                                                </span>
                                                <span className="block text-[10px] text-slate-400 dark:text-ink-500 font-semibold uppercase mt-0.5 text-right">
                                                    {m.product?.unit}
                                                </span>
                                            </td>

                                            {/* Location */}
                                            <td className="px-6 py-3.5">
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-ink-300">
                                                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    {m.location?.name ?? '—'}
                                                </span>
                                                {m.location?.code && (
                                                    <span className="font-mono text-[10px] text-slate-400 dark:text-ink-500 uppercase ml-5">
                                                        {m.location.code}
                                                    </span>
                                                )}
                                            </td>

                                            {/* Reference */}
                                            <td className="px-6 py-3.5">
                                                <RefCell movement={m} />
                                            </td>

                                            {/* Notes */}
                                            <td className="px-6 py-3.5 max-w-[180px]">
                                                <span
                                                    className="text-xs text-slate-500 dark:text-ink-400 line-clamp-1"
                                                    title={m.note}
                                                >
                                                    {m.note || <span className="italic text-slate-300 dark:text-ink-600">—</span>}
                                                </span>
                                            </td>

                                            {/* By */}
                                            <td className="px-6 py-3.5">
                                                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-ink-400">
                                                    <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-[#1B4FD8] to-indigo-500 text-white font-bold flex items-center justify-center text-[9px] shrink-0 uppercase">
                                                        {(m.createdBy?.name ?? m.user?.name ?? '?').charAt(0)}
                                                    </div>
                                                    {m.createdBy?.name ?? m.user?.name ?? 'Unknown'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-ink-500">
                                            <Package className="h-10 w-10 opacity-30" />
                                            <p className="text-sm font-semibold">No movements found</p>
                                            <p className="text-xs">
                                                {hasFilters
                                                    ? 'Try adjusting your filters.'
                                                    : 'Stock movements will appear here once recorded.'}
                                            </p>
                                            {hasFilters && (
                                                <button
                                                    onClick={clearAll}
                                                    className="mt-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                                                >
                                                    Clear all filters
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {movements.links && movements.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-ink-700 flex items-center justify-between bg-slate-50/50 dark:bg-ink-800/30 flex-wrap gap-3">
                        <span className="text-xs text-slate-500 dark:text-ink-400">
                            Page <span className="font-semibold text-slate-800 dark:text-ink-200">{movements.current_page}</span> of{' '}
                            <span className="font-semibold text-slate-800 dark:text-ink-200">{movements.last_page}</span>
                        </span>
                        <div className="flex gap-1.5">
                            {movements.links.map((link, idx) => {
                                if (link.url === null) return null;
                                const label = link.label;
                                if (label.includes('Previous')) {
                                    return (
                                        <Button key={idx} variant="outline" size="sm"
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-ink-750 dark:border-ink-650 dark:text-ink-200"
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                            <ChevronLeft className="h-4 w-4" /><span>Prev</span>
                                        </Button>
                                    );
                                }
                                if (label.includes('Next')) {
                                    return (
                                        <Button key={idx} variant="outline" size="sm"
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-ink-750 dark:border-ink-650 dark:text-ink-200"
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                            <span>Next</span><ChevronRight className="h-4 w-4" />
                                        </Button>
                                    );
                                }
                                return (
                                    <Button key={idx}
                                        variant={link.active ? 'default' : 'outline'} size="sm"
                                        className={`rounded-xl h-9 w-9 p-0 ${link.active ? 'bg-[#1B4FD8] hover:bg-blue-700' : 'hover:bg-slate-100 dark:hover:bg-ink-750 dark:border-ink-650 dark:text-ink-200'}`}
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                        {label}
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
