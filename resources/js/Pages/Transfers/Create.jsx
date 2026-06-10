import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { ArrowLeft, ArrowRightLeft, Package, MapPin } from 'lucide-react';

export default function Create({ products, locations }) {
    const { data, setData, post, processing, errors } = useForm({
        product_id: '',
        from_location_id: '',
        to_location_id: '',
        quantity: '',
        notes: '',
    });

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [availableStock, setAvailableStock] = useState(0);

    // Watch product selection
    useEffect(() => {
        if (data.product_id) {
            const prod = products.find(p => p.id === parseInt(data.product_id));
            setSelectedProduct(prod);
            // Reset locations and qty on product change
            setData(prev => ({
                ...prev,
                from_location_id: '',
                to_location_id: '',
                quantity: '',
            }));
            setAvailableStock(0);
        } else {
            setSelectedProduct(null);
            setAvailableStock(0);
        }
    }, [data.product_id]);

    // Watch source location selection
    useEffect(() => {
        if (data.from_location_id && selectedProduct) {
            const locId = parseInt(data.from_location_id);
            const stock = parseFloat(selectedProduct.stocks[locId] || 0);
            setAvailableStock(stock);
            
            // Destination locations are active locations excluding the source location
            const dests = locations.filter(l => l.id !== locId);
            setAvailableLocations(dests);
        } else {
            setAvailableStock(0);
            setAvailableLocations([]);
        }
    }, [data.from_location_id, selectedProduct]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('transfers.store'));
    };

    // Helper to filter locations that have positive stock for the selected product
    const sourceLocations = selectedProduct
        ? locations.filter(l => parseFloat(selectedProduct.stocks[l.id] || 0) > 0)
        : [];

    return (
        <AuthenticatedLayout>
            <Head title="New Stock Transfer" />

            <div className="mb-6">
                <Link
                    href={route('transfers.index')}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-ink-400 dark:hover:text-ink-200 transition-colors mb-3"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to transfers log
                </Link>
                
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-ink-100 flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    New Stock Transfer
                </h1>
                <p className="text-sm text-slate-500 dark:text-ink-400 mt-1">
                    Relocate inventory from one location to another. Validates stock availability on submission.
                </p>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* General details card */}
                    <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm p-6 space-y-4">
                        
                        {/* 1. Product select */}
                        <div>
                            <InputLabel htmlFor="product_id" value="Select Product to Transfer" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                            <select
                                id="product_id"
                                value={data.product_id}
                                onChange={(e) => setData('product_id', e.target.value)}
                                className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm cursor-pointer"
                            >
                                <option value="">Select a product...</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.sku})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.product_id} className="mt-1.5 text-xs text-rose-500" />
                        </div>

                        {/* If product is selected, show location and qty inputs */}
                        {selectedProduct && (
                            <>
                                <hr className="border-slate-100 dark:border-ink-750 my-4" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* 2. Source Location */}
                                    <div>
                                        <InputLabel htmlFor="from_location_id" value="Source Location (From)" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                        {sourceLocations.length > 0 ? (
                                            <select
                                                id="from_location_id"
                                                value={data.from_location_id}
                                                onChange={(e) => setData('from_location_id', e.target.value)}
                                                className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm cursor-pointer"
                                            >
                                                <option value="">Select source...</option>
                                                {sourceLocations.map((l) => {
                                                    const stock = parseFloat(selectedProduct.stocks[l.id] || 0);
                                                    return (
                                                        <option key={l.id} value={l.id}>
                                                            {l.name} (Available: {stock.toLocaleString()} {selectedProduct.unit})
                                                        </option>
                                                    );
                                                })}
                                            </select>
                                        ) : (
                                            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 p-3 rounded-xl text-xs font-semibold leading-relaxed">
                                                This product has no stock recorded in any location. You must add stock via adjustments or a purchase order first.
                                            </div>
                                        )}
                                        <InputError message={errors.from_location_id} className="mt-1.5 text-xs text-rose-500" />
                                    </div>

                                    {/* 3. Destination Location */}
                                    <div>
                                        <InputLabel htmlFor="to_location_id" value="Destination Location (To)" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                        <select
                                            id="to_location_id"
                                            value={data.to_location_id}
                                            onChange={(e) => setData('to_location_id', e.target.value)}
                                            disabled={!data.from_location_id}
                                            className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">Select destination...</option>
                                            {availableLocations.map((l) => (
                                                <option key={l.id} value={l.id}>
                                                    {l.name} ({l.code})
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.to_location_id} className="mt-1.5 text-xs text-rose-500" />
                                    </div>
                                </div>

                                {data.from_location_id && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                        
                                        {/* 4. Quantity */}
                                        <div>
                                            <InputLabel htmlFor="quantity" value={`Quantity to Move (Max: ${availableStock.toLocaleString()} ${selectedProduct.unit})`} className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                            <div className="relative">
                                                <TextInput
                                                    id="quantity"
                                                    type="number"
                                                    name="quantity"
                                                    value={data.quantity}
                                                    step="0.001"
                                                    min="0.001"
                                                    max={availableStock}
                                                    className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                                                    onChange={(e) => setData('quantity', e.target.value)}
                                                    placeholder="Enter transfer quantity..."
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-ink-500 uppercase select-none">
                                                    {selectedProduct.unit}
                                                </span>
                                            </div>
                                            <InputError message={errors.quantity} className="mt-1.5 text-xs text-rose-500" />
                                        </div>

                                        {/* Stock availability indicator */}
                                        <div className="flex items-center">
                                            <div className="bg-slate-50 dark:bg-ink-800/30 rounded-xl p-3 border border-slate-200 dark:border-ink-700 flex items-start gap-2.5 w-full mt-5">
                                                <Package className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <span className="text-[11px] font-bold text-slate-500 dark:text-ink-400 uppercase tracking-wider block">Source Stock</span>
                                                    <span className="text-sm font-extrabold text-slate-800 dark:text-ink-200 block mt-0.5 tabular-nums">
                                                        {availableStock.toLocaleString()} {selectedProduct.unit} available
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Notes card */}
                    {selectedProduct && data.from_location_id && (
                        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm p-6 space-y-4">
                            <div>
                                <InputLabel htmlFor="notes" value="Transfer Notes / Description (Optional)" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={data.notes}
                                    rows="3"
                                    className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Provide notes or reasons for this transfer (e.g. store restocking)..."
                                />
                                <InputError message={errors.notes} className="mt-1.5 text-xs text-rose-500" />
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                        <Link href={route('transfers.index')} className="flex-1">
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full rounded-xl py-5 hover:bg-slate-50 dark:hover:bg-ink-800 dark:border-ink-650 dark:text-ink-200 font-semibold text-sm"
                            >
                                Cancel
                            </Button>
                        </Link>
                        <Button
                            type="submit"
                            disabled={processing || !data.product_id || !data.from_location_id || !data.to_location_id || !data.quantity}
                            className="flex-1 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold rounded-xl py-5 flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processing ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <span>Confirm Transfer</span>
                            )}
                        </Button>
                    </div>

                </form>
            </div>
        </AuthenticatedLayout>
    );
}
