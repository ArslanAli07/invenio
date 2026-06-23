import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Search, SlidersHorizontal, Smartphone, ChevronRight, X, ArrowUpDown } from 'lucide-react';
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
        if (stock > 10) return <span className="text-xs font-medium text-[#6b7c5c] dark:text-[#8a9e78]">IN STOCK</span>;
        if (stock > 0)  return <span className="text-xs font-medium text-[#6b7c5c] dark:text-[#8a9e78]">ONLY {stock} LEFT</span>;
        return <span className="text-xs font-medium text-red-500 dark:text-red-400">OUT OF STOCK</span>;
    };

    const SidebarContent = ({ onClose }) => (
        <div className="flex flex-col gap-6">
            {/* Search */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 mt-4">Search</p>
                <form onSubmit={(e) => { handleSearch(e); onClose?.(); }}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search products…"
                            className="w-full border border-stone-200 dark:border-zinc-600 rounded-md pl-9 pr-3 py-2 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400"
                        />
                    </div>
                </form>
            </div>

            {/* Brands */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 mt-4">Brands</p>
                <div className="space-y-1">
                    <Link
                        href={route('public.store.index')}
                        onClick={() => onClose?.()}
                        className={!currentbrand ? 'block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-500' : 'block w-full text-left px-3 py-1.5 rounded-md text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-stone-50 dark:hover:bg-zinc-700 border border-transparent'}
                    >
                        All Brands
                    </Link>
                    {brands.map((cat) => (
                        <Link
                            key={cat.id}
                            href={route('public.store.category', { category_slug: cat.slug })}
                            onClick={() => onClose?.()}
                            className={currentbrand?.id === cat.id ? 'block w-full text-left px-3 py-1.5 rounded-md text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-300 dark:border-zinc-500' : 'block w-full text-left px-3 py-1.5 rounded-md text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-stone-50 dark:hover:bg-zinc-700 border border-transparent'}
                        >
                            {cat.name}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Price Range */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 mt-4">Price Range</p>
                <form onSubmit={(e) => { handlePriceFilter(e); onClose?.(); }} className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1.5 text-xs text-zinc-400">Rs</span>
                            <input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
                                className="w-full border border-stone-200 dark:border-zinc-600 rounded-md pl-8 pr-2 py-1.5 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" />
                        </div>
                        <span className="text-stone-300 dark:text-zinc-600">—</span>
                        <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1.5 text-xs text-zinc-400">Rs</span>
                            <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                                className="w-full border border-stone-200 dark:border-zinc-600 rounded-md pl-8 pr-2 py-1.5 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100" />
                        </div>
                    </div>
                    <button type="submit" className="w-full mt-3 bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-md py-2 text-sm font-medium transition-colors">
                        Apply
                    </button>
                </form>
            </div>

            {/* Storage */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 mt-4">Storage</p>
                <div className="flex flex-wrap gap-1.5">
                    {storageOptions.map(opt => (
                        <button key={opt} onClick={() => { handleFilterChange('storage', opt); }}
                            className={storage === opt ? 'px-3 py-1 rounded-md text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'px-3 py-1 rounded-md text-xs border border-stone-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'}
                        >{opt}</button>
                    ))}
                </div>
            </div>

            {/* RAM */}
            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mb-2 mt-4">RAM</p>
                <div className="flex flex-wrap gap-1.5">
                    {ramOptions.map(opt => (
                        <button key={opt} onClick={() => { handleFilterChange('ram', opt); }}
                            className={ram === opt ? 'px-3 py-1 rounded-md text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900' : 'px-3 py-1 rounded-md text-xs border border-stone-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'}
                        >{opt}</button>
                    ))}
                </div>
            </div>

            {hasActiveFilters && (
                <button onClick={() => { clearAll(); onClose?.(); }} className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                    Clear all filters
                </button>
            )}
        </div>
    );

    return (
        <PublicLayout>
            <Head title={currentbrand ? `${currentbrand.name} | Invenio` : 'All Products | Invenio'} />

            {/* Page Header */}
            <div className="bg-[#faf9f6] dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-700 pt-10 pb-6 mb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center text-sm font-medium text-zinc-500 gap-1.5 mb-3">
                        <Link href={route('public.home')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="h-4 w-4" />
                        <Link href={route('public.store.index')} className={!currentbrand ? 'text-zinc-900 dark:text-zinc-100' : 'hover:text-zinc-900 dark:hover:text-white transition-colors'}>Store</Link>
                        {currentbrand && (
                            <>
                                <ChevronRight className="h-4 w-4" />
                                <span className="text-zinc-900 dark:text-zinc-100">{currentbrand.name}</span>
                            </>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                        {currentbrand ? currentbrand.name : 'All Products'}
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        {products.total} product{products.total !== 1 ? 's' : ''} found
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Mobile Filter Toggle */}
                <div className="md:hidden flex items-center justify-between mb-5">
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {products.total} products
                    </p>
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md text-sm font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                    </button>
                </div>

                <div className="flex gap-8">
                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-64 flex-shrink-0">
                        <div className="w-[260px] shrink-0 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md p-5 self-start sticky top-4">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                                    Filters
                                </span>
                                {hasActiveFilters && (
                                    <button onClick={clearAll} className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium transition-colors">Reset</button>
                                )}
                            </div>
                            <SidebarContent />
                        </div>
                    </aside>

                    {/* Mobile Drawer */}
                    {isMobileFiltersOpen && (
                        <div className="fixed inset-0 z-[100] md:hidden flex">
                            <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
                            <div className="relative w-80 max-w-[90vw] bg-white dark:bg-zinc-900 h-full p-6 overflow-y-auto ml-auto flex flex-col border-l border-stone-200 dark:border-zinc-700">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                                        Filters
                                    </span>
                                    <button onClick={() => setIsMobileFiltersOpen(false)} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                        <X className="h-5 w-5" />
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
                                    <button onClick={() => clearFilter('brand')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-stone-100 text-zinc-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 transition-colors">
                                        Brand: {currentbrand.name} <X className="h-3 w-3" />
                                    </button>
                                )}
                                {search && (
                                    <button onClick={() => clearFilter('search')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-stone-100 text-zinc-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 transition-colors">
                                        "{search}" <X className="h-3 w-3" />
                                    </button>
                                )}
                                {storage && (
                                    <button onClick={() => clearFilter('storage')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-stone-100 text-zinc-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 transition-colors">
                                        {storage} <X className="h-3 w-3" />
                                    </button>
                                )}
                                {ram && (
                                    <button onClick={() => clearFilter('ram')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-stone-100 text-zinc-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 transition-colors">
                                        RAM: {ram} <X className="h-3 w-3" />
                                    </button>
                                )}
                                {(minPrice || maxPrice) && (
                                    <button onClick={() => clearFilter('price')} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-stone-100 text-zinc-700 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700 transition-colors">
                                        Rs {minPrice || '0'} – {maxPrice || '∞'} <X className="h-3 w-3" />
                                    </button>
                                )}
                            </div>

                            {/* Sort */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">Sort by</span>
                                <select
                                    value={sort}
                                    onChange={handleSort}
                                    className="border border-stone-200 dark:border-zinc-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                >
                                    <option value="">Newest First</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {products.data.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-800 rounded-md border border-stone-200 dark:border-zinc-700 p-14 text-center">
                                <Smartphone className="h-14 w-14 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">No products found</h3>
                                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-5">Try adjusting your search or filters.</p>
                                <button onClick={clearAll} className="px-5 py-2 rounded-md bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white text-sm font-medium transition-colors">
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
                                            className={`block group bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md overflow-hidden hover:shadow-sm transition-shadow flex flex-col h-full ${outOfStock ? 'opacity-70' : ''}`}
                                        >
                                            {/* Image */}
                                            <div className="aspect-square w-full overflow-hidden bg-stone-50 dark:bg-zinc-700 relative">
                                                {product.primary_image && product.primary_image.length > 0 ? (
                                                    <img
                                                        src={`/storage/${product.primary_image[0].path}`}
                                                        alt={product.name}
                                                        className="w-full h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-zinc-600 dark:bg-zinc-600 flex items-center justify-center" />
                                                )}
                                            </div>

                                            {/* Body */}
                                            <div className="p-4 flex flex-col flex-1">
                                                <span className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500 font-medium mb-1">
                                                    {product.category?.name || 'Product'}
                                                </span>
                                                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                                                    {product.name}
                                                </h3>

                                                {/* Price row */}
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                                                        Rs {parseFloat(product.price).toLocaleString()}
                                                    </span>
                                                    {!outOfStock && getStockBadge(product.global_stock)}
                                                </div>

                                                {/* Add to Cart */}
                                                <button
                                                    onClick={(e) => handleAddToCart(e, product, defaultVariant)}
                                                    disabled={outOfStock}
                                                    className="mt-3 w-full bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white text-sm rounded-md py-2 font-medium transition-colors"
                                                >
                                                    Add to Cart
                                                </button>
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
                                            className={`min-w-[36px] h-9 px-3 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                                                link.active
                                                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                                                    : !link.url
                                                        ? 'text-zinc-300 dark:text-zinc-600 cursor-not-allowed'
                                                        : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-stone-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-700'
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
