import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { ShieldCheck, Truck, Clock, HeadphonesIcon, ArrowRight, Zap, Smartphone } from 'lucide-react';
import BrandLogo from '@/Components/BrandLogo';
import { useCart } from '@/Contexts/CartContext';
import 'swiper/css';
import 'swiper/css/pagination';

export default function Home({ featuredProducts, brands }) {
    const { addToCart } = useCart();

    const trustBadges = [
        { icon: ShieldCheck,      title: 'Genuine Products',  desc: '100% authentic, sealed in box'       },
        { icon: Truck,            title: 'Cash on Delivery',  desc: 'Pay when you receive your order'     },
        { icon: Clock,            title: 'Fast Shipping',     desc: 'Delivery within 2–3 working days'    },
        { icon: HeadphonesIcon,   title: 'Warranty Support',  desc: 'Official brand warranty covered'     },
    ];

    const handleQuickAdd = (e, product) => {
        e.preventDefault();
        const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
        addToCart(product, defaultVariant, 1);
    };

    const uniqueBrands = brands ? [...new Map(brands.map(b => [b.id, b])).values()] : [];

    return (
        <PublicLayout>
            <Head title="Invenio | Premium Tech Store Pakistan" />

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section className="relative bg-slate-50 dark:bg-ink-950 overflow-hidden min-h-[520px] flex items-center">
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
                    <div className="max-w-2xl">
                        {/* Eyebrow */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 dark:bg-ink-800 dark:text-slate-300 dark:border-ink-700 text-xs font-semibold mb-6 tracking-wide">
                            <Zap className="h-3 w-3" />
                            New Arrivals — Summer 2025
                        </div>

                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
                            Pakistan's{' '}
                            <span className="text-slate-900 dark:text-white underline decoration-indigo-500 decoration-2 underline-offset-4">
                                Premium
                            </span>{' '}
                            Tech Store
                        </h1>

                        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mb-8 leading-relaxed font-light">
                            Discover the latest smartphones, laptops, and gadgets at unbeatable prices. Genuine products. Fast delivery. Expert support.
                        </p>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route('public.store.index')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-colors"
                            >
                                Shop Now <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href={route('public.store.index')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-transparent border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-ink-600 dark:text-slate-300 dark:hover:bg-ink-800 font-semibold text-sm transition-colors"
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
                    <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-8">
                        {trustBadges.map((badge, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <badge.icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                                <div>
                                    <div className="text-sm font-semibold text-slate-900 dark:text-white">{badge.title}</div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{badge.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FEATURED PRODUCTS ─────────────────────────────────── */}
            {featuredProducts && featuredProducts.length > 0 && (
                <section className="py-16 bg-slate-50 dark:bg-ink-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-8">
                            <div>
                                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">Hand-picked for you</p>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Featured Deals</h2>
                            </div>
                            <Link
                                href={route('public.store.index')}
                                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 transition-colors"
                            >
                                View All <ArrowRight className="h-3.5 w-3.5" />
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
                                            <div className="bg-white dark:bg-ink-800 rounded-2xl border border-slate-100 dark:border-ink-700 overflow-hidden hover:border-indigo-200 dark:hover:border-indigo-700/50 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
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
                                                        <div className="absolute inset-0 bg-white/70 dark:bg-ink-800/70 flex items-center justify-center">
                                                            <span className="text-xs font-semibold text-slate-500 bg-white dark:bg-ink-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-ink-600">Out of Stock</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Body */}
                                                <div className="p-4 flex flex-col flex-1">
                                                    {product.category && (
                                                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">{product.category.name}</p>
                                                    )}
                                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug flex-1 mb-3">
                                                        {product.name}
                                                    </h3>
                                                    <div className="flex items-center justify-between mt-auto">
                                                        <span className="text-base font-bold text-slate-900 dark:text-white">
                                                            Rs {parseFloat(product.price).toLocaleString()}
                                                        </span>
                                                        <span className={`text-[10px] font-semibold px-2 py-1 rounded-lg ${
                                                            outOfStock
                                                                ? 'bg-slate-100 text-slate-500 dark:bg-ink-700 dark:text-slate-400'
                                                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                                        }`}>
                                                            {outOfStock ? 'Sold Out' : 'In Stock'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* CTA */}
                                                <div className="px-4 pb-4">
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); if (!outOfStock) handleQuickAdd(e, product); }}
                                                        disabled={outOfStock}
                                                        className="w-full h-9 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-ink-700 dark:disabled:text-slate-500 text-white text-xs font-semibold transition-all"
                                                    >
                                                        {outOfStock ? 'Out of Stock' : 'Add to Cart'}
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
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1.5">Browse by Category</p>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Shop by Brand</h2>
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
                        <div className="marquee-track flex gap-6 px-6 whitespace-nowrap items-center">
                            {[...Array(4)].flatMap(() => uniqueBrands).map((brand, i) => (
                                <Link
                                    key={i}
                                    href={route('public.store.category', { category_slug: brand.slug })}
                                    className="group shrink-0 focus:outline-none"
                                >
                                    <div className="bg-slate-50 hover:bg-slate-100 dark:bg-ink-900 dark:hover:bg-ink-800 rounded-xl w-[200px] sm:w-[240px] h-[140px] flex flex-col items-center justify-center gap-4 transition-colors duration-300">
                                        <div className="h-12 flex items-center justify-center">
                                            <BrandLogo name={brand.name} className="h-10 w-auto object-contain max-w-[130px] transition-all duration-300" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {brand.name}
                                        </h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA BANNER ─────────────────────────────────────────── */}
            <section className="py-14 bg-slate-50 dark:bg-ink-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-slate-900 dark:bg-ink-950 rounded-2xl border border-indigo-500/20 px-8 py-12 md:px-14 flex flex-col md:flex-row items-center gap-8 justify-between">
                        <div className="text-center md:text-left">
                            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Why choose us</p>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 tracking-tight">Experience the Invenio Difference</h2>
                            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                                From product discovery to after-sales support, we're with you every step. Trusted by thousands of Pakistani tech enthusiasts.
                            </p>
                        </div>
                        <Link
                            href={route('public.store.index')}
                            className="flex-shrink-0 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all hover:-translate-y-0.5"
                        >
                            Browse All Products <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}
