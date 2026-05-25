import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { 
    ArrowLeft, 
    Layers, 
    MapPin, 
    TrendingUp, 
    User, 
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileText
} from 'lucide-react';

export default function Show({ product, stockLevels, movements }) {
    return (
        <AuthenticatedLayout>
            <Head title={`Product - ${product.sku}`} />

            {/* Header / Back Action */}
            <div className="mb-6">
                <Link
                    href={route('products.index')}
                    className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors font-medium mb-3"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Products</span>
                </Link>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100/50">
                                {product.sku}
                            </span>
                            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                                {product.category?.name || 'Uncategorized'}
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">{product.name}</h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Product Info Card */}
                <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <Layers className="h-4.5 w-4.5 text-blue-600" />
                            <span>Product Specifications</span>
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Unit of Measure</span>
                                <span className="text-sm text-slate-800 font-semibold mt-1 block">{product.unit || 'pcs'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Reorder Alert Level</span>
                                <span className="text-sm text-slate-800 font-semibold mt-1 block">{product.reorder_level} {product.unit || 'pcs'}</span>
                            </div>
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Catalog Status</span>
                                {product.is_active ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 mt-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-50 text-slate-500 border border-slate-200 mt-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                        Inactive
                                    </span>
                                )}
                            </div>
                            {product.description && (
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Description</span>
                                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{product.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Warehouse Stock Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                            <MapPin className="h-4.5 w-4.5 text-blue-600" />
                            <span>Storage Location Inventory Levels</span>
                        </h3>
                        <div className="divide-y divide-slate-100">
                            {stockLevels.map((level) => (
                                <div key={level.location_id} className="flex items-center justify-between py-3.5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-slate-900">{level.location_name}</span>
                                        <span className="font-mono text-[10px] text-slate-400 mt-0.5 uppercase">code: {level.location_code}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {level.is_low ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                                                <span className="relative flex h-1.5 w-1.5">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                                                </span>
                                                Below Reorder Alert
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                In Stock
                                            </span>
                                        )}
                                        <span className="font-bold text-sm text-slate-900 bg-slate-50 border border-slate-200/50 px-3 py-1 rounded-xl">
                                            {level.current_stock} <span className="text-[10px] text-slate-400 font-semibold">{product.unit || 'pcs'}</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Movement History Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6 flex flex-col">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <TrendingUp className="h-4.5 w-4.5 text-blue-600" />
                        <span>Ledger Movement History</span>
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Movement Type</th>
                                <th className="px-6 py-4">Quantity</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Reference Source</th>
                                <th className="px-6 py-4">Notes</th>
                                <th className="px-6 py-4">Operator</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {movements.data.length > 0 ? (
                                movements.data.map((movement) => (
                                    <tr key={movement.id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {new Date(movement.created_at).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {movement.type === 'in' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                                    Stock In
                                                </span>
                                            )}
                                            {movement.type === 'out' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                                    Stock Out
                                                </span>
                                            )}
                                            {movement.type === 'adjust' && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                                    Adjustment
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold text-sm ${movement.type === 'out' ? 'text-red-600' : 'text-slate-800'}`}>
                                                {movement.type === 'out' ? '-' : ''}{movement.quantity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs font-semibold text-slate-600">
                                                {movement.location?.name || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs">
                                            {movement.reference_type ? (
                                                <span className="flex items-center gap-1.5 text-slate-600 font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                                    <FileText className="h-3.5 w-3.5 text-slate-400" />
                                                    {movement.reference_type.split('\\').pop()}:{movement.reference_id}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 italic">Manual Entry</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-500 line-clamp-1 max-w-[200px]" title={movement.note}>
                                                {movement.note || '—'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <User className="h-3.5 w-3.5 text-slate-400" />
                                                {movement.user?.name || 'Unknown'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-xs italic">
                                        No ledger movements logged for this SKU yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Movements pagination */}
                {movements.links && movements.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50/50">
                        <span className="text-xs text-slate-500">
                            Showing <span className="font-semibold text-slate-800">{movements.from}</span> to{' '}
                            <span className="font-semibold text-slate-800">{movements.to}</span> of{' '}
                            <span className="font-semibold text-slate-800">{movements.total}</span> movements
                        </span>
                        <div className="flex gap-1.5">
                            {movements.links.map((link, idx) => {
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
        </AuthenticatedLayout>
    );
}
