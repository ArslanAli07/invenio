import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Package,
    MapPin,
    AlertTriangle,
    ClipboardList,
    ArrowRight,
    TrendingDown,
    Clock,
    CheckCircle2,
    Send,
    Truck,
    FileText,
    XCircle,
    ArrowUpCircle,
    ArrowDownCircle,
    SlidersHorizontal,
    Building2,
} from 'lucide-react';

// ── Status config (matches PO pages) ────────────────────────────────────────
const PO_STATUS = {
    draft:              { label: 'Draft',    icon: FileText,    class: 'bg-slate-100 dark:bg-ink-800 text-slate-600 dark:text-ink-300 border-slate-200 dark:border-ink-700' },
    sent:               { label: 'Sent',     icon: Send,        class: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20' },
    partially_received: { label: 'Partial',  icon: Truck,       class: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' },
    received:           { label: 'Received', icon: CheckCircle2,class: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20' },
    cancelled:          { label: 'Cancelled',icon: XCircle,     class: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' },
};

const MOVEMENT_TYPE = {
    in:     { label: 'In',     icon: ArrowUpCircle,   class: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10' },
    out:    { label: 'Out',    icon: ArrowDownCircle, class: 'text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10' },
    adjust: { label: 'Adjust', icon: SlidersHorizontal,class: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' },
};

function PoStatusBadge({ status }) {
    const cfg = PO_STATUS[status] ?? PO_STATUS.draft;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.class}`}>
            <Icon className="h-3 w-3" />
            {cfg.label}
        </span>
    );
}

function fmtDate(str) {
    if (!str) return '—';
    return new Date(str).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtTime(str) {
    if (!str) return '—';
    const d = new Date(str);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' · ' +
           d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function fmtQty(n) {
    return parseFloat(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 3 });
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, accent, href }) {
    const card = (
        <div className={`bg-white dark:bg-ink-900 rounded-2xl border shadow-sm p-5 flex items-start gap-4 transition-all hover:shadow-md ${
            accent === 'red'
                ? 'border-rose-200 dark:border-rose-500/30'
                : 'border-slate-200 dark:border-ink-700'
        }`}>
            <div className={`p-3 rounded-xl shrink-0 ${
                accent === 'red'
                    ? 'bg-rose-50 dark:bg-rose-500/10'
                    : accent === 'blue'
                    ? 'bg-blue-50 dark:bg-blue-500/10'
                    : accent === 'amber'
                    ? 'bg-amber-50 dark:bg-amber-500/10'
                    : 'bg-slate-100 dark:bg-ink-800'
            }`}>
                <Icon className={`h-5 w-5 ${
                    accent === 'red'   ? 'text-rose-500 dark:text-rose-400'   :
                    accent === 'blue'  ? 'text-blue-600 dark:text-blue-400'   :
                    accent === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                    'text-slate-500 dark:text-ink-400'
                }`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-500 dark:text-ink-400 uppercase tracking-wider">{label}</p>
                <p className={`text-3xl font-extrabold mt-0.5 tabular-nums ${
                    accent === 'red' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-ink-100'
                }`}>{value}</p>
                {sub && <p className="text-xs text-slate-400 dark:text-ink-500 mt-1">{sub}</p>}
            </div>
            {href && <ArrowRight className="h-4 w-4 text-slate-300 dark:text-ink-600 shrink-0 mt-1" />}
        </div>
    );

    return href ? <Link href={href}>{card}</Link> : card;
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Dashboard({ stats, lowStockProducts, recentPos, recentMovements }) {
    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Page title */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-ink-100">Dashboard</h1>
                <p className="text-sm text-slate-500 dark:text-ink-400 mt-1">
                    Live snapshot of your inventory.
                </p>
            </div>

            {/* ── Stat cards ─────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={Package}
                    label="Total Products"
                    value={stats.total_products}
                    sub="Active + inactive"
                    href={route('products.index')}
                />
                <StatCard
                    icon={MapPin}
                    label="Locations"
                    value={stats.total_locations}
                    sub="Active warehouses"
                    href={route('locations.index')}
                />
                <StatCard
                    icon={AlertTriangle}
                    label="Low Stock"
                    value={stats.low_stock_count}
                    sub={stats.low_stock_count > 0 ? 'Needs attention' : 'All levels healthy'}
                    accent={stats.low_stock_count > 0 ? 'red' : undefined}
                    href={route('products.index')}
                />
                <StatCard
                    icon={ClipboardList}
                    label="Open POs"
                    value={stats.open_po_count}
                    sub="Draft + sent + partial"
                    accent={stats.open_po_count > 0 ? 'blue' : undefined}
                    href={route('po.index')}
                />
            </div>

            {/* ── Middle row: Low stock + Recent POs ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Low stock list */}
                <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-ink-750 bg-slate-50/50 dark:bg-ink-800/30 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-ink-100 flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-rose-500" />
                            Low Stock Items
                            {stats.low_stock_count > 0 && (
                                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                                    {stats.low_stock_count}
                                </span>
                            )}
                        </h2>
                        <Link
                            href={route('products.index')}
                            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                        >
                            All products <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="flex-1">
                        {lowStockProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl mb-3">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-ink-200">All stock levels healthy</p>
                                <p className="text-xs text-slate-400 dark:text-ink-500 mt-1">Nothing is below its reorder level.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-ink-750">
                                {lowStockProducts.map((p) => {
                                    const pct = p.reorder_level > 0
                                        ? Math.min(100, (p.total_stock / p.reorder_level) * 100)
                                        : 0;
                                    return (
                                        <Link
                                            key={p.id}
                                            href={route('products.show', p.id)}
                                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 dark:hover:bg-ink-800/40 transition-colors group"
                                        >
                                            {/* Severity dot */}
                                            <span className={`h-2 w-2 rounded-full shrink-0 ${
                                                p.total_stock <= 0
                                                    ? 'bg-rose-500 animate-pulse'
                                                    : pct < 50
                                                    ? 'bg-rose-400'
                                                    : 'bg-amber-400'
                                            }`} />

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-100/50 dark:border-blue-500/20 whitespace-nowrap">
                                                        {p.sku}
                                                    </span>
                                                    <span className="text-sm font-semibold text-slate-800 dark:text-ink-100 truncate">
                                                        {p.name}
                                                    </span>
                                                </div>
                                                {/* Mini progress bar */}
                                                <div className="mt-1.5 flex items-center gap-2">
                                                    <div className="flex-1 h-1 bg-slate-100 dark:bg-ink-750 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                p.total_stock <= 0 ? 'bg-rose-500' :
                                                                pct < 50 ? 'bg-rose-400' : 'bg-amber-400'
                                                            }`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-slate-500 dark:text-ink-400 whitespace-nowrap tabular-nums">
                                                        {fmtQty(p.total_stock)} / {fmtQty(p.reorder_level)} {p.unit}
                                                    </span>
                                                </div>
                                            </div>

                                            <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-ink-600 group-hover:text-slate-500 dark:group-hover:text-ink-400 shrink-0 transition-colors" />
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent POs */}
                <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-ink-750 bg-slate-50/50 dark:bg-ink-800/30 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-ink-100 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-blue-600" />
                            Recent Purchase Orders
                        </h2>
                        <Link
                            href={route('po.index')}
                            className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                        >
                            All POs <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="flex-1">
                        {recentPos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-3 bg-slate-100 dark:bg-ink-800 rounded-xl mb-3">
                                    <ClipboardList className="h-6 w-6 text-slate-400 dark:text-ink-500" />
                                </div>
                                <p className="text-sm font-semibold text-slate-700 dark:text-ink-200">No purchase orders yet</p>
                                <p className="text-xs text-slate-400 dark:text-ink-500 mt-1">Create one to start tracking incoming stock.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-ink-750">
                                {recentPos.map((po) => (
                                    <Link
                                        key={po.id}
                                        href={route('po.show', po.id)}
                                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/60 dark:hover:bg-ink-800/40 transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                                    {po.po_number}
                                                </span>
                                                <PoStatusBadge status={po.status} />
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400 dark:text-ink-500">
                                                {po.supplier && (
                                                    <span className="flex items-center gap-1">
                                                        <Building2 className="h-3 w-3" />
                                                        {po.supplier}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {fmtDate(po.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-ink-600 group-hover:text-slate-500 dark:group-hover:text-ink-400 shrink-0 transition-colors" />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Recent Movements ────────────────────────────────────────── */}
            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-700 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-ink-750 bg-slate-50/50 dark:bg-ink-800/30 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900 dark:text-ink-100 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500 dark:text-ink-400" />
                        Recent Stock Activity
                    </h2>
                    <Link
                        href={route('products.index')}
                        className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                        Products <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                {recentMovements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-3 bg-slate-100 dark:bg-ink-800 rounded-xl mb-3">
                            <Package className="h-6 w-6 text-slate-400 dark:text-ink-500" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-ink-200">No stock movements yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[640px]">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-ink-750 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-ink-500 bg-slate-50/30 dark:bg-ink-800/20">
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3">Product</th>
                                    <th className="px-5 py-3">Location</th>
                                    <th className="px-5 py-3 text-right">Qty</th>
                                    <th className="px-5 py-3">Note</th>
                                    <th className="px-5 py-3">By</th>
                                    <th className="px-5 py-3">When</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-ink-750">
                                {recentMovements.map((m) => {
                                    const mt = MOVEMENT_TYPE[m.type] ?? MOVEMENT_TYPE.adjust;
                                    const Icon = mt.icon;
                                    return (
                                        <tr key={m.id} className="hover:bg-slate-50/40 dark:hover:bg-ink-800/30 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold ${mt.class}`}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {mt.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <Link href={route('products.show', m.product_id)} className="group">
                                                    <span className="font-mono text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-100/50 dark:border-blue-500/20 whitespace-nowrap mr-1.5">
                                                        {m.product_sku}
                                                    </span>
                                                    <span className="text-xs font-semibold text-slate-800 dark:text-ink-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {m.product}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-slate-500 dark:text-ink-400">
                                                {m.location || '—'}
                                            </td>
                                            <td className="px-5 py-3 text-right">
                                                <span className={`text-sm font-bold tabular-nums ${
                                                    m.type === 'in' ? 'text-emerald-600 dark:text-emerald-400' :
                                                    m.type === 'out' ? 'text-rose-500 dark:text-rose-400' :
                                                    'text-amber-600 dark:text-amber-400'
                                                }`}>
                                                    {m.type === 'in' ? '+' : m.type === 'out' ? '-' : '±'}{fmtQty(m.quantity)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-slate-400 dark:text-ink-500 max-w-[160px] truncate" title={m.note}>
                                                {m.note || <span className="italic">—</span>}
                                            </td>
                                            <td className="px-5 py-3 text-xs text-slate-500 dark:text-ink-400 font-medium">
                                                {m.created_by || '—'}
                                            </td>
                                            <td className="px-5 py-3 text-[11px] text-slate-400 dark:text-ink-500 whitespace-nowrap">
                                                {fmtTime(m.created_at)}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
