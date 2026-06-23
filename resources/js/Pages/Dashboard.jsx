import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as ChartTooltip,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';

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
    draft:              { label: 'Draft',    icon: FileText,    class: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600' },
    sent:               { label: 'Sent',     icon: Send,        class: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600' },
    partially_received: { label: 'Partial',  icon: Truck,       class: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800' },
    received:           { label: 'Received', icon: CheckCircle2,class: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' },
    cancelled:          { label: 'Cancelled',icon: XCircle,     class: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' },
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
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium border ${cfg.class}`}>
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
        <div className={`bg-white dark:bg-zinc-800 rounded-lg border shadow-sm p-5 flex items-start gap-4 transition-all hover:shadow-md ${
            accent === 'red'
                ? 'border-rose-200 dark:border-rose-500/30'
                : 'border-zinc-200 dark:border-zinc-700'
        }`}>
            <div className={`p-3 rounded-xl shrink-0 ${
                accent === 'red'
                    ? 'bg-rose-50 dark:bg-rose-500/10'
                    : accent === 'blue'
                    ? 'bg-blue-50 dark:bg-blue-500/10'
                    : accent === 'amber'
                    ? 'bg-amber-50 dark:bg-amber-500/10'
                    : 'bg-slate-100 dark:bg-zinc-700'
            }`}>
                <Icon className={`h-5 w-5 ${
                    accent === 'red'   ? 'text-rose-500 dark:text-rose-400'   :
                    accent === 'blue'  ? 'text-[#6b7c5c] dark:text-[#8fa67a]'   :
                    accent === 'amber' ? 'text-amber-600 dark:text-amber-400' :
                    'text-zinc-500 dark:text-zinc-400'
                }`} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{label}</p>
                <p className={`text-3xl font-extrabold mt-0.5 tabular-nums ${
                    accent === 'red' ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-zinc-100'
                }`}>{value}</p>
                {sub && <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{sub}</p>}
            </div>
            {href && <ArrowRight className="h-4 w-4 text-slate-300 dark:text-ink-600 shrink-0 mt-1" />}
        </div>
    );

    return href ? <Link href={href}>{card}</Link> : card;
}

// ── Custom Tooltips ─────────────────────────────────────────────────────────
const CustomMovementsTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3.5 rounded-xl shadow-xl">
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-1.5">{label}</p>
                <div className="space-y-1">
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Stock In: <span className="font-bold tabular-nums">{payload[0].value.toLocaleString()}</span>
                    </p>
                    <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Stock Out: <span className="font-bold tabular-nums">{payload[1].value.toLocaleString()}</span>
                    </p>
                </div>
            </div>
        );
    }
    return null;
};

const CustomAllocationTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const item = payload[0];
        return (
            <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3.5 rounded-xl shadow-xl">
                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-100 mb-1 leading-none">{item.name}</p>
                <p className="text-sm font-extrabold text-[#6b7c5c] dark:text-blue-400 tabular-nums">
                    {item.value.toLocaleString()} <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500 uppercase">units</span>
                </p>
            </div>
        );
    }
    return null;
};

const CHART_COLORS = ['#1B4FD8', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#3B82F6', '#14B8A6'];

// ── Main page ────────────────────────────────────────────────────────────────
export default function Dashboard({ 
    stats, 
    lowStockProducts, 
    recentPos, 
    recentMovements,
    locationStock = [],
    categoryStock = [],
    movementsTrend = []
}) {
    const [allocationType, setAllocationType] = useState('category');

    const hasCategoryData = categoryStock.length > 0 && categoryStock.some(c => c.value > 0);
    const hasLocationData = locationStock.length > 0 && locationStock.some(l => l.value > 0);

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            {/* Page title */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Dashboard</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
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

            {/* ── Visual Charts Section ──────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                
                {/* 15-Day Stock Movement velocity trend (2/3 width) */}
                <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            Stock Movements Velocity
                            <span className="text-[10px] font-normal text-zinc-400 dark:text-zinc-500 uppercase">(Last 15 Days)</span>
                        </h2>
                    </div>
                    <div className="p-5 flex-1 min-h-[300px]">
                        <ResponsiveContainer width="100%" height={300}>
                            <AreaChart data={movementsTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-ink-800" />
                                <XAxis 
                                    dataKey="date" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }} 
                                />
                                <YAxis 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }} 
                                />
                                <ChartTooltip content={<CustomMovementsTooltip />} />
                                <Area 
                                    type="monotone" 
                                    dataKey="in" 
                                    name="Stock In" 
                                    stroke="#10B981" 
                                    strokeWidth={2} 
                                    fillOpacity={1} 
                                    fill="url(#colorIn)" 
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="out" 
                                    name="Stock Out" 
                                    stroke="#F43F5E" 
                                    strokeWidth={2} 
                                    fillOpacity={1} 
                                    fill="url(#colorOut)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stock Allocation Card (1/3 width) */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            Stock Allocation
                        </h2>
                        <div className="flex bg-slate-100 dark:bg-zinc-700 p-0.5 rounded-lg border border-slate-200/50 dark:border-zinc-700">
                            <button
                                onClick={() => setAllocationType('category')}
                                className={`px-2.5 py-1.2 text-[11px] font-semibold rounded-md transition-all ${
                                    allocationType === 'category'
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-slate-800'
                                }`}
                            >
                                Category
                            </button>
                            <button
                                onClick={() => setAllocationType('location')}
                                className={`px-2.5 py-1.2 text-[11px] font-semibold rounded-md transition-all ${
                                    allocationType === 'location'
                                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-slate-800'
                                }`}
                            >
                                Location
                            </button>
                        </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-center min-h-[300px]">
                        {allocationType === 'category' ? (
                            !hasCategoryData ? (
                                <div className="flex flex-col items-center justify-center text-center py-12">
                                    <Package className="h-8 w-8 text-slate-300 dark:text-ink-700 mb-2" />
                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">No stock in any category</p>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="h-[180px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={categoryStock}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={55}
                                                    outerRadius={75}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {categoryStock.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <ChartTooltip content={<CustomAllocationTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    
                                    {/* Category Legend list */}
                                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 mt-4 overflow-y-auto max-h-[80px]">
                                        {categoryStock.map((entry, index) => (
                                            <div key={entry.name} className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-zinc-400 font-semibold">
                                                <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }} />
                                                <span className="truncate max-w-[85px]" title={entry.name}>{entry.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        ) : (
                            !hasLocationData ? (
                                <div className="flex flex-col items-center justify-center text-center py-12">
                                    <MapPin className="h-8 w-8 text-slate-300 dark:text-ink-700 mb-2" />
                                    <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">No stock in any location</p>
                                </div>
                            ) : (
                                <div className="h-[240px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={locationStock} layout="vertical" margin={{ left: -10, right: 10, top: 0, bottom: 0 }}>
                                            <XAxis type="number" hide />
                                            <YAxis 
                                                dataKey="name" 
                                                type="category" 
                                                tickLine={false} 
                                                axisLine={false} 
                                                width={90} 
                                                tick={{ fill: '#64748B', fontSize: 10, fontWeight: 500 }} 
                                            />
                                            <ChartTooltip content={<CustomAllocationTooltip />} />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                                                {locationStock.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )
                        )}
                    </div>
                </div>

            </div>

            {/* ── Middle row: Low stock + Recent POs ─────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* Low stock list */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
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
                            className="text-xs text-[#6b7c5c] dark:text-[#8fa67a] font-semibold hover:underline flex items-center gap-1"
                        >
                            All products <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="flex-1">
                        {lowStockProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-md mb-3">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                </div>
                                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">All stock levels healthy</p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Nothing is below its reorder level.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                {lowStockProducts.map((p) => {
                                    const pct = p.reorder_level > 0
                                        ? Math.min(100, (p.total_stock / p.reorder_level) * 100)
                                        : 0;
                                    return (
                                        <Link
                                            key={p.id}
                                            href={route('products.show', p.product_id)}
                                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/40 transition-colors group"
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
                                                    <span className="font-mono text-[11px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-600 whitespace-nowrap">
                                                        {p.sku}
                                                    </span>
                                                    <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 truncate">
                                                        {p.name}
                                                    </span>
                                                </div>
                                                {/* Mini progress bar */}
                                                <div className="mt-1.5 flex items-center gap-2">
                                                    <div className="flex-1 h-1 bg-slate-100 dark:bg-zinc-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${
                                                                p.total_stock <= 0 ? 'bg-rose-500' :
                                                                pct < 50 ? 'bg-rose-400' : 'bg-amber-400'
                                                            }`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 whitespace-nowrap tabular-nums">
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
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-between">
                        <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <ClipboardList className="h-4 w-4 text-[#6b7c5c]" />
                            Recent Purchase Orders
                        </h2>
                        <Link
                            href={route('po.index')}
                            className="text-xs text-[#6b7c5c] dark:text-[#8fa67a] font-semibold hover:underline flex items-center gap-1"
                        >
                            All POs <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>

                    <div className="flex-1">
                        {recentPos.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="p-3 bg-zinc-100 dark:bg-zinc-700 rounded-md mb-3">
                                    <ClipboardList className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                                </div>
                                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">No purchase orders yet</p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">Create one to start tracking incoming stock.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                {recentPos.map((po) => (
                                    <Link
                                        key={po.id}
                                        href={route('po.show', po.id)}
                                        className="flex items-center gap-3 px-5 py-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-700/40 transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400">
                                                    {po.po_number}
                                                </span>
                                                <PoStatusBadge status={po.status} />
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-zinc-400 dark:text-zinc-500">
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
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
                        Recent Stock Activity
                    </h2>
                    <Link
                        href={route('products.index')}
                        className="text-xs text-[#6b7c5c] dark:text-[#8fa67a] font-semibold hover:underline flex items-center gap-1"
                    >
                        Products <ArrowRight className="h-3 w-3" />
                    </Link>
                </div>

                {recentMovements.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-700 rounded-md mb-3">
                            <Package className="h-6 w-6 text-zinc-400 dark:text-zinc-500" />
                        </div>
                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">No stock movements yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[640px]">
                            <thead>
                                <tr className="border-b border-zinc-100 dark:border-zinc-700 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-50/50 dark:bg-zinc-700">
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3">Product</th>
                                    <th className="px-5 py-3">Location</th>
                                    <th className="px-5 py-3 text-right">Qty</th>
                                    <th className="px-5 py-3">Note</th>
                                    <th className="px-5 py-3">By</th>
                                    <th className="px-5 py-3">When</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                {recentMovements.map((m) => {
                                    const mt = MOVEMENT_TYPE[m.type] ?? MOVEMENT_TYPE.adjust;
                                    const Icon = mt.icon;
                                    return (
                                        <tr key={m.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/30 transition-colors">
                                            <td className="px-5 py-3">
                                                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-bold ${mt.class}`}>
                                                    <Icon className="h-3.5 w-3.5" />
                                                    {mt.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3">
                                                <Link href={route('products.show', m.product_id)} className="group">
                                                    <span className="font-mono text-[10px] font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-600 whitespace-nowrap mr-1.5">
                                                        {m.product_sku}
                                                    </span>
                                                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-100 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors">
                                                        {m.product}
                                                    </span>
                                                </Link>
                                            </td>
                                            <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400">
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
                                            <td className="px-5 py-3 text-xs text-zinc-400 dark:text-zinc-500 max-w-[160px] truncate" title={m.note}>
                                                {m.note || <span className="italic">—</span>}
                                            </td>
                                            <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                                {m.created_by || '—'}
                                            </td>
                                            <td className="px-5 py-3 text-[11px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
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
