import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { GeneralManager, ImageManager, VariantManager, SpecManager } from './Partials/ProductManagers';
import { Button } from '@/Components/ui/button';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/Components/ui/sheet';
import {
    ArrowLeft,
    Layers,
    MapPin,
    TrendingUp,
    User,
    Calendar,
    ChevronLeft,
    ChevronRight,
    FileText,
    Plus,
    ArrowDownToLine,
    ArrowUpFromLine,
    SlidersHorizontal,
    Image as ImageIcon,
    CheckCircle2
} from 'lucide-react';

export default function Show({ product, categories, stockLevels, movements, movementFilters = {}, can }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('inventory');
    
    // Select the initial variant
    const [selectedVariantId, setSelectedVariantId] = useState(
        movementFilters.filter_variant 
            ? parseInt(movementFilters.filter_variant) 
            : (product.variants && product.variants.length > 0 ? product.variants[0].id : null)
    );

    const { data, setData, post, processing, errors, reset } = useForm({
        location_id:      '',
        variant_id:       selectedVariantId || '',
        type:             'in',
        quantity:         '',
        reference_source: '',
        note:             '',
    });

    // Update form's variant_id when selectedVariantId changes
    useEffect(() => {
        setData('variant_id', selectedVariantId || '');
    }, [selectedVariantId]);

    // Compute derived data for the selected variant (or base product)
    const selectedVariant = product.variants?.find(v => v.id === selectedVariantId);
    
    // Filter stock levels to only show the relevant ones
    const filteredStockLevels = stockLevels.filter(l => 
        selectedVariantId ? l.variant_id === selectedVariantId : l.variant_id === null
    );

    // Get specific global stock for the header
    const currentGlobalStock = selectedVariantId 
        ? selectedVariant?.global_stock 
        : stockLevels.reduce((acc, curr) => acc + curr.current_stock, 0);

    const handleVariantSelect = (variantId) => {
        setSelectedVariantId(variantId);
        router.get(
            route('products.show', product.id),
            { filter_variant: variantId },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleOpen = () => {
        reset();
        setData('variant_id', selectedVariantId || '');
        setIsOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('movements.store', product.id), {
            onSuccess: () => {
                reset();
                setIsOpen(false);
            },
        });
    };

    // Find the stock level object for the currently-selected location and variant inside the sheet form
    const selectedLevelInForm = data.location_id
        ? filteredStockLevels.find(l => l.location_id === parseInt(data.location_id))
        : null;

    // Type config — drives styling and helper text
    const typeConfig = {
        in: {
            label:       'Stock In',
            icon:        ArrowDownToLine,
            color:       'emerald',
            activeClass: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-400',
            qtyLabel:    'Quantity to Receive',
            qtyHint:     null,
        },
        out: {
            label:       'Stock Out',
            icon:        ArrowUpFromLine,
            color:       'rose',
            activeClass: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400',
            qtyLabel:    'Quantity to Dispatch',
            qtyHint:     selectedLevelInForm
                ? `Available at this location: ${selectedLevelInForm.current_stock} ${product.unit}`
                : null,
        },
        adjust: {
            label:       'Adjustment',
            icon:        SlidersHorizontal,
            color:       'amber',
            activeClass: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-400',
            qtyLabel:    'Adjustment Amount',
            qtyHint:     selectedLevelInForm
                ? `Current stock: ${selectedLevelInForm.current_stock} ${product.unit} — use a negative number to reduce (e.g. -3 for a write-off)`
                : 'Use a negative number to reduce stock (e.g. -3 for a write-off).',
        },
    };

    const activeType = typeConfig[data.type];

    // Helper to get image URL
    const getImageUrl = (imagePath) => {
        return imagePath && !imagePath.startsWith('http') ? `/storage/${imagePath}` : imagePath;
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Product - ${product.sku}`} />

            {/* Header / Back Action */}
            <div className="mb-6">
                <Link
                    href={route('products.index')}
                    className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-ink-100 transition-colors font-medium mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Products</span>
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <div className="flex gap-6">
                        <div className="hidden sm:flex h-24 w-24 bg-slate-100 dark:bg-zinc-700 rounded-xl items-center justify-center border border-zinc-200 dark:border-zinc-700 overflow-hidden flex-shrink-0">
                            {product.images?.length > 0 ? (
                                <img src={getImageUrl(product.images[0].path)} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                                <ImageIcon className="h-8 w-8 text-slate-300 dark:text-ink-600" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-xs font-bold text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-600 whitespace-nowrap">
                                    {product.sku}
                                </span>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 uppercase tracking-wide">
                                    {product.category?.name || 'Uncategorized'}
                                </span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 mb-1">{product.name}</h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xl line-clamp-2">
                                {product.description || 'No description provided.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 border-b border-zinc-200 dark:border-zinc-700 mb-6 overflow-x-auto">
                <button 
                    onClick={() => setActiveTab('inventory')}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'inventory' ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-ink-300'}`}
                >
                    Inventory & Ledger
                </button>
                <button 
                    onClick={() => setActiveTab('general')}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'general' ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-ink-300'}`}
                >
                    General Info
                </button>
                <button 
                    onClick={() => setActiveTab('media_variants')}
                    className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeTab === 'media_variants' ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-ink-300'}`}
                >
                    Media & Variants
                </button>
            </div>

            {/* Inventory Tab Content */}
            <div className={activeTab === 'inventory' ? 'block' : 'hidden'}>
                {/* Variants Grid */}
                {product.variants && product.variants.length > 0 && (
                <div className="mb-8">
                    <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
                        <Layers className="h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                        Select Variant
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {product.variants.map((v) => {
                            const isSelected = selectedVariantId === v.id;
                            const variantImage = product.images?.find(img => img.variant_id === v.id);
                            
                            return (
                                <button
                                    key={v.id}
                                    onClick={() => handleVariantSelect(v.id)}
                                    className={`relative text-left flex items-start gap-4 p-4 rounded-lg border transition-all duration-200 ${
                                        isSelected 
                                            ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500 shadow-md' 
                                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm'
                                    }`}
                                >
                                    {isSelected && (
                                        <div className="absolute top-3 right-3 text-[#6b7c5c] dark:text-[#8fa67a]">
                                            <CheckCircle2 className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div className="h-16 w-16 bg-slate-100 dark:bg-zinc-700 rounded-lg flex items-center justify-center border border-slate-200/50 dark:border-zinc-700 overflow-hidden flex-shrink-0">
                                        {variantImage ? (
                                            <img src={getImageUrl(variantImage.path)} alt={v.name} className="h-full w-full object-cover" />
                                        ) : (
                                            <ImageIcon className="h-5 w-5 text-slate-300 dark:text-ink-600" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-6">
                                        <h3 className={`font-bold text-sm truncate ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-zinc-900 dark:text-zinc-100'}`}>
                                            {v.name}
                                        </h3>
                                        <div className="font-mono text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 mb-2 truncate uppercase">
                                            {v.sku}
                                        </div>
                                        <div className="flex items-end justify-between mt-auto">
                                            <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                                                Rs {parseFloat(v.price || product.price).toFixed(2)}
                                            </span>
                                            <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
                                                {v.global_stock || 0} {product.unit || 'pcs'}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Selected Variant Details Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Variant Info / Stock Card */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100 dark:border-zinc-700">
                            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                <MapPin className="h-4.5 w-4.5 text-[#6b7c5c]" />
                                <span>Storage Locations</span>
                            </h3>
                            <span className="text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-[#6b7c5c] dark:text-[#8fa67a] px-2.5 py-1 rounded-lg">
                                Total: {currentGlobalStock || 0}
                            </span>
                        </div>
                        <div className="divide-y divide-zinc-100 dark:divide-zinc-700 max-h-[300px] overflow-y-auto pr-2">
                            {filteredStockLevels.length > 0 ? filteredStockLevels.map((level) => (
                                <div key={level.location_id} className="flex items-center justify-between py-3.5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{level.location_name}</span>
                                        <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-400 mt-0.5 uppercase">code: {level.location_code}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {level.is_low && (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-600 border border-rose-100 animate-pulse">
                                                Low
                                            </span>
                                        )}
                                        <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100 bg-slate-50 dark:bg-zinc-700 border border-slate-200/50 dark:border-zinc-700 px-3 py-1 rounded-xl min-w-[3rem] text-center">
                                            {level.current_stock}
                                        </span>
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-6 text-sm text-zinc-500 dark:text-zinc-400 italic">
                                    No storage locations setup.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ledger Movement History */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col h-full">
                        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                    <TrendingUp className="h-4.5 w-4.5 text-[#6b7c5c]" />
                                    <span>
                                        Ledger History
                                        {selectedVariant && ` — ${selectedVariant.name}`}
                                    </span>
                                    {movements.total > 0 && (
                                        <span className="ml-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-zinc-600 text-zinc-600 dark:text-zinc-300">
                                            {movements.total}
                                        </span>
                                    )}
                                </h3>
                                
                                <div className="flex items-center gap-3">
                                    {can?.recordMovement && (
                                        <Button
                                            onClick={handleOpen}
                                            className="bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white text-xs font-semibold rounded-xl px-4 py-2 flex items-center gap-1.5 shadow-md  transition-all hover:scale-[1.02] active:scale-95"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Record Movement
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="overflow-x-auto flex-1">
                            <table className="w-full text-left border-collapse min-w-[700px]">
                                <thead>
                                    <tr className="bg-slate-50/75 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700 text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                        <th className="px-5 py-3">Date</th>
                                        <th className="px-5 py-3">Type & Location</th>
                                        <th className="px-5 py-3">Qty</th>
                                        <th className="px-5 py-3">Reference / Notes</th>
                                        <th className="px-5 py-3">User</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                                    {movements.data.length > 0 ? (
                                        movements.data.map((movement) => (
                                            <tr key={movement.id} className="hover:bg-slate-50/30 dark:hover:bg-zinc-700/40 transition-colors">
                                                <td className="px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                                                    {new Date(movement.created_at).toLocaleDateString()}
                                                    <div className="text-[10px] text-slate-400 mt-0.5">{new Date(movement.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {movement.type === 'in' && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 uppercase">
                                                                <ArrowDownToLine className="h-3 w-3" /> In
                                                            </span>
                                                        )}
                                                        {movement.type === 'out' && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 uppercase">
                                                                <ArrowUpFromLine className="h-3 w-3" /> Out
                                                            </span>
                                                        )}
                                                        {movement.type === 'adjust' && (
                                                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 uppercase">
                                                                <SlidersHorizontal className="h-3 w-3" /> Adj
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                                                        {movement.location?.name || '—'}
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className={`font-bold text-sm ${
                                                        movement.type === 'in'
                                                            ? 'text-emerald-600 dark:text-emerald-400'
                                                            : movement.type === 'out'
                                                            ? 'text-rose-600 dark:text-rose-400'
                                                            : 'text-amber-600 dark:text-amber-400'
                                                    }`}>
                                                        {movement.type === 'in'
                                                            ? `+${parseFloat(movement.quantity)}`
                                                            : movement.type === 'out'
                                                            ? `-${parseFloat(movement.quantity)}`
                                                            : (parseFloat(movement.quantity) > 0 ? `+${parseFloat(movement.quantity)}` : parseFloat(movement.quantity))}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    {movement.reference_type ? (() => {
                                                        const isPo = movement.reference_type.includes('PurchaseOrder');
                                                        const refLabel = movement.reference_type.includes('\\')
                                                            ? `${movement.reference_type.split('\\').pop()} #${movement.reference_id}`
                                                            : movement.reference_type;
                                                        return isPo && movement.reference_id ? (
                                                            <Link
                                                                href={route('po.show', movement.reference_id)}
                                                                className="inline-flex items-center gap-1 text-[#6b7c5c] dark:text-[#8fa67a] font-mono text-[10px] font-bold bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-100/50 dark:border-blue-500/20 hover:bg-blue-100 dark:hover:bg-blue-500/20"
                                                            >
                                                                {refLabel}
                                                            </Link>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-zinc-400 font-mono text-[10px] bg-slate-100 dark:bg-zinc-700 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
                                                                {refLabel}
                                                            </span>
                                                        );
                                                    })() : null}
                                                    {movement.note && (
                                                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2" title={movement.note}>
                                                            {movement.note}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-3.5 text-xs text-slate-600 dark:text-zinc-400 font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <User className="h-3 w-3 text-slate-400" />
                                                        {movement.user?.name || 'Unknown'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-12 text-center text-slate-400 text-xs italic">
                                                No ledger movements logged for this variant yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {movements.links && movements.data.length > 0 && (
                            <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-700 flex flex-wrap items-center justify-between gap-4 bg-zinc-50 dark:bg-zinc-700">
                                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                                    Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{movements.from}</span> to{' '}
                                    <span className="font-semibold text-slate-800 dark:text-zinc-200">{movements.to}</span>
                                </span>
                                <div className="flex gap-1">
                                    {movements.links.map((link, idx) => {
                                        if (link.url === null) return null;
                                        let label = link.label;
                                        if (label.includes('Previous')) {
                                            return (
                                                <Button key={idx} variant="outline" size="sm"
                                                    className="h-7 px-2 flex items-center bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                                                    onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                                    <ChevronLeft className="h-3.5 w-3.5" />
                                                </Button>
                                            );
                                        }
                                        if (label.includes('Next')) {
                                            return (
                                                <Button key={idx} variant="outline" size="sm"
                                                    className="h-7 px-2 flex items-center bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                                                    onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                                    <ChevronRight className="h-3.5 w-3.5" />
                                                </Button>
                                            );
                                        }
                                        return (
                                            <Button key={idx}
                                                variant={link.active ? 'default' : 'outline'} size="sm"
                                                className={`h-7 min-w-[1.75rem] px-1 text-xs ${link.active ? 'bg-[#6b7c5c] hover:bg-[#5a6b4c]' : 'bg-white dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'}`}
                                                onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                                {label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* End Inventory Tab Content */}
            </div>

            {/* Other Tabs */}
            {activeTab === 'general' && (
                <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 shadow-sm">
                    <GeneralManager product={product} brands={categories} />
                </div>
            )}
            {activeTab === 'media_variants' && (
                <div className="space-y-6">
                    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 shadow-sm">
                        <ImageManager product={product} />
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Manage Variants</h2>
                        <VariantManager product={product} />
                    </div>
                    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-6 shadow-sm">
                        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">Technical Specifications</h2>
                        <SpecManager product={product} />
                    </div>
                </div>
            )}

            {/* ── Record Movement Slide-over ──────────────────────────────────── */}
            {can?.recordMovement && (
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetContent side="right" className="w-full sm:max-w-md bg-white dark:bg-zinc-800 p-6 border-l border-zinc-200 dark:border-zinc-700 shadow-2xl flex flex-col h-full overflow-hidden z-[210]">
                        <SheetHeader className="mb-5">
                            <SheetTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                                Record Stock Movement
                            </SheetTitle>
                            <SheetDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                                <span className="font-mono font-semibold text-[#6b7c5c] dark:text-[#8fa67a]">
                                    {selectedVariant ? selectedVariant.sku : product.sku}
                                </span>
                                {' — '}{product.name} {selectedVariant ? ` (${selectedVariant.name})` : ''}
                            </SheetDescription>
                        </SheetHeader>

                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                            <div className="flex-1 overflow-y-auto pr-1 min-h-0 space-y-5">
                                {/* Movement Type Selector */}
                                <div>
                                    <InputLabel value="Movement Type" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-2" />
                                    <div className="grid grid-cols-3 gap-2">
                                        {Object.entries(typeConfig).map(([key, cfg]) => {
                                            const Icon = cfg.icon;
                                            const isActive = data.type === key;
                                            return (
                                                <button
                                                    key={key}
                                                    type="button"
                                                    onClick={() => setData('type', key)}
                                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all duration-150 ${
                                                        isActive
                                                            ? cfg.activeClass
                                                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-700 hover:border-slate-300 dark:hover:border-ink-650'
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4" />
                                                    {cfg.label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <InputError message={errors.type} className="mt-1.5 text-xs text-rose-500" />
                                </div>

                                {/* Location */}
                                <div>
                                    <InputLabel htmlFor="location_id" value="Location" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                                    <select
                                        id="location_id"
                                        value={data.location_id}
                                        onChange={(e) => setData('location_id', e.target.value)}
                                        className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm shadow-sm transition"
                                    >
                                        <option value="">Select a location…</option>
                                        {Array.from(new Map(stockLevels.map(l => [l.location_id, {id: l.location_id, name: l.location_name, code: l.location_code}])).values()).map(loc => (
                                            <option key={loc.id} value={loc.id}>
                                                {loc.name} ({loc.code})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.location_id} className="mt-1.5 text-xs text-rose-500" />
                                </div>

                                {/* Quantity */}
                                <div>
                                    <InputLabel htmlFor="quantity" value={activeType.qtyLabel} className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                                    <TextInput
                                        id="quantity"
                                        type="number"
                                        step="any"
                                        min={data.type === 'adjust' ? undefined : '0.001'}
                                        value={data.quantity}
                                        onChange={(e) => setData('quantity', e.target.value)}
                                        placeholder={data.type === 'adjust' ? 'e.g. 5 or -3' : 'e.g. 50'}
                                        className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 dark:text-zinc-100 text-slate-900 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm"
                                    />
                                    {activeType.qtyHint && (
                                        <p className={`text-[11px] mt-1.5 leading-snug ${
                                            data.type === 'out'
                                                ? 'text-zinc-500 dark:text-zinc-400'
                                                : 'text-amber-600 dark:text-amber-400'
                                        }`}>
                                            {activeType.qtyHint}
                                        </p>
                                    )}
                                    <InputError message={errors.quantity} className="mt-1.5 text-xs text-rose-500" />
                                </div>

                                {/* Reference Source */}
                                <div>
                                    <InputLabel htmlFor="reference_source" value="Reference Source (optional)" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                                    <TextInput
                                        id="reference_source"
                                        type="text"
                                        value={data.reference_source}
                                        onChange={(e) => setData('reference_source', e.target.value)}
                                        placeholder="e.g. Delivery note #42, RMA-001"
                                        className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 dark:text-zinc-100 text-slate-900 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm"
                                    />
                                    <InputError message={errors.reference_source} className="mt-1.5 text-xs text-rose-500" />
                                </div>

                                {/* Notes */}
                                <div>
                                    <InputLabel htmlFor="note" value="Notes (optional)" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                                    <textarea
                                        id="note"
                                        value={data.note}
                                        rows="3"
                                        onChange={(e) => setData('note', e.target.value)}
                                        placeholder="Any additional context about this movement…"
                                        className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 dark:text-zinc-100 text-slate-900 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm shadow-sm transition"
                                    />
                                    <InputError message={errors.note} className="mt-1.5 text-xs text-rose-500" />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="border-t border-zinc-100 dark:border-zinc-700/50 pt-4 mt-4 flex gap-3">
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
                                    className={`flex-1 text-white font-semibold rounded-xl py-5 flex items-center justify-center gap-1.5 shadow-md transition-all ${
                                        data.type === 'in'
                                            ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
                                            : data.type === 'out'
                                            ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
                                            : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                                    }`}
                                >
                                    {processing ? (
                                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <>
                                            <activeType.icon className="h-4 w-4" />
                                            <span>
                                                {data.type === 'in' ? 'Record Stock In' : data.type === 'out' ? 'Record Stock Out' : 'Save Adjustment'}
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </SheetContent>
                </Sheet>
            )}
        </AuthenticatedLayout>
    );
}
