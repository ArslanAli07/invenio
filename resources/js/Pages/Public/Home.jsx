import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { ShieldCheck, Truck, Clock, HeadphonesIcon, ArrowRight, Zap, Smartphone, Star, ShoppingCart } from 'lucide-react';
import BrandLogo from '@/Components/BrandLogo';
import { useCart } from '@/Contexts/CartContext';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Home({ featuredProducts, brands }) {
    const { addToCart } = useCart();

    const trustBadges = [
        { icon: ShieldCheck, title: 'Genuine Products',   desc: '100% authentic, sealed in box',         color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400' },
        { icon: Truck,       title: 'Cash on Delivery',   desc: 'Pay when you receive your order',        color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' },
        { icon: Clock,       title: 'Fast Shipping',      desc: 'Delivery within 2–3 working days',       color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10 dark:text-violet-400' },
        { icon: HeadphonesIcon, title: 'Warranty Support', desc: 'Official brand warranty covered',       color: 'text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400' },
    ];

    const handleQuickAdd = (e, product) => {
        e.preventDefault();
        const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
        addToCart(product, defaultVariant, 1);
    };

    return (
        <PublicLayout>
            <Head title="Invenio | Premium Tech Store Pakistan" />

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="relative bg-slate-900 overflow-hidden min-h-[520px] flex items-center">
                {/* Background glow */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
                </div>
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.8) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                    <div className="max-w-2xl">
                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/8 border border-white/15 text-blue-300 text-sm font-medium mb-6">
                            <Zap className="h-3.5 w-3.5" />
                            New Arrivals — Summer 2025
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
                            Pakistan's{' '}
                            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                                Premium
                            </span>{' '}
                            Tech Store
                        </h1>

                        <p className="text-lg text-slate-400 max-w-xl mb-8 leading-relaxed">
                            Discover the latest smartphones, laptops, and gadgets at unbeatable prices. Genuine products. Fast delivery. Expert support.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route('public.store.index')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5"
                            >
                                Shop Now <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route('public.store.index')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/8 border border-white/15 hover:bg-white/15 text-white font-semibold text-sm backdrop-blur-sm transition-all"
                            >
                                Explore Deals
                            </Link>
                        </div>


                    </div>
                </div>
            </section>

            {/* ── TRUST BAR ─────────────────────────────────────────── */}
            <section className="bg-white dark:bg-ink-800 border-b border-slate-100 dark:border-ink-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {trustBadges.map((badge, i) => (
                            <div key={i} className="flex items-center gap-5 p-6 rounded-2xl bg-slate-50 dark:bg-ink-900 border border-slate-100 dark:border-ink-700">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${badge.color}`}>
                                    <badge.icon className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="text-lg font-bold text-slate-900 dark:text-white">{badge.title}</div>
                                    <div className="text-base text-slate-500 dark:text-slate-400 mt-0.5">{badge.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURED PRODUCTS ─────────────────────────────────── */}
            {featuredProducts && featuredProducts.length > 0 && (
                <section className="py-14 bg-slate-50 dark:bg-ink-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Hand-picked for you</p>
                                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Featured Deals</h2>
                            </div>
                            <Link
                                href={route('public.store.index')}
                                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
                            >
                                View All <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        <Swiper
                            modules={[Autoplay, Pagination]}
                            spaceBetween={16}
                            slidesPerView={1}
                            breakpoints={{
                                480:  { slidesPerView: 2 },
                                768:  { slidesPerView: 3 },
                                1024: { slidesPerView: 4 },
                            }}
                            autoplay={{ delay: 3500, disableOnInteraction: false }}
                            pagination={{ clickable: true }}
                            className="pb-10"
                        >
                            {featuredProducts.map((product) => {
                                const outOfStock = (product.global_stock ?? 1) <= 0;
                                return (
                                    <SwiperSlide key={product.id} className="h-auto">
                                        <Link
                                            href={route('public.store.product', { category_slug: product.category?.slug || 'all', product_slug: product.slug })}
                                            className="block h-full group"
                                        >
                                            <div className="bg-white dark:bg-ink-800 rounded-2xl border border-slate-100 dark:border-ink-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                                                {/* Image */}
                                                <div className="relative bg-slate-50 dark:bg-ink-900 flex items-center justify-center p-5 min-h-[180px]">
                                                    {product.primary_image && product.primary_image.length > 0 ? (
                                                        <img
                                                            src={`/storage/${product.primary_image[0].path}`}
                                                            alt={product.name}
                                                            className="max-h-40 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    ) : (
                                                        <Smartphone className="h-16 w-16 text-slate-200 dark:text-ink-700" />
                                                    )}
                                                    {outOfStock && (
                                                        <div className="absolute inset-0 bg-white/60 dark:bg-ink-800/60 flex items-center justify-center rounded-t-2xl">
                                                            <span className="text-xs font-bold text-slate-500 bg-white dark:bg-ink-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-ink-600">Out of Stock</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Body */}
                                                <div className="p-4 flex flex-col flex-1">
                                                    {product.category && (
                                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-1">{product.category.name}</p>
                                                    )}
                                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-1 mb-3">
                                                        {product.name}
                                                    </h3>
                                                    <div className="flex items-center gap-1 mb-3">
                                                        <div className="flex text-amber-400 text-xs">{'★★★★★'}</div>
                                                        <span className="text-xs text-slate-400">(4.8)</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <span className="text-base font-extrabold text-slate-900 dark:text-white">
                                                            Rs {parseFloat(product.price).toLocaleString()}
                                                        </span>
                                                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${
                                                            outOfStock
                                                                ? 'bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-slate-400'
                                                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                        }`}>
                                                            {outOfStock ? 'Sold Out' : 'In Stock'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Footer */}
                                                <div className="px-4 pb-4">
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); if (!outOfStock) handleQuickAdd(e, product); }}
                                                        disabled={outOfStock}
                                                        className="w-full h-9 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 dark:disabled:from-ink-700 dark:disabled:to-ink-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-blue-600/20 hover:shadow-blue-500/30"
                                                    >
                                                        <ShoppingCart className="h-3.5 w-3.5" />
                                                        {outOfStock ? 'Notify Me' : 'Add to Cart'}
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    </SwiperSlide>
                                );
                            })}
                        </Swiper>
                    </div>
                </section>
            )}

            {/* ── SHOP BY BRAND MARQUEE ─────────────────────────────── */}
            {brands && brands.length > 0 && (
                <section className="relative py-16 bg-white dark:bg-ink-800 border-y border-slate-100 dark:border-ink-700 overflow-hidden">
                    <div className="text-center mb-10 relative z-20">
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">Browse by Category</p>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Shop by Brand</h2>
                    </div>

                    {/* Left/Right Fade Edges */}
                    <div className="absolute top-0 bottom-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-white dark:from-ink-800 to-transparent z-10 pointer-events-none" />
                    <div className="absolute top-0 bottom-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-white dark:from-ink-800 to-transparent z-10 pointer-events-none" />

                    <style>{`
                        @keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
                        .marquee-track { animation: marquee 60s linear infinite; }
                        .marquee-track:hover { animation-play-state: paused; }
                    `}</style>
                    <div className="relative flex overflow-hidden z-0 py-4">
                        <div className="marquee-track flex gap-8 px-8 whitespace-nowrap items-center">
                            {[...Array(4)].flatMap(() => brands).map((brand, i) => (
                                <Link 
                                    key={i} 
                                    href={route('public.store.category', { category_slug: brand.slug })}
                                    className="group shrink-0 focus:outline-none"
                                >
                                    <div className="bg-slate-50 dark:bg-ink-900 border border-slate-200/60 dark:border-ink-700 hover:border-blue-300 dark:hover:border-blue-600 rounded-3xl w-[220px] sm:w-[260px] h-[160px] flex flex-col items-center justify-center gap-5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 group-hover:-translate-y-2">
                                        <div className="h-16 flex items-center justify-center">
                                            <BrandLogo name={brand.name} className="h-12 w-auto object-contain max-w-[150px] transition-all duration-300" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-wide">
                                            {brand.name}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── WHY INVENIO ───────────────────────────────────────── */}
            <section className="py-14 bg-slate-50 dark:bg-ink-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-3xl px-8 py-12 md:px-14 flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div className="text-center md:text-left">
                            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Why choose us</p>
                            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">Experience the Invenio Difference</h2>
                            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                                From product discovery to after-sales support, we're with you every step. Trusted by thousands of Pakistani tech enthusiasts.
                            </p>
                        </div>
                        <Link
                            href={route('public.store.index')}
                            className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5"
                        >
                            Browse All Products <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
