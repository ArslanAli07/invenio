import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, EffectFade } from 'swiper/modules';
import { ShoppingCart, ChevronRight, Smartphone, AlertCircle, CheckCircle2, ShieldCheck, Truck, Package } from 'lucide-react';
import { useCart } from '@/Contexts/CartContext';
import toast from 'react-hot-toast';
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/effect-fade';

export default function StoreShow({ product, relatedProducts }) {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);
    const [mainSwiper, setMainSwiper] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(product.variants.length > 0 ? product.variants[0] : null);
    const { addToCart: contextAddToCart } = useCart();
    
    // Sort images: primary first, then sort_order
    const images = [...(product.images || [])].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return a.sort_order - b.sort_order;
    });

    // Dynamic Image Switching
    useEffect(() => {
        if (selectedVariant && mainSwiper) {
            const index = images.findIndex(img => img.variant_id === selectedVariant.id);
            if (index > -1) {
                mainSwiper.slideTo(index);
            }
        }
    }, [selectedVariant, mainSwiper, images]);

    const activePrice = selectedVariant && selectedVariant.price ? selectedVariant.price : product.price;
    const activeStock = selectedVariant ? selectedVariant.global_stock : product.global_stock;
    const isOutOfStock = activeStock <= 0;

    const getStockDisplay = () => {
        if (activeStock > 10) return { text: 'In Stock', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800', icon: CheckCircle2 };
        if (activeStock > 0) return { text: `Only ${activeStock} Left`, color: 'text-amber-700 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 border-amber-100 dark:border-amber-800', icon: AlertCircle };
        return { text: 'Out of Stock', color: 'text-slate-500 bg-slate-50 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-700', icon: AlertCircle };
    };

    const stockStatus = getStockDisplay();
    const StockIcon = stockStatus.icon;

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        contextAddToCart(product, selectedVariant, 1);
    };

    return (
        <PublicLayout>
            <Head title={`${product.name} | Invenio`} />

            {/* Premium Breadcrumb */}
            <div className="bg-white/80 dark:bg-ink-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-slate-200/60 dark:border-ink-700/60 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-14 text-xs font-medium tracking-wide text-slate-500 dark:text-slate-400">
                        <Link href={route('public.home')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="h-3.5 w-3.5 mx-2 text-slate-300 dark:text-ink-600" />
                        <Link href={route('public.store.index')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Store</Link>
                        <ChevronRight className="h-3.5 w-3.5 mx-2 text-slate-300 dark:text-ink-600" />
                        {product.category && (
                            <>
                                <Link href={route('public.store.category', { category_slug: product.category.slug })} className="hover:text-slate-900 dark:hover:text-white transition-colors uppercase">
                                    {product.category.name}
                                </Link>
                                <ChevronRight className="h-3.5 w-3.5 mx-2 text-slate-300 dark:text-ink-600" />
                            </>
                        )}
                        <span className="text-slate-900 dark:text-white truncate font-semibold">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-16">
                    {/* Left: Image Gallery */}
                    <div className="lg:col-span-7 mb-12 lg:mb-0">
                        <div className="sticky top-24">
                            {images.length > 0 ? (
                                <div className="flex flex-col-reverse sm:flex-row gap-4">
                                    {/* Thumbnails (Vertical on desktop) */}
                                    <div className="sm:w-24 flex-shrink-0">
                                        <Swiper
                                            onSwiper={setThumbsSwiper}
                                            direction="horizontal"
                                            breakpoints={{
                                                640: { direction: 'vertical' }
                                            }}
                                            spaceBetween={12}
                                            slidesPerView="auto"
                                            freeMode={true}
                                            watchSlidesProgress={true}
                                            modules={[FreeMode, Navigation, Thumbs]}
                                            className="h-24 sm:h-[600px] w-full"
                                        >
                                            {images.map((img) => (
                                                <SwiperSlide key={img.id} className="cursor-pointer !w-20 !h-20 sm:!w-24 sm:!h-24 rounded-2xl overflow-hidden bg-slate-50 dark:bg-ink-800 border-2 border-transparent ui-selected:border-slate-900 dark:ui-selected:border-white opacity-50 hover:opacity-100 transition-all duration-300">
                                                    <img src={`/storage/${img.path}`} alt={product.name} className="object-contain h-full w-full p-2.5 mix-blend-multiply dark:mix-blend-normal" />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                    
                                    {/* Main Image */}
                                    <div className="flex-1 min-w-0 bg-slate-50 dark:bg-ink-900/50 rounded-3xl sm:h-[600px] p-8 flex items-center justify-center">
                                        <Swiper
                                            onSwiper={setMainSwiper}
                                            effect="fade"
                                            spaceBetween={0}
                                            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                            modules={[FreeMode, Navigation, Thumbs, EffectFade]}
                                            className="w-full h-full"
                                        >
                                            {images.map((img) => (
                                                <SwiperSlide key={img.id} className="flex items-center justify-center">
                                                    <img src={`/storage/${img.path}`} alt={product.name} className="object-contain w-full h-full max-h-[500px] drop-shadow-2xl mix-blend-multiply dark:mix-blend-normal transform transition-transform duration-700 hover:scale-105" />
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-[4/3] bg-slate-50 dark:bg-ink-900 rounded-3xl flex items-center justify-center">
                                    <Smartphone className="h-32 w-32 text-slate-200 dark:text-ink-700" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="lg:col-span-5 flex flex-col pt-4">
                        <div className="mb-8">
                            {product.category && (
                                <h2 className="text-xs font-bold tracking-widest text-slate-500 dark:text-ink-400 uppercase mb-3">
                                    {product.category.name}
                                </h2>
                            )}
                            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4 leading-tight">
                                {product.name}
                            </h1>
                            <div className="flex items-center flex-wrap gap-4 mb-6">
                                <span className="text-3xl font-light text-slate-900 dark:text-white">
                                    Rs {parseFloat(activePrice).toLocaleString()}
                                </span>
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${stockStatus.color}`}>
                                    <StockIcon className="h-3.5 w-3.5 mr-1.5" />
                                    {stockStatus.text}
                                </span>
                            </div>
                            <p className="text-base text-slate-600 dark:text-ink-300 leading-relaxed font-light">
                                {product.short_description || 'Experience the next generation of mobile technology.'}
                            </p>
                        </div>

                        {/* Variants Selector */}
                        {product.variants.length > 0 && (
                            <div className="mb-10">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                                        Select Model
                                    </h3>
                                    {selectedVariant && (
                                        <span className="text-sm font-medium text-slate-500 dark:text-ink-400">
                                            {selectedVariant.name}
                                        </span>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {product.variants.map((variant) => {
                                        const isSelected = selectedVariant?.id === variant.id;
                                        return (
                                            <button
                                                key={variant.id}
                                                onClick={() => setSelectedVariant(variant)}
                                                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                                                    isSelected
                                                        ? 'border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-600 shadow-sm'
                                                        : 'border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-slate-900 dark:text-white hover:border-indigo-300 dark:hover:border-indigo-700'
                                                }`}
                                            >
                                                <span className={`font-semibold text-sm ${isSelected ? '' : 'text-slate-700 dark:text-ink-200'}`}>
                                                    {variant.name}
                                                </span>
                                                {variant.price && parseFloat(variant.price) !== parseFloat(product.price) && (
                                                    <span className={`text-xs mt-1 font-medium ${isSelected ? 'text-slate-300 dark:text-slate-600' : 'text-slate-500 dark:text-ink-400'}`}>
                                                        Rs {parseFloat(variant.price).toLocaleString()}
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Add to Cart Action */}
                        <div className="mt-auto space-y-4">
                            <button 
                                onClick={handleAddToCart}
                                disabled={isOutOfStock}
                                className={`group w-full py-4 px-8 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${
                                    isOutOfStock 
                                        ? 'bg-slate-100 text-slate-400 dark:bg-ink-800 dark:text-slate-500 cursor-not-allowed' 
                                        : 'bg-indigo-600 hover:bg-indigo-500 text-white transform hover:-translate-y-0.5'
                                }`}
                            >
                                <ShoppingCart className={`h-5 w-5 mr-3 ${isOutOfStock ? '' : 'group-hover:-rotate-12 transition-transform'}`} />
                                {isOutOfStock ? 'Currently Unavailable' : 'Add to Bag'}
                            </button>
                            
                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-slate-100 dark:border-ink-800">
                                <div className="flex flex-col items-center justify-center text-center p-3">
                                    <ShieldCheck className="h-6 w-6 text-slate-400 dark:text-ink-500 mb-2" />
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-ink-400 uppercase tracking-wider">1 Year<br/>Warranty</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center p-3">
                                    <Truck className="h-6 w-6 text-slate-400 dark:text-ink-500 mb-2" />
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-ink-400 uppercase tracking-wider">Free Next<br/>Day Delivery</span>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center p-3">
                                    <Package className="h-6 w-6 text-slate-400 dark:text-ink-500 mb-2" />
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-ink-400 uppercase tracking-wider">Free<br/>Returns</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details & Specs - Premium Section */}
                <div className="mt-20">
                    {/* Highlight Specs Row */}
                    {product.specs && product.specs.length > 0 && (
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 divide-x divide-slate-100 dark:divide-ink-800">
                                {/* Display Highlight */}
                                {(() => {
                                    const display = product.specs.find(s => s.spec_key === 'Screen Size')?.spec_value;
                                    return display ? (
                                        <div className="flex flex-col items-center text-center px-4">
                                            <Smartphone className="h-10 w-10 text-blue-500 dark:text-blue-400 mb-3" strokeWidth={1.5} />
                                            <span className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-tight">{display}</span>
                                            <span className="text-xs text-slate-500 dark:text-ink-400 uppercase tracking-wider">Display</span>
                                        </div>
                                    ) : null;
                                })()}
                                
                                {/* RAM Highlight */}
                                {(() => {
                                    const ram = product.specs.find(s => s.spec_key === 'RAM')?.spec_value;
                                    return ram ? (
                                        <div className="flex flex-col items-center text-center px-4">
                                            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-tight">{ram}</span>
                                            <span className="text-xs text-slate-500 dark:text-ink-400 uppercase tracking-wider">RAM</span>
                                        </div>
                                    ) : null;
                                })()}
                                
                                {/* Battery Highlight */}
                                {(() => {
                                    const battery = product.specs.find(s => s.spec_key === 'Type' && s.spec_group === 'Battery')?.spec_value || product.specs.find(s => s.spec_key === 'Battery')?.spec_value;
                                    return battery ? (
                                        <div className="flex flex-col items-center text-center px-4">
                                            <div className="h-10 w-10 text-emerald-500 dark:text-emerald-400 mb-3 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="12" height="16" rx="2" ry="2"/><line x1="10" y1="1" x2="14" y2="1"/><line x1="10" y1="12" x2="14" y2="8"/><line x1="10" y1="16" x2="14" y2="12"/></svg>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-tight">{battery}</span>
                                            <span className="text-xs text-slate-500 dark:text-ink-400 uppercase tracking-wider">Battery</span>
                                        </div>
                                    ) : null;
                                })()}
                                
                                {/* Camera Highlight */}
                                {(() => {
                                    const camera = product.specs.find(s => s.spec_key === 'Back Camera')?.spec_value;
                                    return camera ? (
                                        <div className="flex flex-col items-center text-center px-4">
                                            <div className="h-10 w-10 text-rose-500 dark:text-rose-400 mb-3 flex items-center justify-center">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-tight">{camera}</span>
                                            <span className="text-xs text-slate-500 dark:text-ink-400 uppercase tracking-wider">Back Camera</span>
                                        </div>
                                    ) : null;
                                })()}
                            </div>
                        </div>
                    )}

                    <div className="border-y border-slate-200/60 dark:border-ink-800/60 bg-slate-50/50 dark:bg-ink-900/20 backdrop-blur-sm py-16 mb-16">
                        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                            <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-4">Overview</h2>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">Everything you need. Exactly what you want.</h3>
                            <div className="prose dark:prose-invert prose-lg prose-slate text-slate-600 dark:text-ink-300 leading-relaxed font-light mx-auto">
                                {product.description || 'No detailed description available for this product.'}
                            </div>
                        </div>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-3">Specifications</h2>
                            <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Technical Details</h3>
                        </div>
                        {product.specs && product.specs.length > 0 ? (
                            <div className="columns-1 md:columns-2 gap-8 space-y-6">
                                {Object.entries(product.specs.reduce((acc, spec) => {
                                    const group = spec.spec_group || 'General Features';
                                    if (!acc[group]) acc[group] = [];
                                    acc[group].push(spec);
                                    return acc;
                                }, {})).map(([group, specs]) => (
                                    <div key={group} className="break-inside-avoid bg-white dark:bg-ink-900/50 rounded-2xl p-6 border border-slate-100 dark:border-ink-700 shadow-sm">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">{group}</h3>
                                        <div className="divide-y divide-slate-100 dark:divide-ink-800/60">
                                            {specs.map((spec, i) => (
                                                <div key={spec.id || i} className="flex py-2.5">
                                                    <div className="w-5/12 pr-4 text-sm font-medium text-slate-500 dark:text-ink-400 leading-snug">{spec.spec_key}</div>
                                                    <div className="w-7/12 text-sm text-slate-800 dark:text-ink-200 leading-snug">{spec.spec_value || '-'}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-slate-500 dark:text-ink-400 font-light italic">No technical specifications available.</p>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts && relatedProducts.length > 0 && (
                    <div className="mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Complete your experience</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map((rp) => (
                                <Link 
                                    key={rp.id} 
                                    href={route('public.store.product', { category_slug: rp.category?.slug || 'all', product_slug: rp.slug })} 
                                    className="group block h-full"
                                >
                                    <div className="bg-transparent h-full flex flex-col">
                                        <div className="aspect-[4/5] rounded-3xl bg-slate-50 dark:bg-ink-900/50 mb-6 overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:bg-slate-100 dark:group-hover:bg-ink-800">
                                            {rp.primary_image && rp.primary_image.length > 0 ? (
                                                <img src={`/storage/${rp.primary_image[0].path}`} alt={rp.name} className="object-contain w-full h-full p-8 mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <Smartphone className="h-12 w-12 text-slate-300 dark:text-ink-700" />
                                            )}
                                        </div>
                                        <div className="text-center">
                                            <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{rp.name}</h3>
                                            <p className="font-light text-slate-500 dark:text-ink-400">Rs {parseFloat(rp.price).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </PublicLayout>
    );
}
