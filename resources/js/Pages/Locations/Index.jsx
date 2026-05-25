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
    MapPin, 
    Trash2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export default function Index({ locations, filters, can }) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    
    // Sheet modal states
    const [isOpen, setIsOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        code: '',
        name: '',
        address: '',
        is_active: true
    });

    const handleFilterChange = (newSearch, newStatus) => {
        router.get(route('locations.index'), {
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
        setEditingLocation(null);
        setData({ code: '', name: '', address: '', is_active: true });
        setIsOpen(true);
    };

    const openEditSheet = (location) => {
        clearErrors();
        setEditingLocation(location);
        setData({
            code: location.code,
            name: location.name,
            address: location.address || '',
            is_active: !!location.is_active
        });
        setIsOpen(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        if (editingLocation) {
            put(route('locations.update', editingLocation.id), {
                onSuccess: () => setIsOpen(false)
            });
        } else {
            post(route('locations.store'), {
                onSuccess: () => {
                    setIsOpen(false);
                    reset();
                }
            });
        }
    };

    const handleDelete = (location) => {
        if (confirm(`Are you sure you want to delete the location "${location.code}" (${location.name})?`)) {
            destroy(route('locations.destroy', location.id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Locations" />

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Locations</h1>
                    <p className="text-sm text-slate-500 mt-1">Manage physical storage facilities, warehouses, and store outlets.</p>
                </div>
                {can.create && (
                    <Button 
                        onClick={openCreateSheet}
                        className="bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto"
                    >
                        <Plus className="h-4.5 w-4.5" />
                        <span>Add Location</span>
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
                            placeholder="Search locations by code or name..."
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

            {/* Locations Table Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500 sticky top-0 z-10">
                                <th className="px-6 py-4">Code</th>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Address</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {locations.data.length > 0 ? (
                                locations.data.map((location) => (
                                    <tr key={location.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">
                                                {location.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-semibold text-slate-900 text-sm">{location.name}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-500 line-clamp-1 max-w-[260px]" title={location.address}>
                                                {location.address || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {location.is_active ? (
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
                                                        onClick={() => openEditSheet(location)}
                                                        className="hover:bg-slate-100 text-slate-600 rounded-xl"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {can.delete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(location)}
                                                        className="hover:bg-red-50 text-red-600 rounded-xl"
                                                        title="Delete location"
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
                                                <MapPin className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-base font-bold text-slate-900">No locations found</h3>
                                            <p className="text-xs text-slate-500 mt-1 text-center leading-relaxed">
                                                Try adjusting your search criteria, clearing filters, or adding a new location.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination */}
                {locations.links && locations.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-xs text-slate-500">
                            Showing <span className="font-semibold text-slate-800">{locations.from}</span> to{' '}
                            <span className="font-semibold text-slate-800">{locations.to}</span> of{' '}
                            <span className="font-semibold text-slate-800">{locations.total}</span> entries
                        </span>
                        <div className="flex gap-1.5">
                            {locations.links.map((link, idx) => {
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
                            {editingLocation ? 'Edit Location' : 'Add Location'}
                        </SheetTitle>
                        <SheetDescription className="text-xs text-slate-500">
                            Configure physical warehousing parameters and logistics address details.
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col justify-between">
                        <div className="space-y-5">
                            <div>
                                <InputLabel htmlFor="code" value="Location Code" className="text-slate-700 font-semibold mb-1.5" />
                                <TextInput
                                    id="code"
                                    type="text"
                                    name="code"
                                    value={data.code}
                                    className="block w-full bg-slate-50/50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm font-mono"
                                    onChange={(e) => setData('code', e.target.value.toUpperCase())}
                                    placeholder="e.g. WH-01"
                                    isFocused={!editingLocation}
                                    disabled={!!editingLocation}
                                />
                                <InputError message={errors.code} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div>
                                <InputLabel htmlFor="name" value="Location Name" className="text-slate-700 font-semibold mb-1.5" />
                                <TextInput
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    className="block w-full bg-slate-50/50 border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm"
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Main Warehouse Outlet"
                                    isFocused={!!editingLocation}
                                />
                                <InputError message={errors.name} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            <div>
                                <InputLabel htmlFor="address" value="Street Address" className="text-slate-700 font-semibold mb-1.5" />
                                <textarea
                                    id="address"
                                    name="address"
                                    value={data.address}
                                    rows="3"
                                    className="block w-full bg-slate-50/50 border border-slate-200 text-slate-900 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 text-sm shadow-sm transition"
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="e.g. 102 Logistics Boulevard, Section 4"
                                />
                                <InputError message={errors.address} className="mt-1.5 text-xs text-rose-500" />
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
                                            Deactivated locations won't display in standard stock routing selections.
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
                                    <span>{editingLocation ? 'Save Changes' : 'Create'}</span>
                                )}
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </AuthenticatedLayout>
    );
}
