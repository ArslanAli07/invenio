import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription 
} from "@/Components/ui/sheet";
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import { 
    Plus, 
    Search, 
    Edit2, 
    Package, 
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function Index({ products, categories, filters, can }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [status, setStatus] = useState(filters.status || 'all');
    
    // Sheet modal states
    const [isOpen, setIsOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);

    const { data, setData, post, put, delete: destroy, setError, clearErrors, processing, errors, reset } = useForm({
        sku: '',
        name: '',
        description: '',
        unit: 'pcs',
        category_id: '',
        reorder_level: 10,
        is_active: true
    });

    const handleFilterChange = (newSearch, newCatId, newStatus) => {
        router.get(route('products.index'), {
            search: newSearch,
            category_id: newCatId,
            status: newStatus
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange(search, categoryId, status);
    };

    const checkSkuUniqueness = async (e) => {
        const sku = e.target.value;
        if (!sku) return;
        
        // If editing and SKU hasn't changed, skip check
        if (editingProduct && editingProduct.sku === sku) {
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
                    ignore_id: editingProduct ? editingProduct.id : null 
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

    const openCreateSheet = () => {
        clearErrors();
        reset();
        setEditingProduct(null);
        setData({
            sku: '',
            name: '',
            description: '',
            unit: 'pcs',
            category_id: categories[0]?.id || '',
            reorder_level: 10,
            is_active: true
        });
        setIsOpen(true);
    };

    const openEditSheet = (product) => {
        clearErrors();
        setEditingProduct(product);
        setData({
            sku: product.sku,
            name: product.name,
            description: product.description || '',
            unit: product.unit || 'pcs',
            category_id: product.category_id || '',
            reorder_level: product.reorder_level || 0,
            is_active: !!product.is_active
        });
        setIsOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (editingProduct) {
            put(route('products.update', editingProduct.id), {
                onSuccess: () => setIsOpen(false)
            });
        } else {
            post(route('products.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (product) => {
        if (confirm(`Are you sure you want to delete product "${product.sku}"?`)) {
            destroy(route('products.destroy', product.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Products" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-ink-100">Products</h1>
                    <p className="text-sm text-slate-500 dark:text-ink-400 mt-1">Manage global inventory items, dynamic levels, and SKU catalogs.</p>
                </div>
                {can.create && (
                    <Button 
                        onClick={openCreateSheet}
                        className="bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto"
                    >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Add Product</span>
                    </Button>
                )}
            </div>

            {/* Filter controls */}
            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 p-4 mb-6 shadow-sm">
                <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full lg:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <TextInput
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleFilterChange(e.target.value, categoryId, status);
                            }}
                            placeholder="Search products by SKU or name..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <select
                            value={categoryId}
                            onChange={(e) => {
                                setCategoryId(e.target.value);
                                handleFilterChange(search, e.target.value, status);
                            }}
                            className="w-full sm:w-48 px-3 py-2.5 bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-700 dark:text-ink-200 text-sm focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>

                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                handleFilterChange(search, categoryId, e.target.value);
                            }}
                            className="w-full sm:w-44 px-3 py-2.5 bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-700 dark:text-ink-200 text-sm focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </form>
            </div>

            {/* Products Table Card */}
            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/75 dark:bg-ink-800/50 border-b border-slate-200 dark:border-ink-700 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-ink-400 sticky top-0 z-10">
                                <th className="px-6 py-4">SKU</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Current Stock</th>
                                <th className="px-6 py-4">Reorder Level</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-ink-750">
                            {products.data.length > 0 ? (
                                products.data.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-ink-800/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-100/50 dark:border-blue-500/20 whitespace-nowrap">
                                                {product.sku}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-slate-900 dark:text-ink-100 text-sm">{product.name}</span>
                                                <span className="text-[10px] text-slate-400 dark:text-ink-400 capitalize mt-0.5">unit: {product.unit}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-medium text-slate-600 dark:text-ink-400">
                                                {product.category?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-sm text-slate-800 dark:text-ink-200">
                                                {product.global_stock ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold text-slate-500">
                                                {product.reorder_level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {product.is_low_stock ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                                                    </span>
                                                    Low Stock
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    In Stock
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('products.show', product.id)}
                                                    className="inline-flex items-center justify-center p-2 hover:bg-slate-100 dark:hover:bg-ink-750 text-slate-600 dark:text-ink-400 rounded-xl transition-colors"
                                                    title="View stock breakdown"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                                {can.update && (
                                                    <Button 
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditSheet(product)}
                                                        className="hover:bg-slate-100 dark:hover:bg-ink-750 text-slate-600 dark:text-ink-400 rounded-xl"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {can.delete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(product)}
                                                        className="hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 rounded-xl"
                                                        title="Delete product"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="p-4 bg-slate-100 dark:bg-ink-800 rounded-full text-slate-400 dark:text-slate-500 mb-4">
                                                <Package className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-ink-100">No products found</h3>
                                            <p className="text-xs text-slate-500 dark:text-ink-400 mt-1 text-center leading-relaxed">
                                                Try adjusting search parameters, clearing filters, or adding a new SKU.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination */}
                {products.links && products.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-ink-700 flex items-center justify-between bg-slate-50/50 dark:bg-ink-800/30">
                        <span className="text-xs text-slate-500 dark:text-ink-400">
                            Showing <span className="font-semibold text-slate-800 dark:text-ink-200">{products.from}</span> to{' '}
                            <span className="font-semibold text-slate-800 dark:text-ink-200">{products.to}</span> of{' '}
                            <span className="font-semibold text-slate-800 dark:text-ink-200">{products.total}</span> entries
                        </span>
                        <div className="flex gap-1.5">
                            {products.links.map((link, idx) => {
                                if (link.url === null) return null;
                                
                                let label = link.label;
                                if (label.includes('Previous')) {
                                    return (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-ink-750 dark:border-ink-650 dark:text-ink-200"
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                            <span>Previous</span>
                                        </Button>
                                    );
                                }
                                if (label.includes('Next')) {
                                    return (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-ink-750 dark:border-ink-650 dark:text-ink-200"
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}
                                        >
                                            <span>Next</span>
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    );
                                }

                                return (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        className={`rounded-xl h-9 w-9 p-0 ${
                                            link.active ? 'bg-[#1B4FD8] hover:bg-blue-700' : 'hover:bg-slate-100'
                                        }`}
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}
                                    >
                                        {label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Slide-over Create / Edit Panel */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md bg-white dark:bg-ink-900 p-6 border-l border-slate-200 dark:border-ink-700 shadow-2xl flex flex-col h-full overflow-hidden z-50">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-lg font-bold text-slate-900 dark:text-ink-100">
                            {editingProduct ? 'Edit Product' : 'Add Product'}
                        </SheetTitle>
                        <SheetDescription className="text-xs text-slate-500">
                            Draft a new item in the catalog. Includes instant blur SKU validation checks.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0">
                        <div className="space-y-4 flex-1 overflow-y-auto pr-1 mb-4 min-h-0">
                            <div>
                                <InputLabel htmlFor="sku" value="Product SKU" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                <TextInput
                                    id="sku"
                                    type="text"
                                    name="sku"
                                    value={data.sku}
                                    className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm font-mono uppercase"
                                    onChange={(e) => setData('sku', e.target.value.toUpperCase())}
                                    onBlur={checkSkuUniqueness}
                                    placeholder="e.g. ELEC-010"
                                    isFocused={!editingProduct}
                                    disabled={!!editingProduct}
                                />
                                <InputError message={errors.sku} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div>
                                <InputLabel htmlFor="name" value="Product Name" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. 7-Port HighSpeed USB Hub"
                                />
                                <InputError message={errors.name} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <InputLabel htmlFor="unit" value="Unit" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                    <TextInput
                                        id="unit"
                                        type="text"
                                        name="unit"
                                        value={data.unit}
                                        className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                                        onChange={(e) => setData('unit', e.target.value)}
                                        placeholder="e.g. pcs, box"
                                    />
                                    <InputError message={errors.unit} className="mt-1.5 text-xs text-rose-500" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="reorder_level" value="Reorder Level" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                    <TextInput
                                        id="reorder_level"
                                        type="number"
                                        name="reorder_level"
                                        value={data.reorder_level}
                                        className="block w-full bg-slate-50/50 dark:bg-ink-800/50 border-slate-200 dark:border-ink-700 text-slate-900 dark:text-ink-100 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                                        onChange={(e) => setData('reorder_level', parseInt(e.target.value) || 0)}
                                    />
                                    <InputError message={errors.reorder_level} className="mt-1.5 text-xs text-rose-500" />
                                </div>
                            </div>

                            <div>
                                <InputLabel htmlFor="category_id" value="Category" className="text-slate-700 dark:text-ink-200 font-semibold mb-1.5" />
                                <select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    className="block w-full bg-slate-50/50 border border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-sm transition"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                                <InputError message={errors.category_id} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div>
                                <InputLabel htmlFor="description" value="Description" className="text-slate-700 font-semibold mb-1.5" />
                                <textarea
                                    id="description"
                                    name="description"
                                    value={data.description}
                                    rows="2"
                                    className="block w-full bg-slate-50/50 border border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-sm transition"
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Enter physical SKU description details..."
                                />
                                <InputError message={errors.description} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div className="bg-slate-50/50 dark:bg-ink-800/30 rounded-xl p-4 border border-slate-200 dark:border-ink-700">
                                <label className="flex items-center cursor-pointer select-none">
                                    <Checkbox
                                        name="is_active"
                                        checked={data.is_active}
                                        className="bg-white border-slate-300 text-blue-600 focus:ring-blue-500 rounded"
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <div className="ms-3">
                                        <span className="text-sm font-semibold text-slate-900 dark:text-ink-100 block">Active Status</span>
                                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                                            Deactivated SKUs won't show in ledger adjustments or draft POs.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 dark:border-ink-700 pt-4 flex gap-3">
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 rounded-xl py-5 hover:bg-slate-50 dark:hover:bg-ink-800 dark:border-ink-650 dark:text-ink-200 font-semibold text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold rounded-xl py-5 flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
                            >
                                {processing ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <span>{editingProduct ? 'Save Changes' : 'Create'}</span>
                                )}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </AuthenticatedLayout>
    );
}
