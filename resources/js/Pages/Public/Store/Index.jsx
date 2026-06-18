import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Search, SlidersHorizontal, Smartphone, ChevronRight, X, ShoppingCart, ArrowUpDown } from 'lucide-react';
import BrandLogo from '@/Components/BrandLogo';
import { useCart } from '@/Contexts/CartContext';

export default function StoreIndex({ products, brands, currentbrand, filters }) {
    const { addToCart } = useCart();
    const [search,   setSearch]   = useState(() => (filters && typeof filters.search   === 'string' ? filters.search   : ''));
    const [sort,     setSort]     = useState(() => (filters && typeof filters.sort     === 'string' ? filters.sort     : ''));
    const [storage,  setStorage]  = useState(() => (filters && typeof filters.storage  === 'string' ? filters.storage  : ''));
    const [ram,      setRam]      = useState(() => (filters && typeof filters.ram      === 'string' ? filters.ram      : ''));
    const [minPrice, setMinPrice] = useState(() => (filters && filters.min_price ? filters.min_price : ''));
    const [maxPrice, setMaxPrice] = useState(() => (filters && filters.max_price ? filters.max_price : ''));
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB'];
    const ramOptions     = ['4GB', '6GB', '8GB', '12GB', '16GB'];

    const handleSearch = (e) => { e.preventDefault(); updateFilters({ search, sort, storage, ram, min_price: minPrice, max_price: maxPrice }); };
    const handlePriceFilter = (e) => { e.preventDefault(); updateFilters({ search, sort, storage, ram, min_price: minPrice, max_price: maxPrice }); };
    const handleSort = (e) => { const v = e.target.value; setSort(v); updateFilters({ search, sort: v, storage, ram, min_price: minPrice, max_price: maxPrice }); };

    const handleFilterChange = (type, value) => {
        let ns = storage, nr = ram;
        if (type === 'storage') { ns = storage === value ? '' : value; setStorage(ns); }
        else if (type === 'ram') { nr = ram === value ? '' : value; setRam(nr); }
        updateFilters({ search, sort, storage: ns, ram: nr, min_price: minPrice, max_price: maxPrice });
    };

    const updateFilters = (newFilters) => {
        const url = currentbrand
            ? route('public.store.category', { category_slug: currentbrand.slug })
            : route('public.store.index');
        router.get(url, newFilters, { preserveState: true, replace: true });
    };

    const hasActiveFilters = search || currentbrand || storage || ram || minPrice || maxPrice;

    const clearFilter = (type) => {
        if (type === 'brand') {
            router.get(route('public.store.index'), { search, sort, storage, ram, min_price: minPrice, max_price: maxPrice }, { preserveState: true, replace: true });
        } else {
            const f = { search, sort, storage, ram, min_price: minPrice, max_price: maxPrice };
            if (type === 'price') { f.min_price = ''; f.max_price = ''; setMinPrice(''); setMaxPrice(''); }
            else { f[type] = ''; if (type === 'search') setSearch(''); if (type === 'storage') setStorage(''); if (type === 'ram') setRam(''); }
            updateFilters(f);
        }
    };

    const clearAll = () => {
        setSearch(''); setStorage(''); setRam(''); setMinPrice(''); setMaxPrice(''); setSort('');
        router.get(route('public.store.index'));
    };

    const handleAddToCart = (e, product, defaultVariant) => {
        e.preventDefault();
        addToCart(product, defaultVariant, 1);
    };

    const getStockBadge = (stock) => {
        if (stock > 10) return <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">In Stock</span>;
        if (stock > 0)  return <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">Only {stock} Left</span>;
        return <span className="text-[10px] font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-slate-400">Out of Stock</span>;
    };

    // ── Reusable Sidebar Content ───────────────────────────────────────────────
    const SidebarContent = ({ onClose }) => (
        <div className="flex flex-col gap-6">
            {/* Search */}
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Search</p>
                <form onSubmit={(e) => { handleSearch(e); onClose?.(); }}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products…"
                            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-ink-600 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 dark:text-white transition-all"
                        />
                    </div>
                </form>
            </div>

            {/* Brands */}
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Brands</p>
                <div className="space-y-0.5">
                    <Link
                        href={route('public.store.index')}
                        onClick={() => onClose?.()}
                        className={`flex items-center px-3 py-2 rounded-xl text-sm font-medium transition-colors ${!currentbrand ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-ink-700'}`}
                    >
                        All Brands
                    </Link>
                    {brands.map((cat) => (
                        <Link
                            key={cat.id}
                            href={route('public.store.category', { category_slug: cat.slug })}
                            onClick={() => onClose?.()}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${currentbrand?.id === cat.id ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-ink-700'}`}
                        >
                            <BrandLogo name={cat.name} className="h-4 w-auto" />
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Price Range</p>
                <form onSubmit={(e) => { handlePriceFilter(e); onClose?.(); }} className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-2.5 top-2.5 text-xs text-slate-400">Rs</span>
                            <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full pl-8 pr-2 py-2 text-sm bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-ink-600 rounded-xl focus:outline-none focus:border-blue-400 dark:text-white" />
                        </div>
                        <span className="text-slate-300 dark:text-slate-600">—</span>
                        <div className="relative flex-1">
                            <span className="absolute left-2.5 top-2.5 text-xs text-slate-400">Rs</span>
                            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full pl-8 pr-2 py-2 text-sm bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-ink-600 rounded-xl focus:outline-none focus:border-blue-400 dark:text-white" />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-xl transition-all">
                        Apply
                    </button>
                </form>
            </div>

            {/* Storage */}
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Storage</p>
                <div className="flex flex-wrap gap-1.5">
                    {storageOptions.map(opt => (
                        <button key={opt} onClick={() => { handleFilterChange('storage', opt); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${storage === opt ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-ink-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-ink-600 hover:border-blue-300 hover:text-blue-600'}`}
                        >{opt}</button>
                    ))}
                </div>
            </div>

            {/* RAM */}
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">RAM</p>
                <div className="flex flex-wrap gap-1.5">
                    {ramOptions.map(opt => (
                        <button key={opt} onClick={() => { handleFilterChange('ram', opt); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${ram === opt ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 dark:bg-ink-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-ink-600 hover:border-blue-300 hover:text-blue-600'}`}
                        >{opt}</button>
                    ))}
                </div>
            </div>

            {hasActiveFilters && (
                <button onClick={() => { clearAll(); onClose?.(); }} className="text-xs text-slate-400 hover:text-red-500 transition-colors underline underline-offset-2">
                    Clear all filters
                </button>
            )}
        </div>
    );

    return (
        <PublicLayout>
            <Head title={currentbrand ? `${currentbrand.name} | Invenio` : 'All Products | Invenio'} />

            {/* Page Header */}
            <div className="bg-slate-900 border-b border-slate-800 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center text-xs text-slate-500 gap-1.5 mb-3">
                        <Link href={route('public.home')} className="hover:text-slate-300 transition-colors">Home</Link>
                        <ChevronRight className="h-3 w-3" />
                        <Link href={route('public.store.index')} className={!currentbrand ? 'text-white' : 'hover:text-slate-300 transition-colors'}>Store</Link>
                        {currentbrand && (
                            <>
                                <ChevronRight className="h-3 w-3" />
                                <span className="text-white">{currentbrand.name}</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-2xl md:text-4xl font-extrabold text-white">
                        {currentbrand ? currentbrand.name : 'All Products'}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        {products.total} product{products.total !== 1 ? 's' : ''} found
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Mobile Filter Toggle */}
                <div className="md:hidden flex items-center justify-between mb-5">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {products.total} products
                    </p>
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-600 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm hover:border-blue-300 transition-colors"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-blue-600 ml-0.5" />}
                    </button>
                </div>

                <div className="flex gap-7">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-60 flex-shrink-0">
                        <div className="bg-white dark:bg-ink-800 rounded-2xl border border-slate-100 dark:border-ink-700 p-5 sticky top-24">
                            <div className="flex items-center justify-between mb-5">
                                <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <SlidersHorizontal className="h-4 w-4 text-blue-600" /> Filters
                                </span>
                                {hasActiveFilters && (
                                    <button onClick={clearAll} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">Reset</button>
                                )}
                            </div>
                            <SidebarContent />
                        </div>
                    </aside>

                    {/* Mobile Drawer */}
                    {isMobileFiltersOpen && (
                        <div className="fixed inset-0 z-[100] md:hidden flex">
                            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
                            <div className="relative w-80 max-w-[90vw] bg-white dark:bg-ink-900 h-full shadow-2xl p-5 overflow-y-auto ml-auto flex flex-col">
                                <div className="flex items-center justify-between mb-5">
                                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <SlidersHorizontal className="h-4 w-4 text-blue-600" /> Filters
                                    </span>
                                    <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-ink-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                                <SidebarContent onClose={() => setIsMobileFiltersOpen(false)} />
                            </div>
                        </div>
                    )}

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        {/* Toolbar: active filters + sort */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                            {/* Active filter pills */}
                            <div className="flex flex-wrap items-center gap-2">
                                {currentbrand && (
                                    <button onClick={() => clearFilter('brand')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 border border-blue-200/60 dark:border-blue-500/20 transition-colors">
                                        Brand: {currentbrand.name} <X className="h-3 w-3" />
                                    </button>
                                )}
                                {search && (
                                    <button onClick={() => clearFilter('search')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 transition-colors">
                                        "{search}" <X className="h-3 w-3" />
                                    </button>
                                )}
                                {storage && (
                                    <button onClick={() => clearFilter('storage')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 transition-colors">
                                        {storage} <X className="h-3 w-3" />
                                    </button>
                                )}
                                {ram && (
                                    <button onClick={() => clearFilter('ram')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 transition-colors">
                                        RAM: {ram} <X className="h-3 w-3" />
                                    </button>
                                )}
                                {(minPrice || maxPrice) && (
                                    <button onClick={() => clearFilter('price')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200/60 dark:border-blue-500/20 transition-colors">
                                        Rs {minPrice || '0'} – {maxPrice || '∞'} <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            {/* Sort */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                                <select
                                    value={sort}
                                    onChange={handleSort}
                                    className="text-sm border border-slate-200 dark:border-ink-600 dark:bg-ink-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/10 transition-all"
                                >
                                    <option value="">Newest First</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {products.data.length === 0 ? (
                            <div className="bg-white dark:bg-ink-800 rounded-2xl border border-slate-100 dark:border-ink-700 p-14 text-center">
                                <Smartphone className="h-14 w-14 text-slate-200 dark:text-ink-600 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No products found</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-5">Try adjusting your search or filters.</p>
                                <button onClick={clearAll} className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {products.data.map((product) => {
                                    const outOfStock   = product.global_stock <= 0;
                                    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;

                                    return (
                                        <Link
                                            key={product.id}
                                            href={route('public.store.product', { category_slug: product.category?.slug || 'all', product_slug: product.slug })}
                                            className={`block group ${outOfStock ? 'opacity-70' : ''}`}
                                        >
                                            <div className="bg-white dark:bg-ink-800 rounded-2xl border border-slate-100 dark:border-ink-700 overflow-hidden hover:border-blue-200 dark:hover:border-blue-700/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">

                                                {/* Image */}
                                                <div className="relative bg-slate-50 dark:bg-ink-900 flex items-center justify-center p-5 min-h-[180px]">
                                                    {product.primary_image && product.primary_image.length > 0 ? (
                                                        <img
                                                            src={`/storage/${product.primary_image[0].path}`}
                                                            alt={product.name}
                                                            className="max-h-36 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <Smartphone className="h-14 w-14 text-slate-200 dark:text-ink-700" />
                                                    )}
                                                    {outOfStock && (
                                                        <div className="absolute inset-0 bg-white/50 dark:bg-ink-800/60 flex items-center justify-center">
                                                            <span className="text-[10px] font-bold bg-white dark:bg-ink-800 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200 dark:border-ink-600">Out of Stock</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Body */}
                                                <div className="p-4 flex flex-col flex-1">
                                                    {product.category && (
                                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">{product.category.name}</p>
                                                    )}
                                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-2 flex-1">
                                                        {product.name}
                                                    </h3>

                                                    {/* Variant chips */}
                                                    {defaultVariant && (
                                                        <div className="flex flex-wrap gap-1 mb-3">
                                                            <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-ink-700 text-slate-600 dark:text-slate-300">
                                                                {defaultVariant.name}
                                                            </span>
                                                            {product.variants.length > 1 && (
                                                                <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                                                                    +{product.variants.length - 1} more
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {product.short_description && (
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">{product.short_description}</p>
                                                    )}

                                                    {/* Price row */}
                                                    <div className="flex items-center justify-between mt-auto mb-3">
                                                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                                                            Rs {parseFloat(product.price).toLocaleString()}
                                                        </span>
                                                        {getStockBadge(product.global_stock)}
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="px-4 pb-4">
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, product, defaultVariant)}
                                                        disabled={outOfStock}
                                                        className="w-full h-9 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-100 disabled:to-slate-100 disabled:text-slate-400 dark:disabled:from-ink-700 dark:disabled:to-ink-700 dark:disabled:text-ink-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm shadow-blue-600/20 hover:shadow-blue-500/30"
                                                    >
                                                        <ShoppingCart className="h-3.5 w-3.5" />
                                                        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                        {/* Pagination */}
                        {products.links && products.links.length > 3 && (
                            <div className="mt-10 flex justify-center">
                                <div className="flex items-center gap-1">
                                    {products.links.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.url || '#'}
                                            className={`min-w-[38px] h-9 px-3 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                                                link.active
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                                    : !link.url
                                                        ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                                        : 'bg-white dark:bg-ink-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-ink-600 hover:border-blue-300 hover:text-blue-600 dark:hover:text-blue-400'
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
