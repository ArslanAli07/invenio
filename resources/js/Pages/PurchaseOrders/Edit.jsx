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
    Package,
    Edit3,
} from 'lucide-react';

// Blank line-item template
const blankItem = () => ({ product_id: '', variant_id: '', qty_ordered: '', unit_cost: '' });

export default function Edit({ purchaseOrder, suppliers, locations, products }) {
    // Pre-fill from existing PO (all items, draft only so qty_received is always 0)
    const { data, setData, put, processing, errors } = useForm({
        supplier_id: String(purchaseOrder.supplier_id),
        location_id: String(purchaseOrder.location_id),
        expected_at: purchaseOrder.expected_at
            ? purchaseOrder.expected_at.slice(0, 10) // YYYY-MM-DD
            : '',
        notes: purchaseOrder.notes || '',
        items: purchaseOrder.items.map((i) => ({
            product_id: String(i.product_id),
            qty_ordered: String(i.qty_ordered),
            unit_cost:   String(i.unit_cost),
        })),
    });

    // ── Line item helpers ──────────────────────────────────────────────────
    const addItem = () => setData('items', [...data.items, blankItem()]);

    const removeItem = (idx) => {
        if (data.items.length === 1) return;
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

    const productById = (id) => products.find((p) => p.id.toString() === (id || '').toString());

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('po.update', purchaseOrder.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit ${purchaseOrder.po_number}`} />

            {/* Back link + page title */}
            <div className="mb-6">
                <Link
                    href={route('po.show', purchaseOrder.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-ink-100 transition-colors font-medium mb-3"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to {purchaseOrder.po_number}</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20">
                        <Edit3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                            Edit{' '}
                            <span className="font-mono text-[#6b7c5c] dark:text-[#8fa67a]">{purchaseOrder.po_number}</span>
                        </h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Draft — all line items can be replaced until the order is sent.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* ── Section 1: Order Details ─────────────────────────────── */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700">
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-[#6b7c5c]" />
                            Order Details
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Supplier */}
                        <div>
                            <InputLabel htmlFor="supplier_id" value="Supplier" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                            <select
                                id="supplier_id"
                                value={data.supplier_id}
                                onChange={(e) => setData('supplier_id', e.target.value)}
                                className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm shadow-sm transition focus:outline-none"
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
                            <InputLabel htmlFor="location_id" value="Receiving Location" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                            <select
                                id="location_id"
                                value={data.location_id}
                                onChange={(e) => setData('location_id', e.target.value)}
                                className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm shadow-sm transition focus:outline-none"
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
                            <InputLabel htmlFor="expected_at" value="Expected Delivery Date (optional)" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                            <TextInput
                                id="expected_at"
                                type="date"
                                value={data.expected_at}
                                onChange={(e) => setData('expected_at', e.target.value)}
                                className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 dark:text-zinc-100 text-slate-900 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm"
                            />
                            <InputError message={errors.expected_at} className="mt-1.5 text-xs text-rose-500" />
                        </div>

                        {/* Notes */}
                        <div>
                            <InputLabel htmlFor="notes" value="Notes (optional)" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                            <textarea
                                id="notes"
                                value={data.notes}
                                rows="3"
                                onChange={(e) => setData('notes', e.target.value)}
                                placeholder="Delivery instructions, contract reference, etc."
                                className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 dark:text-zinc-100 text-slate-900 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm shadow-sm transition focus:outline-none resize-none"
                            />
                            <InputError message={errors.notes} className="mt-1.5 text-xs text-rose-500" />
                        </div>
                    </div>
                </div>

                {/* ── Section 2: Line Items ────────────────────────────────── */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Package className="h-4 w-4 text-[#6b7c5c]" />
                            Line Items
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300">
                                {data.items.length}
                            </span>
                        </h2>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addItem}
                            className="rounded-xl text-xs gap-1.5 border-blue-200 dark:border-blue-500/30 text-[#6b7c5c] dark:text-[#8fa67a] hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Product
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-50/50 dark:bg-zinc-700">
                                    <th className="px-4 py-3 text-left w-[40%]">Product</th>
                                    <th className="px-4 py-3 text-left w-[20%]">Qty Ordered</th>
                                    <th className="px-4 py-3 text-left w-[20%]">Unit Cost</th>
                                    <th className="px-4 py-3 text-right w-[15%]">Line Total</th>
                                    <th className="px-4 py-3 w-[5%]" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                {data.items.map((item, idx) => {
                                    const prod = productById(item.product_id);
                                    return (
                                        <tr key={idx} className="group">
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
                                                            className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
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
                                                                className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
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
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5">
                                                    <input
                                                        type="number"
                                                        min="0.001"
                                                        step="any"
                                                        value={item.qty_ordered}
                                                        onChange={(e) => updateItem(idx, 'qty_ordered', e.target.value)}
                                                        placeholder="0"
                                                        className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
                                                    />
                                                    {prod && (
                                                        <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold whitespace-nowrap">{prod.unit}</span>
                                                    )}
                                                </div>
                                                <InputError message={errors[`items.${idx}.qty_ordered`]} className="mt-1 text-[11px] text-rose-500" />
                                            </td>
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
                                                        className="block w-full pl-8 bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
                                                    />
                                                </div>
                                                <InputError message={errors[`items.${idx}.unit_cost`]} className="mt-1 text-[11px] text-rose-500" />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="text-sm font-bold text-zinc-700 dark:text-zinc-200">
                                                    {lineTotal(item) > 0 ? fmt(lineTotal(item)) : <span className="text-slate-300 dark:text-ink-600 font-normal">—</span>}
                                                </span>
                                            </td>
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

                    {/* Grand total */}
                    <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-between">
                        <div>
                            <InputError message={errors.items} className="text-xs text-rose-500" />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Grand Total</span>
                            <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                                {fmt(grandTotal)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Footer actions ───────────────────────────────────────── */}
                <div className="flex items-center justify-end gap-3 pb-4">
                    <Link href={route('po.show', purchaseOrder.id)}>
                        <Button type="button" variant="outline" className="rounded-xl px-6 py-2.5 dark:border-zinc-700 dark:text-zinc-200 font-semibold">
                            Cancel
                        </Button>
                    </Link>
                    <Button
                        type="submit"
                        disabled={processing}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl px-8 py-2.5 flex items-center gap-2 shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-95"
                    >
                        {processing ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <ClipboardList className="h-4 w-4" />
                                <span>Save Changes</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
