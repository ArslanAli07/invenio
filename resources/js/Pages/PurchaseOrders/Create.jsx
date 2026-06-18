import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import {
    ArrowLeft,
    Plus,
    Trash2,
    ClipboardList,
    Building2,
    MapPin,
    Package,
} from 'lucide-react';

// Blank line-item template
const blankItem = () => ({ product_id: '', variant_id: '', qty_ordered: '', unit_cost: '' });

export default function Create({ suppliers, locations, products }) {
    const { data, setData, post, processing, errors } = useForm({
        supplier_id: '',
        location_id: '',
        expected_at: '',
        notes: '',
        items: [blankItem()],
    });

    // ── Line item helpers ──────────────────────────────────────────────────
    const addItem = () => setData('items', [...data.items, blankItem()]);

    const removeItem = (idx) => {
        if (data.items.length === 1) return; // keep at least one row
        setData('items', data.items.filter((_, i) => i !== idx));
    };

    const updateItem = (idx, field, value) => {
        const updated = data.items.map((item, i) =>
            i === idx ? { ...item, [field]: value } : item
        );
        setData('items', updated);
    };

    // ── Computed totals ────────────────────────────────────────────────────
    const lineTotal = (item) => {
        const qty  = parseFloat(item.qty_ordered)  || 0;
        const cost = parseFloat(item.unit_cost) || 0;
        return qty * cost;
    };

    const grandTotal = data.items.reduce((sum, item) => sum + lineTotal(item), 0);

    const fmt = (n) => 'Rs ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // ── Product lookup ─────────────────────────────────────────────────────
    const productById = (id) => products.find((p) => p.id.toString() === (id || '').toString());

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('po.store'));
    };

    return (
        <AuthenticatedLayout>
            <Head title="New Purchase Order" />

            {/* Back link + page title */}
            <div className="mb-6">
                <Link
                    href={route('po.index')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-ink-400 hover:text-slate-900 dark:hover:text-ink-100 transition-colors font-medium mb-3"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Purchase Orders</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
                        <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-ink-100">New Purchase Order</h1>
                        <p className="text-sm text-slate-500 dark:text-ink-400 mt-0.5">PO number will be assigned automatically on save.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── Section 1: Order Details ─────────────────────────────── */}
                <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-ink-750 bg-slate-50/50 dark:bg-ink-800/30">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-ink-100 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-blue-600" />
                            Order Details
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Supplier */}
                        <div>
                            <InputLabel htmlFor="supplier_id" value="Supplier" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                            <select
                                id="supplier_id"
                                value={data.supplier_id}
                                onChange={(e) => setData('supplier_id', e.target.value)}
                                className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-sm transition focus:outline-none"
                            >
                                <option value="">Select supplier…</option>
                                {suppliers.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.supplier_id} className="mt-1.5 text-xs text-rose-500" />
                        </div>

                        {/* Receiving Location */}
                        <div>
                            <InputLabel htmlFor="location_id" value="Receiving Location" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                            <select
                                id="location_id"
                                value={data.location_id}
                                onChange={(e) => setData('location_id', e.target.value)}
                                className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-sm transition focus:outline-none"
                            >
                                <option value="">Select location…</option>
                                {locations.map((l) => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.code})</option>
                                ))}
                            </select>
                            <InputError message={errors.location_id} className="mt-1.5 text-xs text-rose-500" />
                        </div>

                        {/* Expected date */}
                        <div>
                            <InputLabel htmlFor="expected_at" value="Expected Delivery Date (optional)" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                            <TextInput
                                id="expected_at"
                                type="date"
                                value={data.expected_at}
                                onChange={(e) => setData('expected_at', e.target.value)}
                                className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 dark:text-ink-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                            />
                            <InputError message={errors.expected_at} className="mt-1.5 text-xs text-rose-500" />
                        </div>

                        {/* Notes */}
                        <div>
                            <InputLabel htmlFor="notes" value="Notes (optional)" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                            <textarea
                                id="notes"
                                value={data.notes}
                                rows="3"
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Delivery instructions, contract reference, etc."
                                className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 dark:text-ink-100 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-sm transition focus:outline-none resize-none"
                            />
                            <InputError message={errors.notes} className="mt-1.5 text-xs text-rose-500" />
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Line Items ────────────────────────────────── */}
                <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-ink-750 bg-slate-50/50 dark:bg-ink-800/30 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-ink-100 flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-600" />
                            Line Items
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-ink-700 text-slate-600 dark:text-ink-300">
                                {data.items.length}
                            </span>
                        </h2>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addItem}
                            className="rounded-xl text-xs gap-1.5 border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Product
                        </Button>
                    </div>

                    {/* Items table header */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-ink-750 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-ink-400 bg-slate-50/30 dark:bg-ink-800/20">
                                    <th className="px-4 py-3 text-left w-[40%]">Product</th>
                                    <th className="px-4 py-3 text-left w-[20%]">Qty Ordered</th>
                                    <th className="px-4 py-3 text-left w-[20%]">Unit Cost</th>
                                    <th className="px-4 py-3 text-right w-[15%]">Line Total</th>
                                    <th className="px-4 py-3 w-[5%]" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-ink-750">
                                {data.items.map((item, idx) => {
                                    const prod = productById(item.product_id);
                                    return (
                                        <tr key={idx} className="group">
                                            {/* Product select */}
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col gap-2">
                                                    <div>
                                                        <select
                                                            value={item.product_id}
                                                            onChange={(e) => {
                                                                const updated = data.items.map((item, i) =>
                                                                    i === idx ? { ...item, product_id: e.target.value, variant_id: '' } : item
                                                                );
                                                                setData('items', updated);
                                                            }}
                                                            className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                                        >
                                                            <option value="">Select product…</option>
                                                            {products.map((p) => (
                                                                <option key={p.id} value={p.id}>
                                                                    {p.sku} — {p.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <InputError message={errors[`items.${idx}.product_id`]} className="mt-1 text-[11px] text-rose-500" />
                                                    </div>
                                                    
                                                    {prod && prod.variants && prod.variants.length > 0 && (
                                                        <div>
                                                            <select
                                                                value={item.variant_id || ''}
                                                                onChange={(e) => updateItem(idx, 'variant_id', e.target.value)}
                                                                className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                                            >
                                                                <option value="">Select variant…</option>
                                                                {prod.variants.map((v) => (
                                                                    <option key={v.id} value={v.id}>
                                                                        {v.name}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <InputError message={errors[`items.${idx}.variant_id`]} className="mt-1 text-[11px] text-rose-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Qty ordered */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        min="0.001"
                                                        step="any"
                                                        value={item.qty_ordered}
                                                        onChange={(e) => updateItem(idx, 'qty_ordered', e.target.value)}
                                                        placeholder="0"
                                                        className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                                    />
                                                    {prod && (
                                                        <span className="text-[10px] text-slate-400 dark:text-ink-500 font-semibold whitespace-nowrap">{prod.unit}</span>
                                                    )}
                                                </div>
                                                <InputError message={errors[`items.${idx}.qty_ordered`]} className="mt-1 text-[11px] text-rose-500" />
                                            </td>

                                            {/* Unit cost */}
                                            <td className="px-4 py-3">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rs</span>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={item.unit_cost}
                                                        onChange={(e) => updateItem(idx, 'unit_cost', e.target.value)}
                                                        placeholder="0.00"
                                                        className="block w-full pl-8 bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                                                    />
                                                </div>
                                                <InputError message={errors[`items.${idx}.unit_cost`]} className="mt-1 text-[11px] text-rose-500" />
                                            </td>

                                            {/* Line total */}
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-sm font-bold text-slate-700 dark:text-ink-200">
                                                    {lineTotal(item) > 0 ? fmt(lineTotal(item)) : <span className="text-slate-300 dark:text-ink-600 font-normal">—</span>}
                                                </span>
                                            </td>

                                            {/* Remove */}
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(idx)}
                                                    disabled={data.items.length === 1}
                                                    className="p-1.5 text-slate-300 dark:text-ink-600 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Remove row"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Grand total row */}
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-ink-700 bg-slate-50/50 dark:bg-ink-800/30 flex items-center justify-between">
                        <div>
                            <InputError message={errors.items} className="text-xs text-rose-500" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-slate-500 dark:text-ink-400 uppercase tracking-wider">Grand Total</span>
                            <span className="text-lg font-bold text-slate-900 dark:text-ink-100 tabular-nums">
                                {fmt(grandTotal)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Footer actions ───────────────────────────────────────── */}
                <div className="flex items-center justify-end gap-3 pb-4">
                    <Link href={route('po.index')}>
                        <Button type="button" variant="outline" className="rounded-xl px-6 py-2.5 dark:border-ink-700 dark:text-ink-200 font-semibold">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold rounded-xl px-8 py-2.5 flex items-center gap-2 shadow-md shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {processing ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <ClipboardList className="h-4 w-4" />
                                <span>Create Purchase Order</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
