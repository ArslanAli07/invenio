import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    Search,
    MapPin,
    Package,
    Phone,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/Components/ui/button';

const STATUS_CONFIG = {
    pending:    { label: 'Pending',    dot: 'bg-yellow-500', class: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-100 dark:border-yellow-500/20' },
    confirmed:  { label: 'Confirmed',  dot: 'bg-blue-500',   class: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600' },
    processing: { label: 'Processing', dot: 'bg-purple-500', class: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600' },
    shipped:    { label: 'Shipped',    dot: 'bg-indigo-500', class: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600' },
    delivered:  { label: 'Delivered',  dot: 'bg-emerald-500',class: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    cancelled:  { label: 'Cancelled',  dot: 'bg-rose-500',   class: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' },
};

function StatusBadge({ status }) {
    const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${cfg.class}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

export default function Index({ orders, locations, filters }) {
    const [search, setSearch]       = useState(filters.search || '');
    const [status, setStatus]       = useState(filters.status || '');
    const [locationId, setLocationId] = useState(filters.location_id || '');

    const applyFilters = (newSearch, newStatus, newLoc) => {
        router.get(
            route('orders.index'),
            {
                search:      newSearch || undefined,
                status:      newStatus || undefined,
                location_id: newLoc    || undefined,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleSearch = (e) => {
        const val = e.target.value;
        setSearch(val);
        applyFilters(val, status, locationId);
    };

    const handleStatus = (e) => {
        const val = e.target.value;
        setStatus(val);
        applyFilters(search, val, locationId);
    };

    const handleLocation = (e) => {
        const val = e.target.value;
        setLocationId(val);
        applyFilters(search, status, val);
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setLocationId('');
        router.get(route('orders.index'), {}, { preserveState: true, replace: true });
    };

    const hasFilters = search || status || locationId;

    return (
        <AuthenticatedLayout>
            <Head title="Customer Orders" />

            {/* Page header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Customer Orders</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage B2C storefront orders and fulfillments.
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search order #, name, phone…"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400/30 placeholder-slate-400"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                        {/* Status */}
                        <select
                            value={status}
                            onChange={handleStatus}
                            className="w-full md:w-44 px-3 py-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>

                        {/* Location */}
                        <select
                            value={locationId}
                            onChange={handleLocation}
                            className="w-full md:w-48 px-3 py-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
                        >
                            <option value="">All Locations</option>
                            {locations.map((loc) => (
                                <option key={loc.id} value={loc.id}>{loc.name}</option>
                            ))}
                        </select>

                        {/* Clear */}
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-ink-100 font-semibold px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors whitespace-nowrap"
                            >
                                × Clear
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table card */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/75 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                <th className="px-6 py-4">Order #</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                            {orders.data.length > 0 ? (
                                orders.data.map((order) => (
                                    <tr key={order.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/40 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('orders.show', order.id)}
                                                className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-600 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors whitespace-nowrap"
                                            >
                                                {order.order_number}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                                                    {order.customer_name}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
                                                    <Phone className="h-3 w-3" />
                                                    {order.customer_phone}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-zinc-400">
                                                <MapPin className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                                {order.fulfilling_location?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={order.status} />
                                        </td>
                                        <td className="px-6 py-4 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                            {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                                            Rs. {parseFloat(order.total).toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                                        No customer orders found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {orders.links && orders.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between bg-zinc-50 dark:bg-zinc-700">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{orders.from}</span> to{' '}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{orders.to}</span> of{' '}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{orders.total}</span> orders
                        </span>
                        <div className="flex gap-1.5">
                            {orders.links.map((link, idx) => {
                                if (link.url === null) return null;
                                if (link.label.includes('Previous')) {
                                    return (
                                        <Button key={idx} variant="outline" size="sm"
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                            <ChevronLeft className="h-4 w-4" /><span>Previous</span>
                                        </Button>
                                    );
                                }
                                if (link.label.includes('Next')) {
                                    return (
                                        <Button key={idx} variant="outline" size="sm"
                                            className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
                                            onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                            <span>Next</span><ChevronRight className="h-4 w-4" />
                                        </Button>
                                    );
                                }
                                return (
                                    <Button key={idx}
                                        variant={link.active ? 'default' : 'outline'} size="sm"
                                        className={`rounded-xl h-9 w-9 p-0 ${link.active ? 'bg-[#6b7c5c] text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200'}`}
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                        {link.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
