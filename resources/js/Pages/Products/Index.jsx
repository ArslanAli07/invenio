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
    ChevronRight,
    Store
} from 'lucide-react';
import ProductForm from './Partials/ProductForm';

export default function Index({ products, brands, filters, can }) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryId, setCategoryId] = useState(filters.category_id || '');
    const [status, setStatus] = useState(filters.status || 'all');
    
    const [isOpen, setIsOpen] = useState(false);

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

    const openCreateSheet = () => {
        setIsOpen(true);
    };

    const handleSuccess = () => {
        setIsOpen(false);
    };

    const deleteProduct = (product) => {
        if (confirm('Are you sure you want to delete this product?')) {
            router.delete(route('products.destroy', product.id));
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
                            <option value="">All Brands</option>
                            {brands.map((cat) => (
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

            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/75 dark:bg-ink-800/50 border-b border-slate-200 dark:border-ink-700 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-ink-400 sticky top-0 z-10">
                                <th className="px-6 py-4 font-semibold text-slate-500 dark:text-ink-400 w-[30%]">Product</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 dark:text-ink-400 w-[15%]">SKU</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 dark:text-ink-400 text-right w-[15%]">Price</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 dark:text-ink-400 text-right w-[15%]">Stock</th>
                                <th className="px-6 py-4 font-semibold text-slate-500 dark:text-ink-400 text-center w-[15%]">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-600 dark:text-ink-300 text-right w-[10%]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-ink-750">
                            {products.data.length > 0 ? (
                                products.data.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 dark:hover:bg-ink-800/40 transition-colors">
                                        <td className="px-6 py-4 align-top">
                                            <div className="flex items-center gap-3">
                                                {product.primary_image && product.primary_image.length > 0 ? (
                                                    <img src={`/storage/${product.primary_image[0].path}`} alt={product.name} className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-ink-700 shadow-sm shrink-0" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-ink-800 border border-slate-200 dark:border-ink-700 flex items-center justify-center shrink-0">
                                                        <Package className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-ink-100">{product.name}</div>
                                                    <div className="text-xs text-slate-500">{product.category.name}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 align-top">
                                            <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded border border-blue-100/50 dark:border-blue-500/20 whitespace-nowrap">
                                                {product.sku}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            <div className="font-medium text-slate-900 dark:text-ink-100">
                                                {product.price ? `Rs ${product.price}` : '-'}
                                            </div>
                                            {product.variants?.length > 0 && (
                                                <div className="text-[10px] text-slate-500 uppercase mt-0.5">{product.variants.length} Variants</div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 align-top text-right">
                                            <span className="font-bold text-sm text-slate-800 dark:text-ink-200">
                                                {product.global_stock ?? 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 align-top text-center">
                                            <div className="flex flex-col items-center gap-1.5">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                                    product.is_active 
                                                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20' 
                                                        : 'bg-slate-50 dark:bg-ink-800 text-slate-600 dark:text-ink-300 border-slate-200 dark:border-ink-700'
                                                }`}>
                                                    {product.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                                {product.show_on_store && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400">
                                                        <Store className="w-3 h-3" />
                                                        Store
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={route('products.show', product.id)}
                                                    className="inline-flex items-center justify-center p-2 hover:bg-slate-100 dark:hover:bg-ink-750 text-slate-600 dark:text-ink-400 rounded-xl transition-colors"
                                                    title="Manage Product"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Link>
                                                {can.delete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteProduct(product)}
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
                                    <td colSpan="6" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="p-4 bg-slate-100 dark:bg-ink-800 rounded-full text-slate-400 dark:text-slate-500 mb-4">
                                                <Package className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-ink-100">No products found</h3>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

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
                            Add Product
                        </SheetTitle>
                        <SheetDescription className="text-xs text-slate-500">
                            Create a new product. You can add images, variants, and details after creation.
                        </SheetDescription>
                    </SheetHeader>

                    <ProductForm 
                        brands={brands} 
                        onSuccess={handleSuccess} 
                        onCancel={() => setIsOpen(false)} 
                    />
                </SheetContent>
            </Sheet>
        </AuthenticatedLayout>
    );
}
