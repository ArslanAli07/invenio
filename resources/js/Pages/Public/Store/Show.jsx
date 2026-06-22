import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Swiper, SwiperSlide } from 'swiper/react';
import { FreeMode, Navigation, Thumbs, EffectFade } from 'swiper/modules';
import { ChevronRight, Smartphone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/Contexts/CartContext';
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
    
    const images = [...(product.images || [])].sort((a, b) => {
        if (a.is_primary) return -1;
        if (b.is_primary) return 1;
        return a.sort_order - b.sort_order;
    });

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
        if (activeStock > 10) return { text: 'In Stock', color: 'text-zinc-600 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-700', icon: CheckCircle2 };
        if (activeStock > 0) return { text: `Only ${activeStock} Left`, color: 'text-zinc-600 dark:text-zinc-400 bg-stone-100 dark:bg-zinc-700', icon: AlertCircle };
        return { text: 'Out of Stock', color: 'text-zinc-500 bg-stone-100 dark:bg-zinc-800 dark:text-zinc-500', icon: AlertCircle };
    };

    const stockStatus = getStockDisplay();

    const handleAddToCart = () => {
        if (isOutOfStock) return;
        contextAddToCart(product, selectedVariant, 1);
    };

    return (
        <PublicLayout>
            <Head title={`${product.name} | Invenio`} />

            {/* Breadcrumb */}
            <div className="bg-[#faf9f6] dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-14 text-sm font-medium tracking-wide text-zinc-500 dark:text-zinc-400">
                        <Link href={route('public.home')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">Home</Link>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <Link href={route('public.store.index')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">Store</Link>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        {product.category && (
                            <>
                                <Link href={route('public.store.category', { category_slug: product.category.slug })} className="hover:text-zinc-900 dark:hover:text-white transition-colors uppercase">
                                    {product.category.name}
                                </Link>
                                <ChevronRight className="h-4 w-4 mx-2" />
                            </>
                        )}
                        <span className="text-zinc-900 dark:text-white truncate font-medium">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="bg-[#faf9f6] dark:bg-zinc-900 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="lg:grid lg:grid-cols-12 lg:gap-x-12">
                        {/* Left: Image Gallery */}
                        <div className="lg:col-span-7 mb-12 lg:mb-0">
                            <div className="sticky top-24">
                                {images.length > 0 ? (
                                    <div className="flex flex-col-reverse sm:flex-row gap-4">
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
                                                    <SwiperSlide key={img.id} className="cursor-pointer !w-20 !h-20 sm:!w-24 sm:!h-24 rounded-md overflow-hidden bg-white dark:bg-zinc-800 border-2 border-transparent ui-selected:border-zinc-900 dark:ui-selected:border-zinc-100 opacity-50 hover:opacity-100 transition-all duration-200">
                                                        <img src={`/storage/${img.path}`} alt={product.name} className="object-contain h-full w-full p-2.5 mix-blend-multiply dark:mix-blend-normal" />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 bg-white dark:bg-zinc-800 rounded-md sm:h-[600px] p-8 flex items-center justify-center border border-stone-200 dark:border-zinc-700">
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
                                                        <img src={`/storage/${img.path}`} alt={product.name} className="object-contain w-full h-full max-h-[500px] mix-blend-multiply dark:mix-blend-normal" />
                                                    </SwiperSlide>
                                                ))}
                                            </Swiper>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="aspect-square bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md flex items-center justify-center">
                                        <Smartphone className="h-32 w-32 text-stone-200 dark:text-zinc-700" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right: Product Info */}
                        <div className="lg:col-span-5 flex flex-col pt-4">
                            <div className="mb-8">
                                {product.category && (
                                    <h2 className="text-xs font-semibold tracking-widest text-zinc-500 dark:text-zinc-400 uppercase mb-3">
                                        {product.category.name}
                                    </h2>
                                )}
                                <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-4">
                                    {product.name}
                                </h1>
                                <div className="flex items-center flex-wrap gap-4 mb-6">
                                    <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                        Rs {parseFloat(activePrice).toLocaleString()}
                                    </span>
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-sm text-xs font-medium uppercase tracking-wide ${stockStatus.color}`}>
                                        {stockStatus.text}
                                    </span>
                                </div>
                                <p className="text-zinc-600 dark:text-zinc-400 font-normal">
                                    {product.short_description || 'No brief description available.'}
                                </p>
                            </div>

                            {/* Variants Selector */}
                            {product.variants.length > 0 && (
                                <div className="mb-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                                            Select Model
                                        </h3>
                                        {selectedVariant && (
                                            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
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
                                                    className={`relative flex flex-col items-center justify-center p-4 rounded-md border transition-colors ${
                                                        isSelected
                                                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
                                                            : 'border-stone-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-500'
                                                    }`}
                                                >
                                                    <span className={`font-medium text-sm ${isSelected ? '' : 'text-zinc-700 dark:text-zinc-300'}`}>
                                                        {variant.name}
                                                    </span>
                                                    {variant.price && parseFloat(variant.price) !== parseFloat(product.price) && (
                                                        <span className={`text-xs mt-1 ${isSelected ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
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
                            <div className="mt-auto space-y-4 pt-6 border-t border-stone-200 dark:border-zinc-700">
                                <button 
                                    onClick={handleAddToCart}
                                    disabled={isOutOfStock}
                                    className="w-full py-3 px-8 rounded-md flex items-center justify-center font-medium text-base transition-colors bg-[#6b7c5c] hover:bg-[#5a6b4c] disabled:bg-stone-100 disabled:text-zinc-400 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600 text-white"
                                >
                                    {isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Details & Specs */}
                    <div className="mt-20 pt-16 border-t border-stone-200 dark:border-zinc-700">
                        <div className="mb-12">
                            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">Overview</h2>
                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-6">Product Details</h3>
                            <div className="text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed max-w-3xl">
                                {product.description || 'No detailed description available for this product.'}
                            </div>
                        </div>

                        <div className="mb-12">
                            <h2 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">Specifications</h2>
                            <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight mb-6">Technical Details</h3>
                            
                            {product.specs && product.specs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {Object.entries(product.specs.reduce((acc, spec) => {
                                        const group = spec.spec_group || 'General Features';
                                        if (!acc[group]) acc[group] = [];
                                        acc[group].push(spec);
                                        return acc;
                                    }, {})).map(([group, specs]) => (
                                        <div key={group} className="bg-white dark:bg-zinc-800 rounded-md p-6 border border-stone-200 dark:border-zinc-700">
                                            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">{group}</h3>
                                            <div className="divide-y divide-stone-100 dark:divide-zinc-700/50">
                                                {specs.map((spec, i) => (
                                                    <div key={spec.id || i} className="flex py-3">
                                                        <div className="w-1/2 pr-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">{spec.spec_key}</div>
                                                        <div className="w-1/2 text-sm text-zinc-900 dark:text-zinc-100">{spec.spec_value || '-'}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-zinc-500 dark:text-zinc-400 font-normal">No technical specifications available.</p>
                            )}
                        </div>
                    </div>

                    {/* Related Products */}
                    {relatedProducts && relatedProducts.length > 0 && (
                        <div className="mt-20 pt-16 border-t border-stone-200 dark:border-zinc-700">
                            <div className="mb-10">
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">Similar Products</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {relatedProducts.map((rp) => (
                                    <Link 
                                        key={rp.id} 
                                        href={route('public.store.product', { category_slug: rp.category?.slug || 'all', product_slug: rp.slug })} 
                                        className="group block bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md hover:shadow-sm transition-shadow h-full flex flex-col"
                                    >
                                        <div className="aspect-square bg-stone-50 dark:bg-zinc-700 p-4 flex items-center justify-center rounded-t-md">
                                            {rp.primary_image && rp.primary_image.length > 0 ? (
                                                <img src={`/storage/${rp.primary_image[0].path}`} alt={rp.name} className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                                            ) : (
                                                <Smartphone className="h-10 w-10 text-stone-300 dark:text-zinc-600" />
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2">{rp.name}</h3>
                                            <p className="font-bold text-zinc-900 dark:text-zinc-100 mt-auto">Rs {parseFloat(rp.price).toLocaleString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
