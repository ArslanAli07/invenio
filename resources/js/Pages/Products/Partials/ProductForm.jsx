import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/tabs";
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { Trash2, Star, ImagePlus, Plus } from 'lucide-react';

export default function ProductForm({ product, categories, onSuccess, onCancel }) {
    const isEditing = !!product;

    const { data, setData, post, put, processing, errors, setError, clearErrors } = useForm({
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
    });

    const [activeTab, setActiveTab] = useState('general');

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            put(route('products.update', product.id), {
                onSuccess: () => {
                    onSuccess();
                }
            });
        } else {
            post(route('products.store'), {
                onSuccess: () => {
                    onSuccess();
                }
            });
        }
    };

    const checkSkuUniqueness = async (e) => {
        const sku = e.target.value;
        if (!sku) return;
        
        if (isEditing && product.sku === sku) {
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
                    ignore_id: isEditing ? product.id : null 
                })
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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-4 mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="images" disabled={!isEditing}>Images</TabsTrigger>
                    <TabsTrigger value="variants" disabled={!isEditing}>Variants</TabsTrigger>
                    <TabsTrigger value="specs" disabled={!isEditing}>Specs</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="flex-1 overflow-y-auto pr-1 min-h-0 mt-0 data-[state=inactive]:hidden">
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
                            />
                            <InputError message={errors.name} className="mt-1.5 text-xs" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="price" value="Base Price (PKR)" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                <TextInput
                                    id="price"
                                    type="number"
                                    value={data.price}
                                    className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 rounded-xl px-4 py-2.5 text-sm"
                                    onChange={(e) => setData('price', e.target.value)}
                                    placeholder="0.00"
                                />
                                <InputError message={errors.price} className="mt-1.5 text-xs" />
                            </div>
                            <div>
                                <InputLabel htmlFor="category_id" value="Category" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 rounded-xl px-4 py-2.5 text-sm"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.category_id} className="mt-1.5 text-xs" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel htmlFor="unit" value="Unit" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                <TextInput
                                    id="unit"
                                    type="text"
                                    value={data.unit}
                                    className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 rounded-xl px-4 py-2.5 text-sm"
                                    onChange={(e) => setData('unit', e.target.value)}
                                />
                                <InputError message={errors.unit} className="mt-1.5 text-xs" />
                            </div>
                            <div>
                                <InputLabel htmlFor="reorder_level" value="Reorder Level" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                <TextInput
                                    id="reorder_level"
                                    type="number"
                                    value={data.reorder_level}
                                    className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 rounded-xl px-4 py-2.5 text-sm"
                                    onChange={(e) => setData('reorder_level', parseInt(e.target.value) || 0)}
                                />
                                <InputError message={errors.reorder_level} className="mt-1.5 text-xs" />
                            </div>
                        </div>

                        <div>
                            <InputLabel htmlFor="short_description" value="Short Description" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                            <textarea
                                id="short_description"
                                value={data.short_description}
                                rows="2"
                                className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 rounded-xl px-4 py-2.5 text-sm"
                                onChange={(e) => setData('short_description', e.target.value)}
                                placeholder="Brief overview for product cards..."
                            />
                            <InputError message={errors.short_description} className="mt-1.5 text-xs" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Full Description" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                            <textarea
                                id="description"
                                value={data.description}
                                rows="4"
                                className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 rounded-xl px-4 py-2.5 text-sm"
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Detailed description..."
                            />
                            <InputError message={errors.description} className="mt-1.5 text-xs" />
                        </div>

                        <div className="space-y-3">
                            <div className="bg-slate-50/50 dark:bg-ink-800/30 rounded-xl p-4 border border-slate-200 dark:border-ink-700">
                                <label className="flex items-center cursor-pointer select-none">
                                    <Checkbox
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="bg-white border-slate-300 text-blue-600 focus:ring-blue-500 rounded"
                                    />
                                    <div className="ms-3">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-ink-100 block">Active Status</span>
                                        <span className="text-[11px] text-slate-500 mt-0.5 block">Allow purchasing and inventory adjustments.</span>
                                    </div>
                                </label>
                            </div>
                            <div className="bg-slate-50/50 dark:bg-ink-800/30 rounded-xl p-4 border border-slate-200 dark:border-ink-700">
                                <label className="flex items-center cursor-pointer select-none">
                                    <Checkbox
                                        checked={data.show_on_store}
                                        onChange={(e) => setData('show_on_store', e.target.checked)}
                                        className="bg-white border-slate-300 text-blue-600 focus:ring-blue-500 rounded"
                                    />
                                    <div className="ms-3">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-ink-100 block">Show on Storefront</span>
                                        <span className="text-[11px] text-slate-500 mt-0.5 block">Make this product visible to public customers.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </form>
                </TabsContent>

                {isEditing && (
                    <>
                        <TabsContent value="images" className="flex-1 overflow-y-auto pr-1 min-h-0 mt-0 data-[state=inactive]:hidden">
                            <ImageManager product={product} />
                        </TabsContent>

                        <TabsContent value="variants" className="flex-1 overflow-y-auto pr-1 min-h-0 mt-0 data-[state=inactive]:hidden">
                            <VariantManager product={product} />
                        </TabsContent>

                        <TabsContent value="specs" className="flex-1 overflow-y-auto pr-1 min-h-0 mt-0 data-[state=inactive]:hidden">
                            <SpecManager product={product} />
                        </TabsContent>
                    </>
                )}
            </Tabs>

            <div className="border-t border-slate-100 dark:border-ink-700 pt-4 flex gap-3 mt-4 shrink-0">
                <Button 
                    type="button" 
                    variant="outline"
                    onClick={onCancel}
                    className="flex-1 rounded-xl py-5 font-semibold text-sm"
                >
                    Close
                </Button>
                {activeTab === 'general' && (
                    <Button
                        type="submit"
                        form="general-form"
                        disabled={processing}
                        className="flex-1 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold rounded-xl py-5"
                    >
                        {processing ? 'Saving...' : (isEditing ? 'Save Details' : 'Create Product')}
                    </Button>
                )}
            </div>
        </div>
    );
}

// ---------------------------------------------------------
// Sub-components for Tabs
// ---------------------------------------------------------

function ImageManager({ product }) {
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

    const deleteImage = (image) => {
        if (!confirm('Delete this image?')) return;
        router.delete(route('products.images.destroy', [product.id, image.id]), {
            preserveScroll: true, preserveState: true
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-ink-100">Product Images</h3>
                <div>
                    <input type="file" id="imageUpload" className="hidden" accept="image/*" onChange={handleUpload} />
                    <Button variant="outline" size="sm" className="h-8 rounded-lg" onClick={() => document.getElementById('imageUpload').click()}>
                        <ImagePlus className="w-4 h-4 mr-1.5" /> Upload Image
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {product.images?.length === 0 && (
                    <div className="col-span-2 text-center py-8 text-sm text-slate-500 border-2 border-dashed border-slate-200 dark:border-ink-700 rounded-xl">
                        No images uploaded yet.
                    </div>
                )}
                {product.images?.map(img => (
                    <div key={img.id} className={`relative group rounded-xl border-2 overflow-hidden ${img.is_primary ? 'border-blue-500' : 'border-slate-200 dark:border-ink-700'}`}>
                        <img src={`/storage/${img.path}`} alt="Product" className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {!img.is_primary && (
                                <button onClick={() => setPrimary(img)} className="p-1.5 bg-white rounded-full text-slate-700 hover:text-blue-600" title="Set Primary">
                                    <Star className="w-4 h-4" />
                                </button>
                            )}
                            <button onClick={() => deleteImage(img)} className="p-1.5 bg-white rounded-full text-slate-700 hover:text-rose-600" title="Delete">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        {img.is_primary && (
                            <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
                                PRIMARY
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function VariantManager({ product }) {
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
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-ink-100 mb-2">Manage Variants</h3>
            
            <form onSubmit={addVariant} className="flex gap-2 items-start mb-4 bg-slate-50 dark:bg-ink-800/50 p-3 rounded-xl border border-slate-200 dark:border-ink-700">
                <div className="flex-1 space-y-2">
                    <TextInput placeholder="Name (e.g. 256GB Gold)" value={data.name} onChange={e => setData('name', e.target.value)} className="w-full text-sm h-8 rounded-lg" required />
                    <div className="flex gap-2">
                        <TextInput placeholder="SKU" value={data.sku} onChange={e => setData('sku', e.target.value)} className="w-full text-sm h-8 rounded-lg font-mono" required />
                        <TextInput placeholder="Price (+/-)" value={data.price} onChange={e => setData('price', e.target.value)} className="w-full text-sm h-8 rounded-lg" type="number" step="0.01" />
                    </div>
                </div>
                <Button type="submit" disabled={processing} size="sm" className="h-18 rounded-lg bg-blue-600 shrink-0">
                    <Plus className="w-4 h-4" />
                </Button>
            </form>

            <div className="space-y-2">
                {product.variants?.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No variants added.</p>}
                {product.variants?.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-2.5 bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-700 rounded-lg text-sm">
                        <div>
                            <div className="font-semibold text-slate-900 dark:text-ink-100">{v.name}</div>
                            <div className="text-xs font-mono text-slate-500">{v.sku}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-600 dark:text-ink-300 font-medium">{v.price ? `Rs ${v.price}` : 'Base Price'}</span>
                            <button onClick={() => deleteVariant(v)} className="text-slate-400 hover:text-rose-500">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function SpecManager({ product }) {
    const { data, setData, post, processing, reset } = useForm({
        spec_key: '',
        spec_value: ''
    });

    const addSpec = (e) => {
        e.preventDefault();
        post(route('products.specs.store', product.id), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => reset()
        });
    };

    const deleteSpec = (spec) => {
        router.delete(route('products.specs.destroy', [product.id, spec.id]), {
            preserveScroll: true, preserveState: true
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-ink-100 mb-2">Technical Specs</h3>
            
            <form onSubmit={addSpec} className="flex gap-2 items-center bg-slate-50 dark:bg-ink-800/50 p-3 rounded-xl border border-slate-200 dark:border-ink-700">
                <TextInput placeholder="Key (e.g. RAM)" value={data.spec_key} onChange={e => setData('spec_key', e.target.value)} className="w-1/3 text-sm h-8 rounded-lg" required />
                <TextInput placeholder="Value (e.g. 8GB LPDDR5)" value={data.spec_value} onChange={e => setData('spec_value', e.target.value)} className="flex-1 text-sm h-8 rounded-lg" required />
                <Button type="submit" disabled={processing} size="sm" className="h-8 w-8 p-0 rounded-lg shrink-0">
                    <Plus className="w-4 h-4" />
                </Button>
            </form>

            <div className="space-y-1 bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-700 rounded-lg overflow-hidden">
                {product.specs?.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No specs added.</p>}
                {product.specs?.map((spec, i) => (
                    <div key={spec.id} className={`flex items-center justify-between p-2.5 text-sm ${i !== 0 ? 'border-t border-slate-100 dark:border-ink-700' : ''}`}>
                        <div className="flex gap-4">
                            <span className="font-semibold text-slate-700 dark:text-ink-200 w-24 truncate">{spec.spec_key}</span>
                            <span className="text-slate-600 dark:text-ink-300">{spec.spec_value}</span>
                        </div>
                        <button onClick={() => deleteSpec(spec)} className="text-slate-400 hover:text-rose-500 ml-2">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
