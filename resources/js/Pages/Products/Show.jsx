import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/Components/ui/button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/Components/ui/sheet';
import {
    ArrowLeft,
    Layers,
    MapPin,
    TrendingUp,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileText,
    Plus,
    ArrowDownToLine,
    ArrowUpFromLine,
    SlidersHorizontal,
} from 'lucide-react';

export default function Show({ product, stockLevels, movements, movementFilters = {}, can }) {
    const [isOpen, setIsOpen] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        location_id:      '',
        type:             'in',
        quantity:         '',
        reference_source: '',
        note:             '',
    });

    // Find the stock level object for the currently-selected location
    const selectedLevel = data.location_id
        ? stockLevels.find((l) => l.location_id === parseInt(data.location_id))
        : null;

    const handleOpen = () => {
        reset();
        setIsOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('movements.store', product.id), {
            onSuccess: () => {
                reset();
                setIsOpen(false);
            },
        });
    };

    // Type config — drives styling and helper text
    const typeConfig = {
        in: {
            label:       'Stock In',
            icon:        ArrowDownToLine,
            color:       'emerald',
            activeClass: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400',
            qtyLabel:    'Quantity to Receive',
            qtyHint:     null,
        },
        out: {
            label:       'Stock Out',
            icon:        ArrowUpFromLine,
            color:       'rose',
            activeClass: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400',
            qtyLabel:    'Quantity to Dispatch',
            qtyHint:     selectedLevel
                ? `Available at this location: ${selectedLevel.current_stock} ${product.unit}`
                : null,
        },
        adjust: {
            label:       'Adjustment',
            icon:        SlidersHorizontal,
            color:       'amber',
            activeClass: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400',
            qtyLabel:    'Adjustment Amount',
            qtyHint:     selectedLevel
                ? `Current stock: ${selectedLevel.current_stock} ${product.unit} — use a negative number to reduce (e.g. -3 for a write-off)`
                : 'Use a negative number to reduce stock (e.g. -3 for a write-off).',
        },
    };

    const activeType = typeConfig[data.type];

    return (
        <AuthenticatedLayout>
            <Head title={`Product - ${product.sku}`} />

            {/* Header / Back Action */}
            <div className="mb-6">
                <Link
                    href={route('products.index')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-ink-400 hover:text-slate-900 dark:hover:text-ink-100 transition-colors font-medium mb-3"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Products</span>
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-100/50 dark:border-blue-500/20 whitespace-nowrap">
                                {product.sku}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-ink-800 text-slate-700 dark:text-ink-200">
                                {product.category?.name || 'Uncategorized'}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-ink-100 mt-2">{product.name}</h1>
                    </div>

                    {/* Record Movement CTA — Admin/Manager only */}
                    {can?.recordMovement && (
                        <Button
                            onClick={handleOpen}
                            className="bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold rounded-xl px-5 py-2.5 flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95 self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4" />
                            Record Movement
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Product Info Card */}
                <div className="lg:col-span-1 bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-ink-100 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-ink-750">
                            <Layers className="h-4.5 w-4.5 text-blue-600" />
                            <span>Product Specifications</span>
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-ink-400 block">Unit of Measure</span>
                                <span className="text-sm text-slate-800 dark:text-ink-200 font-semibold mt-1 block">{product.unit || 'pcs'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-ink-400 block">Reorder Alert Level</span>
                                <span className="text-sm text-slate-800 dark:text-ink-200 font-semibold mt-1 block">{product.reorder_level} {product.unit || 'pcs'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-ink-400 block">Catalog Status</span>
                                {product.is_active ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 mt-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200 mt-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                        Inactive
                                    </span>
                                )}
                            </div>
                            {product.description && (
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-ink-400 block">Description</span>
                                    <p className="text-xs text-slate-500 dark:text-ink-400 mt-1 leading-relaxed">{product.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Warehouse Stock Card */}
                <div className="lg:col-span-2 bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-ink-100 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-ink-750">
                            <MapPin className="h-4.5 w-4.5 text-blue-600" />
                            <span>Storage Location Inventory Levels</span>
                        </h3>
                        <div className="divide-y divide-slate-100 dark:divide-ink-750">
                            {stockLevels.map((level) => (
                                <div key={level.location_id} className="flex items-center justify-between py-3.5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-ink-100">{level.location_name}</span>
                                        <span className="font-mono text-[10px] text-slate-400 dark:text-ink-400 mt-0.5 uppercase">code: {level.location_code}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {level.is_low ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                                                <span className="relative flex h-1.5 w-1.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                                                </span>
                                                Below Reorder Alert
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                In Stock
                                            </span>
                                        )}
                                        <span className="font-bold text-sm text-slate-900 dark:text-ink-100 bg-slate-50 dark:bg-ink-800 border border-slate-200/50 dark:border-ink-700 px-3 py-1 rounded-xl">
                                            {level.current_stock} <span className="text-[10px] text-slate-400 dark:text-ink-400 font-semibold">{product.unit || 'pcs'}</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Movement History Table */}
            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm overflow-hidden mb-6 flex flex-col">
                {/* Card header + filter bar */}
                <div className="px-6 py-4 border-b border-slate-100 dark:border-ink-700 bg-slate-50/50 dark:bg-ink-800/30">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-ink-100 flex items-center gap-2">
                            <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
                            <span>Ledger Movement History</span>
                            {movements.total > 0 && (
                                <span className="ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-ink-700 text-slate-600 dark:text-ink-300">
                                    {movements.total}
                                </span>
                            )}
                        </h3>
                        {/* Filters */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <select
                                value={movementFilters.filter_location || ''}
                                onChange={(e) => router.get(
                                    route('products.show', product.id),
                                    { ...movementFilters, filter_location: e.target.value || undefined },
                                    { preserveState: true, preserveScroll: true, replace: true }
                                )}
                                className="text-xs bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-700 text-slate-700 dark:text-ink-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                            >
                                <option value="">All Locations</option>
                                {stockLevels.map((l) => (
                                    <option key={l.location_id} value={l.location_id}>
                                        {l.location_name}
                                    </option>
                                ))}
                            </select>
                            <select
                                value={movementFilters.filter_type || ''}
                                onChange={(e) => router.get(
                                    route('products.show', product.id),
                                    { ...movementFilters, filter_type: e.target.value || undefined },
                                    { preserveState: true, preserveScroll: true, replace: true }
                                )}
                                className="text-xs bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-700 text-slate-700 dark:text-ink-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                            >
                                <option value="">All Types</option>
                                <option value="in">Stock In</option>
                                <option value="out">Stock Out</option>
                                <option value="adjust">Adjustment</option>
                            </select>
                            {/* Date from */}
                            <input
                                type="date"
                                value={movementFilters.filter_from || ''}
                                onChange={(e) => router.get(
                                    route('products.show', product.id),
                                    { ...movementFilters, filter_from: e.target.value || undefined },
                                    { preserveState: true, preserveScroll: true, replace: true }
                                )}
                                className="text-xs bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-700 text-slate-700 dark:text-ink-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                                title="From date"
                            />
                            {/* Date to */}
                            <input
                                type="date"
                                value={movementFilters.filter_to || ''}
                                onChange={(e) => router.get(
                                    route('products.show', product.id),
                                    { ...movementFilters, filter_to: e.target.value || undefined },
                                    { preserveState: true, preserveScroll: true, replace: true }
                                )}
                                className="text-xs bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-700 text-slate-700 dark:text-ink-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
                                title="To date"
                            />
                            {(movementFilters.filter_location || movementFilters.filter_type || movementFilters.filter_from || movementFilters.filter_to) && (
                                <button
                                    onClick={() => router.get(
                                        route('products.show', product.id),
                                        {},
                                        { preserveState: true, preserveScroll: true, replace: true }
                                    )}
                                    className="text-xs text-slate-500 dark:text-ink-400 hover:text-slate-800 dark:hover:text-ink-100 font-medium px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-ink-750 transition-colors"
                                >
                                    × Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/75 dark:bg-ink-800/50 border-b border-slate-200 dark:border-ink-700 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-ink-400">
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Movement Type</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Reference</th>
                                <th className="px-6 py-4">Notes</th>
                                <th className="px-6 py-4">Operator</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-ink-750">
                            {movements.data.length > 0 ? (
                                movements.data.map((movement) => (
                                    <tr key={movement.id} className="hover:bg-slate-50/30 dark:hover:bg-ink-800/40 transition-colors">
                                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-ink-400 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {new Date(movement.created_at).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {movement.type === 'in' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                                                    <ArrowDownToLine className="h-3 w-3" />
                                                    Stock In
                                                </span>
                                            )}
                                            {movement.type === 'out' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                                                    <ArrowUpFromLine className="h-3 w-3" />
                                                    Stock Out
                                                </span>
                                            )}
                                            {movement.type === 'adjust' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                                                    <SlidersHorizontal className="h-3 w-3" />
                                                    Adjustment
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold text-sm ${
                                                movement.type === 'in'
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : movement.type === 'out'
                                                    ? 'text-rose-600 dark:text-rose-400'
                                                    : 'text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {movement.type === 'in'
                                                    ? `+${parseFloat(movement.quantity)}`
                                                    : movement.type === 'out'
                                                    ? `-${parseFloat(movement.quantity)}`
                                                    : (parseFloat(movement.quantity) > 0 ? `+${parseFloat(movement.quantity)}` : parseFloat(movement.quantity))}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold text-slate-600 dark:text-ink-400">
                                                {movement.location?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {movement.reference_type ? (() => {
                                                const isPo = movement.reference_type.includes('PurchaseOrder');
                                                const refLabel = movement.reference_type.includes('\\')
                                                    ? `${movement.reference_type.split('\\').pop()} #${movement.reference_id}`
                                                    : movement.reference_type;
                                                if (isPo && movement.reference_id) {
                                                    return (
                                                        <Link
                                                            href={route('po.show', movement.reference_id)}
                                                            className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-mono text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-100/50 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
                                                        >
                                                            <FileText className="h-3.5 w-3.5 flex-shrink-0" />
                                                            {refLabel}
                                                        </Link>
                                                    );
                                                }
                                                return (
                                                    <span className="flex items-center gap-1.5 text-slate-600 dark:text-ink-400 font-mono text-[10px] bg-slate-100 dark:bg-ink-800 px-2 py-0.5 rounded border border-slate-200 dark:border-ink-700">
                                                        <FileText className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                                                        {refLabel}
                                                    </span>
                                                );
                                            })() : (
                                                <span className="text-slate-400 dark:text-ink-600 italic">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-500 dark:text-ink-400 line-clamp-1 max-w-[200px]" title={movement.note}>
                                                {movement.note || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-600 dark:text-ink-400 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-slate-400" />
                                                {movement.user?.name || 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-xs italic">
                                        No ledger movements logged for this SKU yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Movements pagination */}
                {movements.links && movements.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-ink-700 flex items-center justify-between bg-slate-50/50 dark:bg-ink-800/30">
                        <span className="text-xs text-slate-500 dark:text-ink-400">
                            Showing <span className="font-semibold text-slate-800 dark:text-ink-200">{movements.from}</span> to{' '}
                            <span className="font-semibold text-slate-800 dark:text-ink-200">{movements.to}</span> of{' '}
                            <span className="font-semibold text-slate-800 dark:text-ink-200">{movements.total}</span> movements
                        </span>
                        <div className="flex gap-1.5">
                            {movements.links.map((link, idx) => {
                                if (link.url === null) return null;
                                let label = link.label;
                                if (label.includes('Previous')) {
                                    return (
                                        <Button key={idx} variant="outline" size="sm"
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-ink-750 dark:border-ink-650 dark:text-ink-200"
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                            <ChevronLeft className="h-4 w-4" /><span>Previous</span>
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
                                        className={`rounded-xl h-9 w-9 p-0 ${link.active ? 'bg-[#1B4FD8] hover:bg-blue-700' : 'hover:bg-slate-100'}`}
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                        {label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Record Movement Slide-over ──────────────────────────────────── */}
            {can?.recordMovement && (
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetContent side="right" className="w-full sm:max-w-md bg-white dark:bg-ink-900 p-6 border-l border-slate-200 dark:border-ink-700 shadow-2xl flex flex-col h-full overflow-hidden z-50">
                        <SheetHeader className="mb-5">
                            <SheetTitle className="text-lg font-bold text-slate-900 dark:text-ink-100">
                                Record Stock Movement
                            </SheetTitle>
                            <SheetDescription className="text-xs text-slate-500 dark:text-ink-400">
                                <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{product.sku}</span>
                                {' — '}{product.name}
                            </SheetDescription>
                        </SheetHeader>

                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-5">

                                {/* ── Movement Type Selector ─────────────────── */}
                                <div>
                                    <InputLabel value="Movement Type" className="text-slate-700 dark:text-ink-200 font-semibold mb-2" />
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(typeConfig).map(([key, cfg]) => {
                                            const Icon = cfg.icon;
                                            const isActive = data.type === key;
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setData('type', key)}
                                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                                                        isActive
                                                            ? cfg.activeClass
                                                            : 'border-slate-200 dark:border-ink-700 text-slate-500 dark:text-ink-400 hover:bg-slate-50 dark:hover:bg-ink-800 hover:border-slate-300 dark:hover:border-ink-650'
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {cfg.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.type} className="mt-1.5 text-xs text-rose-500" />
                                </div>

                                {/* ── Location ──────────────────────────────── */}
                                <div>
                                    <InputLabel htmlFor="location_id" value="Location" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                    <select
                                        id="location_id"
                                        value={data.location_id}
                                        onChange={(e) => setData('location_id', e.target.value)}
                                        className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-sm transition"
                                    >
                                        <option value="">Select a location…</option>
                                        {stockLevels.map((level) => (
                                            <option key={level.location_id} value={level.location_id}>
                                                {level.location_name} ({level.location_code}) — {level.current_stock} {product.unit}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.location_id} className="mt-1.5 text-xs text-rose-500" />
                                </div>

                                {/* ── Quantity ──────────────────────────────── */}
                                <div>
                                    <InputLabel htmlFor="quantity" value={activeType.qtyLabel} className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                    <TextInput
                                        id="quantity"
                                        type="number"
                                        step="any"
                                        min={data.type === 'adjust' ? undefined : '0.001'}
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        placeholder={data.type === 'adjust' ? 'e.g. 5 or -3' : 'e.g. 50'}
                                        className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 dark:text-ink-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                                    />
                                    {/* Context-aware hint */}
                                    {activeType.qtyHint && (
                                        <p className={`text-[11px] mt-1.5 leading-snug ${
                                            data.type === 'out'
                                                ? 'text-slate-500 dark:text-ink-400'
                                                : 'text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {activeType.qtyHint}
                                        </p>
                                    )}
                                    <InputError message={errors.quantity} className="mt-1.5 text-xs text-rose-500" />
                                </div>

                                {/* ── Reference Source ──────────────────────── */}
                                <div>
                                    <InputLabel htmlFor="reference_source" value="Reference Source (optional)" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                    <TextInput
                                        id="reference_source"
                                        type="text"
                                        value={data.reference_source}
                                        onChange={(e) => setData('reference_source', e.target.value)}
                                        placeholder="e.g. Delivery note #42, RMA-001"
                                        className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 dark:text-ink-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                                    />
                                    <InputError message={errors.reference_source} className="mt-1.5 text-xs text-rose-500" />
                                </div>

                                {/* ── Notes ─────────────────────────────────── */}
                                <div>
                                    <InputLabel htmlFor="note" value="Notes (optional)" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                    <textarea
                                        id="note"
                                        value={data.note}
                                        rows="3"
                                        onChange={(e) => setData('note', e.target.value)}
                                        placeholder="Any additional context about this movement…"
                                        className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 dark:text-ink-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-sm transition"
                                    />
                                    <InputError message={errors.note} className="mt-1.5 text-xs text-rose-500" />
                                </div>
                            </div>

                            {/* ── Footer ────────────────────────────────────── */}
                            <div className="border-t border-slate-100 dark:border-ink-700/50 pt-4 mt-4 flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 rounded-xl py-5 hover:bg-slate-50 dark:hover:bg-ink-800 dark:border-ink-700 dark:text-ink-200 font-semibold text-sm"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className={`flex-1 text-white font-semibold rounded-xl py-5 flex items-center justify-center gap-1.5 shadow-md transition-all ${
                                        data.type === 'in'
                                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                                            : data.type === 'out'
                                            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                                            : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                    }`}
                                >
                                    {processing ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <>
                                            <activeType.icon className="h-4 w-4" />
                                            <span>
                                                {data.type === 'in' ? 'Record Stock In' : data.type === 'out' ? 'Record Stock Out' : 'Save Adjustment'}
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            )}
        </AuthenticatedLayout>
    );
}
