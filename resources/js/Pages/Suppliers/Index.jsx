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
    UserCheck, 
    Trash2,
    Mail,
    Phone,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function Index({ suppliers, filters, can }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    
    // Sheet modal states
    const [isOpen, setIsOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        is_active: true
    });

    const handleFilterChange = (newSearch, newStatus) => {
        router.get(route('suppliers.index'), {
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
        setEditingSupplier(null);
        setData({ name: '', email: '', phone: '', address: '', notes: '', is_active: true });
        setIsOpen(true);
    };

    const openEditSheet = (supplier) => {
        clearErrors();
        setEditingSupplier(supplier);
        setData({
            name: supplier.name,
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            notes: supplier.notes || '',
            is_active: !!supplier.is_active
        });
        setIsOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (editingSupplier) {
            put(route('suppliers.update', editingSupplier.id), {
                onSuccess: () => setIsOpen(false)
            });
        } else {
            post(route('suppliers.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (supplier) => {
        if (confirm(`Are you sure you want to delete the supplier "${supplier.name}"?`)) {
            destroy(route('suppliers.destroy', supplier.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Suppliers" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Suppliers</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage vendor relations, contact info, and active supply partners.</p>
                </div>
                {can.create && (
                    <Button 
                        onClick={openCreateSheet}
                        className="bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto"
                    >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Add Supplier</span>
                    </Button>
                )}
            </div>

            {/* Filter controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-sm">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <TextInput
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                handleFilterChange(e.target.value, status);
                            }}
                            placeholder="Search suppliers by name, email, or phone..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <select
                            value={status}
                            onChange={(e) => {
                                setStatus(e.target.value);
                                handleFilterChange(search, e.target.value);
                            }}
                            className="w-full md:w-44 px-3 py-2.5 bg-white border border-slate-200 text-sm focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </form>
            </div>

            {/* Suppliers Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 sticky top-0 z-10">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Contact info</th>
                                <th className="px-6 py-4">Address</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {suppliers.data.length > 0 ? (
                                suppliers.data.map((supplier) => (
                                    <tr key={supplier.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-900 text-sm">{supplier.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 text-xs">
                                                {supplier.email && (
                                                    <span className="flex items-center gap-1.5 text-slate-600">
                                                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                                                        {supplier.email}
                                                    </span>
                                                )}
                                                {supplier.phone && (
                                                    <span className="flex items-center gap-1.5 text-slate-600">
                                                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                        {supplier.phone}
                                                    </span>
                                                )}
                                                {!supplier.email && !supplier.phone && (
                                                    <span className="text-slate-400 italic">No contact details</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-500 line-clamp-1 max-w-[200px]" title={supplier.address}>
                                                {supplier.address || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {supplier.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-500 border border-slate-200">
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
                                                        onClick={() => openEditSheet(supplier)}
                                                        className="hover:bg-slate-100 text-slate-600 rounded-xl"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {can.delete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(supplier)}
                                                        className="hover:bg-red-50 text-red-600 rounded-xl"
                                                        title="Delete supplier"
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
                                    <td colSpan="5" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="p-4 bg-slate-100 rounded-full text-slate-400 mb-4">
                                                <UserCheck className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-base font-bold text-slate-900">No suppliers found</h3>
                                            <p className="text-xs text-slate-500 mt-1 text-center leading-relaxed">
                                                Try adjusting your search criteria, clearing filters, or adding a new supplier.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination */}
                {suppliers.links && suppliers.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-xs text-slate-500">
                            Showing <span className="font-semibold text-slate-800">{suppliers.from}</span> to{' '}
                            <span className="font-semibold text-slate-800">{suppliers.to}</span> of{' '}
                            <span className="font-semibold text-slate-800">{suppliers.total}</span> entries
                        </span>
                        <div className="flex gap-1.5">
                            {suppliers.links.map((link, idx) => {
                                if (link.url === null) return null;
                                
                                let label = link.label;
                                if (label.includes('Previous')) {
                                    return (
                                        <Button
                                            key={idx}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100"
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
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100"
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
                <SheetContent side="right" className="w-full sm:max-w-md bg-white p-6 border-l border-slate-200 shadow-2xl flex flex-col h-full z-50">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-lg font-bold text-slate-900">
                            {editingSupplier ? 'Edit Supplier' : 'Add Supplier'}
                        </SheetTitle>
                        <SheetDescription className="text-xs text-slate-500">
                            Maintain accurate logistics pathways and procurement coordinate channels.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between">
                        <div className="space-y-4 overflow-y-auto pr-1 flex-1 mb-4">
                            <div>
                                <InputLabel htmlFor="name" value="Supplier / Company Name" className="text-slate-700 font-semibold mb-1.5" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="block w-full bg-slate-50/50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Globex Global Logistics"
                                    isFocused={true}
                                />
                                <InputError message={errors.name} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div>
                                <InputLabel htmlFor="email" value="Email Address" className="text-slate-700 font-semibold mb-1.5" />
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="block w-full bg-slate-50/50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="e.g. sales@globex.com"
                                />
                                <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div>
                                <InputLabel htmlFor="phone" value="Phone Number" className="text-slate-700 font-semibold mb-1.5" />
                                <TextInput
                                    id="phone"
                                    type="text"
                                    name="phone"
                                    value={data.phone}
                                    className="block w-full bg-slate-50/50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="e.g. +1 (555) 019-2834"
                                />
                                <InputError message={errors.phone} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div>
                                <InputLabel htmlFor="address" value="Company Address" className="text-slate-700 font-semibold mb-1.5" />
                                <textarea
                                    id="address"
                                    name="address"
                                    value={data.address}
                                    rows="2"
                                    className="block w-full bg-slate-50/50 border border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-sm transition"
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="e.g. Suite 400, Industrial Trade Plaza"
                                />
                                <InputError message={errors.address} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div>
                                <InputLabel htmlFor="notes" value="Internal Procurement Notes" className="text-slate-700 font-semibold mb-1.5" />
                                <textarea
                                    id="notes"
                                    name="notes"
                                    value={data.notes}
                                    rows="2"
                                    className="block w-full bg-slate-50/50 border border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-sm transition"
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Provide details on typical lead times or specific dispatch parameters..."
                                />
                                <InputError message={errors.notes} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-150">
                                <label className="flex items-center cursor-pointer select-none">
                                    <Checkbox
                                        name="is_active"
                                        checked={data.is_active}
                                        className="bg-white border-slate-300 text-blue-600 focus:ring-blue-500 rounded"
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <div className="ms-3">
                                        <span className="text-sm font-semibold text-slate-900 block">Active Status</span>
                                        <span className="text-[11px] text-slate-500 mt-0.5 block leading-tight">
                                            Deactivated suppliers won't appear as options for drafting new purchase orders.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-4 flex gap-3">
                            <Button 
                                type="button" 
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 rounded-xl py-5 hover:bg-slate-50 font-semibold text-sm"
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
                                    <span>{editingSupplier ? 'Save Changes' : 'Create'}</span>
                                )}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </AuthenticatedLayout>
    );
}
