import React, { useState } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { Trash2, Star, ImagePlus, Plus, Image as ImageIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/Components/ui/dialog';

export function GeneralManager({ product, brands }) {
    const { data, setData, put, processing, errors, setError, clearErrors } = useForm({
        sku: product?.sku || '',
        name: product?.name || '',
        short_description: product?.short_description || '',
        description: product?.description || '',
        price: product?.price || '',
        unit: product?.unit || 'pcs',
        category_id: product?.category_id || '',
        reorder_level: product?.reorder_level ?? 10,
        is_active: product?.is_active ?? true,
        show_on_store: product?.show_on_store ?? false,
        is_featured: product?.is_featured ?? false,
    });

    const handleFormSubmit = (e) => {
        e.preventDefault();
        put(route('products.update', product.id), {
            preserveScroll: true
        });
    };

    const checkSkuUniqueness = async (e) => {
        const sku = e.target.value;
        if (!sku) return;
        
        if (product.sku === sku) {
            clearErrors('sku');
            return;
        }

        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const response = await fetch(route('products.check-sku'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token,
                },
                body: JSON.stringify({ 
                    sku: sku,
                    ignore_id: product.id
                })
            });
            if (!response.ok) {
                console.warn('SKU check request failed with status:', response.status);
                return;
            }
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
        <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputLabel htmlFor="sku" value="Product SKU" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                    <TextInput
                        id="sku"
                        type="text"
                        value={data.sku}
                        className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 text-sm font-mono uppercase"
                        onChange={(e) => setData('sku', e.target.value.toUpperCase())}
                        onBlur={checkSkuUniqueness}
                        placeholder="e.g. ELEC-010"
                    />
                    <InputError message={errors.sku} className="mt-1.5 text-xs" />
                </div>

                <div>
                    <InputLabel htmlFor="name" value="Product Name" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                    <TextInput
                        id="name"
                        type="text"
                        value={data.name}
                        className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 text-sm"
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="e.g. iPhone 17 Pro"
                    />
                    <InputError message={errors.name} className="mt-1.5 text-xs" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputLabel htmlFor="price" value="Base Price (PKR)" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                    <TextInput
                        id="price"
                        type="number"
                        value={data.price}
                        className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 text-sm"
                        onChange={(e) => setData('price', e.target.value)}
                        placeholder="0.00"
                    />
                    <InputError message={errors.price} className="mt-1.5 text-xs" />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider mb-2">Brand / Category</label>
                    <select
                        value={data.category_id}
                        onChange={e => setData('category_id', e.target.value)}
                        className={`w-full px-4 py-3 bg-slate-50 dark:bg-zinc-700/50 border ${errors.category_id ? 'border-rose-300 dark:border-rose-500/50 ring-4 ring-rose-50 dark:ring-rose-500/10' : 'border-zinc-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-ink-600'} rounded-xl text-sm focus:ring-4 focus:ring-blue-50 dark:focus:border-blue-500 transition-all text-zinc-900 dark:text-zinc-100 font-medium`}
                    >
                        <option value="" disabled>Select Brand</option>
                        {brands.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <InputError message={errors.category_id} className="mt-1.5 text-xs" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <InputLabel htmlFor="unit" value="Unit" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                    <TextInput
                        id="unit"
                        type="text"
                        value={data.unit}
                        className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 text-sm"
                        onChange={(e) => setData('unit', e.target.value)}
                    />
                    <InputError message={errors.unit} className="mt-1.5 text-xs" />
                </div>
                <div>
                    <InputLabel htmlFor="reorder_level" value="Reorder Level" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                    <TextInput
                        id="reorder_level"
                        type="number"
                        value={data.reorder_level}
                        className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 text-sm"
                        onChange={(e) => setData('reorder_level', parseInt(e.target.value) || 0)}
                    />
                    <InputError message={errors.reorder_level} className="mt-1.5 text-xs" />
                </div>
            </div>

            <div>
                <InputLabel htmlFor="short_description" value="Short Description" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                <textarea
                    id="short_description"
                    value={data.short_description}
                    rows="2"
                    className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 text-sm"
                    onChange={(e) => setData('short_description', e.target.value)}
                    placeholder="Brief overview for product cards..."
                />
                <InputError message={errors.short_description} className="mt-1.5 text-xs" />
            </div>

            <div>
                <InputLabel htmlFor="description" value="Full Description" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                <textarea
                    id="description"
                    value={data.description}
                    rows="5"
                    className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-xl px-4 py-2.5 text-sm"
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Detailed description..."
                />
                <InputError message={errors.description} className="mt-1.5 text-xs" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            checked={data.is_active}
                            onChange={(e) => setData('is_active', e.target.checked)}
                            className="bg-white border-slate-300 text-blue-600 focus:ring-zinc-400 rounded"
                        />
                        <div className="ms-3">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">Active Status</span>
                        </div>
                    </label>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            checked={data.show_on_store}
                            onChange={(e) => setData('show_on_store', e.target.checked)}
                            className="bg-white border-slate-300 text-blue-600 focus:ring-zinc-400 rounded"
                        />
                        <div className="ms-3">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">Show on Storefront</span>
                        </div>
                    </label>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                    <label className="flex items-center cursor-pointer select-none">
                        <Checkbox
                            checked={data.is_featured}
                            onChange={(e) => setData('is_featured', e.target.checked)}
                            className="bg-white border-slate-300 text-blue-600 focus:ring-zinc-400 rounded"
                        />
                        <div className="ms-3">
                            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">Featured Product</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700 flex justify-end">
                <Button
                    type="submit"
                    disabled={processing}
                    className="bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white font-semibold rounded-xl py-2.5 px-6"
                >
                    {processing ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </form>
    );
}

export function ImageManager({ product }) {
    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        router.post(route('products.images.store', product.id), {
            image: file,
            _method: 'POST'
        }, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
        });
    };

    const setPrimary = (image) => {
        router.post(route('products.images.update', [product.id, image.id]), {
            _method: 'PATCH',
            is_primary: true
        }, { preserveScroll: true, preserveState: true });
    };

    const setVariant = (image, variantId) => {
        router.post(route('products.images.update', [product.id, image.id]), {
            _method: 'PATCH',
            variant_id: variantId
        }, { preserveScroll: true, preserveState: true });
    };

    const deleteImage = (image) => {
        if (!confirm('Delete this image?')) return;
        router.delete(route('products.images.destroy', [product.id, image.id]), {
            preserveScroll: true, preserveState: true
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-700/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Product Images</h3>
                    <p className="text-sm text-slate-500">Upload high-quality images. You can assign specific images to variants.</p>
                </div>
                <div>
                    <input type="file" id="imageUpload" className="hidden" accept="image/*" onChange={handleUpload} />
                    <Button className="rounded-lg bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white" onClick={() => document.getElementById('imageUpload').click()}>
                        <ImagePlus className="w-4 h-4 mr-2" /> Upload Image
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {product.images?.length === 0 && (
                    <div className="col-span-full text-center py-12 text-sm text-slate-500 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl">
                        No images uploaded yet.
                    </div>
                )}
                {product.images?.map(img => (
                    <div key={img.id} className={`relative group rounded-xl border-2 overflow-hidden bg-slate-50 dark:bg-zinc-700 ${img.is_primary ? 'border-blue-500' : 'border-zinc-200 dark:border-zinc-700'}`}>
                        <img src={`/storage/${img.path}`} alt="Product" className="w-full aspect-square object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {!img.is_primary && (
                                <button onClick={() => setPrimary(img)} className="p-2 bg-white rounded-full text-slate-700 hover:text-[#6b7c5c]" title="Set Primary">
                                    <Star className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => deleteImage(img)} className="p-2 bg-white rounded-full text-slate-700 hover:text-rose-600" title="Delete">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {img.is_primary && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md">
                                PRIMARY
                            </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-zinc-800/95 border-t border-zinc-200 dark:border-zinc-700 p-2">
                            <select 
                                value={img.variant_id || ""} 
                                onChange={(e) => setVariant(img, e.target.value)}
                                className="w-full text-xs font-semibold bg-transparent border-0 focus:ring-0 text-slate-700 dark:text-slate-300 py-1"
                            >
                                <option value="">No Variant</option>
                                {product.variants?.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function VariantManager({ product }) {
    const { data, setData, post, processing, reset } = useForm({
        name: '',
        sku: '',
        price: ''
    });

    const addVariant = (e) => {
        e.preventDefault();
        post(route('products.variants.store', product.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => reset()
        });
    };

    const deleteVariant = (variant) => {
        if (!confirm('Delete this variant?')) return;
        router.delete(route('products.variants.destroy', [product.id, variant.id]), {
            preserveScroll: true, preserveState: true
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-50 dark:bg-zinc-700/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Add New Variant</h3>
                <form onSubmit={addVariant} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="col-span-1 md:col-span-4">
                        <InputLabel value="Variant Name (e.g. 256GB Gold)" />
                        <TextInput value={data.name} onChange={e => setData('name', e.target.value)} className="w-full mt-1" required />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                        <InputLabel value="SKU" />
                        <TextInput value={data.sku} onChange={e => setData('sku', e.target.value)} className="w-full mt-1 font-mono" required />
                    </div>
                    <div className="col-span-1 md:col-span-3">
                        <InputLabel value="Specific Price (Optional)" />
                        <TextInput value={data.price} onChange={e => setData('price', e.target.value)} className="w-full mt-1" type="number" step="0.01" />
                    </div>
                    <div className="col-span-1 md:col-span-1">
                        <Button type="submit" disabled={processing} className="w-full bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white h-[42px] mb-[2px]">
                            <Plus className="w-5 h-5" />
                        </Button>
                    </div>
                </form>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-ink-700">
                    <thead className="bg-slate-50 dark:bg-zinc-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider w-24">Image</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Variant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SKU</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-ink-700">
                        {product.variants?.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-sm text-slate-500">No variants added yet.</td>
                            </tr>
                        )}
                        {product.variants?.map(v => {
                            const variantImage = product.images?.find(img => img.variant_id === v.id);
                            return (
                                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-zinc-700/30">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <VariantImageSelector product={product} variant={v} currentImage={variantImage} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-zinc-900 dark:text-zinc-100">{v.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{v.sku}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-zinc-900 dark:text-zinc-100">
                                        {v.price ? `Rs ${v.price}` : <span className="text-slate-400">Base Price</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => deleteVariant(v)} className="text-rose-500 hover:text-rose-700">
                                            <Trash2 className="w-4 h-4 inline-block" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function VariantImageSelector({ product, variant, currentImage }) {
    const [open, setOpen] = useState(false);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        router.post(route('products.images.store', product.id), {
            image: file,
            variant_id: variant.id,
            _method: 'POST'
        }, {
            forceFormData: true,
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => setOpen(false)
        });
    };

    const selectImage = (image) => {
        router.post(route('products.images.update', [product.id, image.id]), {
            _method: 'PATCH',
            variant_id: variant.id
        }, { 
            preserveScroll: true, 
            preserveState: true,
            onSuccess: () => setOpen(false)
        });
    };

    return (
        <>
            <button 
                onClick={() => setOpen(true)}
                className="w-12 h-12 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-slate-100 dark:bg-zinc-700 flex items-center justify-center hover:ring-2 ring-blue-500 transition-all shrink-0"
                title="Select Image"
            >
                {currentImage ? (
                    <img src={`/storage/${currentImage.path}`} alt={variant.name} className="w-full h-full object-cover" />
                ) : (
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                )}
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-xl bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                    <DialogHeader>
                        <DialogTitle className="text-zinc-900 dark:text-zinc-100">Select Image for {variant.name}</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Choose an existing image from the gallery or upload a new one directly for this variant.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="mt-4">
                        <div className="grid grid-cols-4 gap-3 mb-6 max-h-64 overflow-y-auto pr-2">
                            {product.images?.length === 0 && (
                                <div className="col-span-full text-center py-6 text-sm text-slate-500">
                                    No images available. Upload one below.
                                </div>
                            )}
                            {product.images?.map(img => (
                                <button
                                    key={img.id}
                                    onClick={() => selectImage(img)}
                                    className={`relative rounded-lg border-2 overflow-hidden aspect-square ${img.id === currentImage?.id ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-900' : 'border-transparent hover:border-blue-300'}`}
                                >
                                    <img src={`/storage/${img.path}`} alt="Gallery" className="w-full h-full object-cover" />
                                    {img.id === currentImage?.id && (
                                        <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
                                            <Star className="w-3 h-3" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-4 flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">Or upload a new image</span>
                            <div>
                                <input type="file" id={`variantImageUpload-${variant.id}`} className="hidden" accept="image/*" onChange={handleUpload} />
                                <Button 
                                    onClick={() => document.getElementById(`variantImageUpload-${variant.id}`).click()}
                                    className="bg-slate-900 hover:bg-slate-800 dark:bg-ink-100 dark:hover:bg-white dark:text-slate-900"
                                >
                                    <ImagePlus className="w-4 h-4 mr-2" />
                                    Upload New
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function SpecManager({ product }) {
    const { data, setData, put, processing } = useForm({
        specs: product.specs?.length ? product.specs.map(s => ({ ...s })) : []
    });

    const addSpec = () => {
        setData('specs', [...data.specs, { spec_group: '', spec_key: '', spec_value: '', sort_order: data.specs.length }]);
    };

    const removeSpec = (index) => {
        const newSpecs = [...data.specs];
        newSpecs.splice(index, 1);
        setData('specs', newSpecs);
    };

    const updateSpec = (index, field, value) => {
        const newSpecs = [...data.specs];
        newSpecs[index][field] = value;
        setData('specs', newSpecs);
    };

    const loadMobileTemplate = () => {
        if (data.specs.length > 0 && !confirm('This will replace your current specs with the mobile template. Continue?')) return;
        
        const template = [
            { spec_group: 'General Features', spec_key: 'Release Date', spec_value: '' },
            { spec_group: 'General Features', spec_key: 'SIM Support', spec_value: 'Dual Sim' },
            { spec_group: 'General Features', spec_key: 'Phone Dimensions', spec_value: '' },
            { spec_group: 'General Features', spec_key: 'Phone Weight', spec_value: '' },
            { spec_group: 'General Features', spec_key: 'Operating System', spec_value: '' },
            { spec_group: 'Display', spec_key: 'Screen Size', spec_value: '' },
            { spec_group: 'Display', spec_key: 'Screen Resolution', spec_value: '' },
            { spec_group: 'Display', spec_key: 'Screen Type', spec_value: 'AMOLED' },
            { spec_group: 'Display', spec_key: 'Screen Protection', spec_value: '' },
            { spec_group: 'Memory', spec_key: 'Internal Memory', spec_value: '256GB' },
            { spec_group: 'Memory', spec_key: 'RAM', spec_value: '8GB' },
            { spec_group: 'Memory', spec_key: 'Card Slot', spec_value: 'N/A' },
            { spec_group: 'Performance', spec_key: 'Processor', spec_value: '' },
            { spec_group: 'Performance', spec_key: 'GPU', spec_value: '' },
            { spec_group: 'Battery', spec_key: 'Type', spec_value: '' },
            { spec_group: 'Camera', spec_key: 'Front Camera', spec_value: '' },
            { spec_group: 'Camera', spec_key: 'Front Flash Light', spec_value: 'No' },
            { spec_group: 'Camera', spec_key: 'Front Video Recording', spec_value: 'Yes' },
            { spec_group: 'Camera', spec_key: 'Back Flash Light', spec_value: 'Yes' },
            { spec_group: 'Camera', spec_key: 'Back Camera', spec_value: '' },
            { spec_group: 'Camera', spec_key: 'Back Video Recording', spec_value: 'Yes' },
            { spec_group: 'Connectivity', spec_key: 'Bluetooth', spec_value: 'Yes' },
            { spec_group: 'Connectivity', spec_key: '3G', spec_value: 'Yes' },
            { spec_group: 'Connectivity', spec_key: '4G/LTE', spec_value: 'Yes' },
            { spec_group: 'Connectivity', spec_key: '5G', spec_value: 'Yes' },
            { spec_group: 'Connectivity', spec_key: 'Radio', spec_value: 'N/A' },
            { spec_group: 'Connectivity', spec_key: 'WiFi', spec_value: 'Yes' },
            { spec_group: 'Connectivity', spec_key: 'NFC', spec_value: 'Yes' },
        ];
        setData('specs', template);
    };

    const saveSpecs = (e) => {
        e.preventDefault();
        put(route('products.specs.bulk', product.id), {
            preserveScroll: true,
            preserveState: true
        });
    };

    return (
        <form onSubmit={saveSpecs} className="space-y-6">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-zinc-700/50 p-6 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div>
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Technical Specifications</h3>
                    <p className="text-sm text-slate-500">Add detailed specs. Use groups like "Display" or "Memory" to categorize them.</p>
                </div>
                <div className="flex gap-3">
                    <Button type="button" variant="outline" onClick={loadMobileTemplate} className="border-slate-300 dark:border-ink-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700">
                        <ImagePlus className="w-4 h-4 mr-2" /> Load Mobile Template
                    </Button>
                    <Button type="button" onClick={addSpec} className="bg-slate-900 hover:bg-slate-800 dark:bg-ink-100 dark:hover:bg-white dark:text-slate-900">
                        <Plus className="w-4 h-4 mr-2" /> Add Spec Line
                    </Button>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-ink-700">
                    <thead className="bg-slate-50 dark:bg-zinc-700/50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-1/4">Group (Optional)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase w-1/4">Key (e.g. RAM)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Value</th>
                            <th className="px-4 py-3 w-12"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-ink-700">
                        {data.specs.length === 0 && (
                            <tr>
                                <td colSpan="4" className="px-6 py-12 text-center">
                                    <div className="text-sm text-slate-500 mb-4">No specifications added yet.</div>
                                    <Button type="button" onClick={loadMobileTemplate} className="bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white">
                                        Start with Mobile Template
                                    </Button>
                                </td>
                            </tr>
                        )}
                        {data.specs.map((spec, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-zinc-700/30 group">
                                <td className="px-4 py-2">
                                    <TextInput 
                                        value={spec.spec_group || ''} 
                                        onChange={e => updateSpec(i, 'spec_group', e.target.value)} 
                                        placeholder="e.g. Display"
                                        className="w-full text-sm border-transparent focus:border-blue-500 hover:border-slate-300 dark:hover:border-ink-600 bg-transparent py-1.5" 
                                    />
                                </td>
                                <td className="px-4 py-2 border-l border-zinc-100 dark:border-zinc-700">
                                    <TextInput 
                                        value={spec.spec_key} 
                                        onChange={e => updateSpec(i, 'spec_key', e.target.value)} 
                                        placeholder="Key"
                                        className="w-full text-sm font-semibold border-transparent focus:border-blue-500 hover:border-slate-300 dark:hover:border-ink-600 bg-transparent py-1.5" 
                                        required
                                    />
                                </td>
                                <td className="px-4 py-2 border-l border-zinc-100 dark:border-zinc-700">
                                    <TextInput 
                                        value={spec.spec_value} 
                                        onChange={e => updateSpec(i, 'spec_value', e.target.value)} 
                                        placeholder="Value"
                                        className="w-full text-sm border-transparent focus:border-blue-500 hover:border-slate-300 dark:hover:border-ink-600 bg-transparent py-1.5" 
                                    />
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button type="button" onClick={() => removeSpec(i)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.specs.length > 0 && (
                <div className="flex justify-end pt-4 border-t border-zinc-200 dark:border-zinc-700">
                    <Button type="submit" disabled={processing} className="bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white font-semibold py-2.5 px-8 rounded-xl shadow-lg ">
                        {processing ? 'Saving...' : 'Save Specifications'}
                    </Button>
                </div>
            )}
        </form>
    );
}
