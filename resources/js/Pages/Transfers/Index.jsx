import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import {
    Calendar,
    MapPin,
    Plus,
    ChevronLeft,
    ChevronRight,
    ArrowRightLeft,
} from 'lucide-react';

export default function Index({ transfers }) {
    return (
        <AuthenticatedLayout>
            <Head title="Stock Transfers" />

            {/* Page header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl border border-indigo-100 dark:border-indigo-500/20">
                            <ArrowRightLeft className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-ink-100">
                            Stock Transfers
                        </h1>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-ink-400 ml-12">
                        View the audit log of all internal inventory transfers between locations.
                    </p>
                </div>

                <Link href={route('transfers.create')}>
                    <Button className="bg-[#1B4FD8] hover:bg-blue-700 text-white rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto font-semibold">
                        <Plus className="h-4.5 w-4.5" />
                        <span>New Transfer</span>
                    </Button>
                </Link>
            </div>

            {/* Transfers Table Card */}
            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm overflow-hidden flex-1 flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50/75 dark:bg-ink-800/50 border-b border-slate-200 dark:border-ink-700 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-ink-400 sticky top-0 z-10">
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4 text-right">Quantity</th>
                                <th className="px-6 py-4">From Location</th>
                                <th className="px-6 py-4">To Location</th>
                                <th className="px-6 py-4">Notes</th>
                                <th className="px-6 py-4">By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-ink-750">
                            {transfers.data.length > 0 ? (
                                transfers.data.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-ink-800/40 transition-colors">
                                        
                                        {/* Timestamp */}
                                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-ink-400 font-medium whitespace-nowrap">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                {new Date(t.created_at).toLocaleString()}
                                            </span>
                                        </td>

                                        {/* Product */}
                                        <td className="px-6 py-4">
                                            <Link
                                                href={route('products.show', t.product?.id)}
                                                className="group/link"
                                            >
                                                <span className="block text-sm font-semibold text-slate-800 dark:text-ink-100 group-hover/link:text-blue-600 dark:group-hover/link:text-blue-400 transition-colors">
                                                    {t.product?.name ?? '—'}
                                                </span>
                                                <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-100/50 dark:border-blue-500/20 mt-0.5 inline-block">
                                                    {t.product?.sku}
                                                </span>
                                            </Link>
                                        </td>

                                        {/* Qty */}
                                        <td className="px-6 py-4 text-right">
                                            <span className="font-bold text-sm text-slate-800 dark:text-ink-200 tabular-nums">
                                                {parseFloat(t.quantity).toLocaleString()}
                                            </span>
                                            <span className="block text-[10px] text-slate-400 dark:text-ink-500 font-semibold uppercase mt-0.5">
                                                {t.product?.unit}
                                            </span>
                                        </td>

                                        {/* From Location */}
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-100/50 dark:border-rose-500/20">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                {t.from_location?.name ?? '—'}
                                            </span>
                                        </td>

                                        {/* To Location */}
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100/50 dark:border-emerald-500/20">
                                                <MapPin className="h-3.5 w-3.5 shrink-0" />
                                                {t.to_location?.name ?? '—'}
                                            </span>
                                        </td>

                                        {/* Notes */}
                                        <td className="px-6 py-4 max-w-[200px]">
                                            <span className="text-xs text-slate-500 dark:text-ink-400 line-clamp-1" title={t.notes}>
                                                {t.notes || <span className="italic text-slate-300 dark:text-ink-600">—</span>}
                                            </span>
                                        </td>

                                        {/* By */}
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-ink-400">
                                                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[9px] shrink-0 uppercase">
                                                    {(t.created_by_user?.name || t.created_by?.name || t.user?.name || '?').charAt(0)}
                                                </div>
                                                {t.created_by_user?.name || t.created_by?.name || t.user?.name || 'Unknown'}
                                            </span>
                                        </td>

                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="p-4 bg-slate-100 dark:bg-ink-800 rounded-full text-slate-400 dark:text-slate-500 mb-4">
                                                <ArrowRightLeft className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-ink-100">No transfers found</h3>
                                            <p className="text-xs text-slate-500 dark:text-ink-400 mt-1 text-center leading-relaxed">
                                                Stock transfers will appear here once inventory items are moved between warehouses.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination */}
                {transfers.links && transfers.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 dark:border-ink-700 flex items-center justify-between bg-slate-50/50 dark:bg-ink-800/30">
                        <span className="text-xs text-slate-500 dark:text-ink-400">
                            Showing <span className="font-semibold text-slate-800 dark:text-ink-200">{transfers.from}</span> to{' '}
                            <span className="font-semibold text-slate-800 dark:text-ink-200">{transfers.to}</span> of{' '}
                            <span className="font-semibold text-slate-800 dark:text-ink-200">{transfers.total}</span> entries
                        </span>
                        <div className="flex gap-1.5">
                            {transfers.links.map((link, idx) => {
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
                                            link.active ? 'bg-[#1B4FD8] hover:bg-blue-700' : 'hover:bg-slate-100 dark:hover:bg-ink-750 dark:border-ink-650 dark:text-ink-200'
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
        </AuthenticatedLayout>
    );
}
