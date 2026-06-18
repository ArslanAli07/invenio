import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';

export default function ProductForm({ brands, onSuccess, onCancel }) {
    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        sku: '',
        name: '',
        price: '',
        category_id: '',
        unit: 'pcs',
        reorder_level: 10,
        is_active: true,
        show_on_store: false,
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        post(route('products.store'), {
            onSuccess: () => {
                if (onSuccess) onSuccess();
            }
        });
    };

    const checkSkuUniqueness = async (e) => {
        const sku = e.target.value;
        if (!sku) return;

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch(route('products.check-sku'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({ sku: sku })
            });
            const result = await response.json();
            if (!result.available) {
                setError('sku', 'This SKU is already assigned to another product.');
            } else {
                clearErrors('sku');
            }
        } catch (error) {
            console.error('SKU check failed:', error);
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 overflow-y-auto pr-1 min-h-0">
                <form id="general-form" onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="sku" value="Product SKU" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                        <TextInput
                            id="sku"
                            type="text"
                            value={data.sku}
                            className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 rounded-xl px-4 py-2.5 text-sm font-mono uppercase"
                            onChange={(e) => setData('sku', e.target.value.toUpperCase())}
                            onBlur={checkSkuUniqueness}
                            placeholder="e.g. ELEC-010"
                            required
                        />
                        <InputError message={errors.sku} className="mt-1.5 text-xs" />
                    </div>

                    <div>
                        <InputLabel htmlFor="name" value="Product Name" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                        <TextInput
                            id="name"
                            type="text"
                            value={data.name}
                            className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 rounded-xl px-4 py-2.5 text-sm"
                            onChange={(e) => setData('name', e.target.value)}
                            placeholder="e.g. iPhone 17 Pro"
                            required
                        />
                        <InputError message={errors.name} className="mt-1.5 text-xs" />
                    </div>

                    <div>
                        <InputLabel htmlFor="price" value="Base Price (PKR)" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                        <TextInput
                            id="price"
                            type="number"
                            value={data.price}
                            className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 rounded-xl px-4 py-2.5 text-sm"
                            onChange={(e) => setData('price', e.target.value)}
                            placeholder="0.00"
                            required
                        />
                        <InputError message={errors.price} className="mt-1.5 text-xs" />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-ink-300 uppercase tracking-wider mb-2">Brand / Category</label>
                        <select
                            value={data.category_id}
                            onChange={e => setData('category_id', e.target.value)}
                            className={`w-full px-4 py-3 bg-slate-50 dark:bg-ink-800/50 border ${errors.category_id ? 'border-rose-300 dark:border-rose-500/50 ring-4 ring-rose-50 dark:ring-rose-500/10' : 'border-slate-200 dark:border-ink-700 hover:border-slate-300 dark:hover:border-ink-600'} rounded-xl text-sm focus:ring-4 focus:ring-blue-50 dark:focus:border-blue-500 transition-all text-slate-900 dark:text-ink-100 font-medium`}
                            required
                        >
                            <option value="" disabled>Select Brand</option>
                            {brands.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <InputError message={errors.category_id} className="mt-1.5 text-xs" />
                    </div>
                </form>
            </div>

            <div className="border-t border-slate-100 dark:border-ink-700 pt-4 flex gap-3 mt-4 shrink-0">
                <Button 
                    type="button" 
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 rounded-xl py-5 font-semibold text-sm"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    form="general-form"
                    disabled={processing}
                    className="flex-1 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold rounded-xl py-5"
                >
                    {processing ? 'Creating...' : 'Create & Add Details'}
                </Button>
            </div>
        </div>
    );
}
