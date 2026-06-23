import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
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
    Folder, 
    AlertTriangle, 
    Trash2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function Index({ brands, filters, can }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    
    // Sheet modal states
    const [isOpen, setIsOpen] = useState(false);
    const [editingbrand, setEditingbrand] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        is_active: true
    });

    // Handle search/filters dispatching
    const handleFilterChange = (newSearch, newStatus) => {
        router.get(route('categories.index'), {
            search: newSearch,
            status: newStatus
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange(search, status);
    };

    const openCreateSheet = () => {
        clearErrors();
        reset();
        setEditingbrand(null);
        setData({ name: '', is_active: true });
        setIsOpen(true);
    };

    const openEditSheet = (brand) => {
        clearErrors();
        setEditingbrand(brand);
        setData({
            name: brand.name,
            is_active: !!brand.is_active
        });
        setIsOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (editingbrand) {
            put(route('categories.update', editingbrand.id), {
                onSuccess: () => setIsOpen(false)
            });
        } else {
            post(route('categories.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (brand) => {
        if (confirm(`Are you sure you want to delete the brand "${brand.name}"?`)) {
            destroy(route('categories.destroy', brand.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Brands" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Brands</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Manage product Brands and groupings.</p>
                </div>
                {can.create && (
                    <Button 
                        onClick={openCreateSheet}
                        className="bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto"
                    >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Add brand</span>
                    </Button>
                )}
            </div>

            {/* Filter controls */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 mb-6 shadow-sm dark:shadow-ink-950/20">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <TextInput
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleFilterChange(e.target.value, status);
                            }}
                            placeholder="Search brands by name..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 dark:text-zinc-100 text-sm focus:border-zinc-400 focus:ring-zinc-400 rounded-xl"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                handleFilterChange(search, e.target.value);
                            }}
                            className="w-full md:w-44 px-3 py-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 dark:text-zinc-200 text-sm focus:border-zinc-400 focus:ring-zinc-400 rounded-xl"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </form>
            </div>

            {/* Brands Table Card */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm dark:shadow-ink-950/20 overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-slate-50/75 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 sticky top-0 z-10">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Associated Products</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                            {brands.data.length > 0 ? (
                                brands.data.map((brand) => (
                                    <tr key={brand.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{brand.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-md text-xs font-medium">
                                                {brand.products_count || 0} products
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {brand.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-600">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {can.update && (
                                                    <Button 
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEditSheet(brand)}
                                                        className="hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 rounded-xl"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {can.delete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(brand)}
                                                        disabled={brand.products_count > 0}
                                                        className="hover:bg-red-50 dark:hover:bg-red-500/10 text-red-600 rounded-xl disabled:opacity-30 disabled:hover:bg-transparent"
                                                        title={brand.products_count > 0 ? "Cannot delete brand with associated products" : "Delete brand"}
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
                                    <td colSpan="4" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="p-3 bg-zinc-100 dark:bg-zinc-700 rounded-md text-slate-400 dark:text-slate-500 mb-4">
                                                <Folder className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No Brands found</h3>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center leading-relaxed">
                                                Try adjusting your search criteria, clearing filters, or adding a new brand to get started.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination */}
                {brands.links && brands.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{brands.from}</span> to{' '}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{brands.to}</span> of{' '}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{brands.total}</span> entries
                        </div>
                        <div className="flex items-center space-x-1">
                            {brands.links.map((link, idx) => {
                                if (link.url === null) return null;
                                
                                // Clean up label formatting
                                let label = link.label;
                                if (label.includes('Previous')) {
                                    return (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
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
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
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
                                            link.active ? 'bg-[#6b7c5c] text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200'
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

            {/* Slide-over Create / Edit Panel using shadcn Sheet */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md bg-white dark:bg-zinc-800 p-6 border-l border-zinc-200 dark:border-zinc-700 shadow-2xl flex flex-col h-full overflow-hidden z-[210]">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            {editingbrand ? 'Edit brand' : 'Add brand'}
                        </SheetTitle>
                        <SheetDescription className="text-xs text-slate-500">
                            {editingbrand 
                                ? 'Modify details of the existing product brand.' 
                                : 'Create a brand new brand to group your products.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col min-h-0">
                        <div className="space-y-5 overflow-y-auto min-h-0">
                            <div>
                                <InputLabel htmlFor="name" value="brand Name" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm"
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Mechanical Tools"
                                    isFocused={true}
                                />
                                <InputError message={errors.name} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div className="bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4 border border-slate-150 dark:border-zinc-700">
                                <label className="flex items-center cursor-pointer select-none">
                                    <Checkbox
                                        name="is_active"
                                        checked={data.is_active}
                                        className="bg-white border-slate-300 text-blue-600 focus:ring-zinc-400 rounded"
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <div className="ms-3">
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">Active Status</span>
                                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                                            Deactivated Brands will hide their products from stock-in lists.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-zinc-100 dark:border-zinc-700/50 pt-4 flex gap-3">
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 rounded-xl py-5 hover:bg-slate-50 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200 font-semibold text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex-1 bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white font-semibold rounded-xl py-5 flex items-center justify-center gap-1.5 shadow-md "
                            >
                                {processing ? (
                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <span>{editingbrand ? 'Save Changes' : 'Create'}</span>
                                )}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </AuthenticatedLayout>
    );
}
