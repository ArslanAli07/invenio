import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import BrandLogo from '@/Components/BrandLogo';

export default function Home({ featuredProducts, brands }) {
    const trustBadges = [
        { title: 'Genuine Products',  desc: '100% authentic, sealed in box'       },
        { title: 'Cash on Delivery',  desc: 'Pay when you receive your order'     },
        { title: 'Fast Shipping',     desc: 'Delivery within 2–3 working days'    },
        { title: 'Warranty Support',  desc: 'Official brand warranty covered'     },
    ];

    const dbBrands = brands ? [...new Map(brands.map(b => [b.name.trim().toLowerCase(), b])).values()] : [];
    const extraBrands = [
        { id: 'ex1', name: 'Nokia', slug: 'nokia' },
        { id: 'ex2', name: 'Xiaomi', slug: 'xiaomi' },
        { id: 'ex3', name: 'Vivo', slug: 'vivo' },
        { id: 'ex4', name: 'Oppo', slug: 'oppo' }
    ].filter(eb => !dbBrands.some(db => db.name.toLowerCase() === eb.name.toLowerCase()));
    
    const uniqueBrands = [...dbBrands, ...extraBrands];
    const marqueeItems = [...uniqueBrands, ...uniqueBrands];

    const testimonials = [
        {
            name: "Hamza R.",
            location: "Lahore",
            text: "Ordered a Galaxy S24 Ultra and it arrived sealed with full warranty card. Exactly what was advertised. Will definitely order again."
        },
        {
            name: "Fatima K.",
            location: "Karachi",
            text: "Cash on delivery made it so easy. The phone came in perfect condition and the support team answered my questions on WhatsApp instantly."
        },
        {
            name: "Usman T.",
            location: "Islamabad",
            text: "Best prices in Pakistan for genuine phones. I compared everywhere and Invenio was the only store with real stock and honest descriptions."
        }
    ];

    return (
        <PublicLayout>
            <Head title="Invenio | Premium Tech Store Pakistan" />

            {/* 1. HERO SECTION */}
            <section className="bg-[#faf9f6] dark:bg-zinc-900 min-h-[500px] flex items-center justify-center text-center px-4 border-b border-stone-200 dark:border-zinc-700 relative z-10">
                <div className="max-w-3xl mx-auto py-20 flex flex-col items-center">
                    <span className="bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-700 rounded-sm text-xs px-3 py-1 mb-6 uppercase tracking-widest font-semibold">
                        New Arrivals
                    </span>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-8">
                        Pakistan's <br/>
                        <span className="underline decoration-[#6b7c5c] decoration-2 underline-offset-4">Premium</span> Tech Store.
                    </h1>

                    <p className="text-zinc-500 dark:text-zinc-400 font-normal max-w-xl mx-auto mb-10 leading-relaxed text-lg">
                        Discover the latest smartphones, laptops, and gadgets at unbeatable prices. Genuine products. Fast delivery.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                        <Link
                            href={route('public.store.index')}
                            className="w-full sm:w-auto px-6 py-2.5 bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-md font-medium transition-colors text-center"
                        >
                            Shop Now
                        </Link>
                        <Link
                            href={route('public.store.index')}
                            className="w-full sm:w-auto px-6 py-2.5 bg-transparent border border-stone-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 rounded-md font-medium transition-colors text-center"
                        >
                            Explore Deals
                        </Link>
                    </div>
                </div>
            </section>

            {/* 2. NEW ARRIVALS */}
            {featuredProducts && featuredProducts.length > 0 && (
                <section className="px-4 md:px-8 py-12 max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                                New Arrivals
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                                The latest phones, freshly added.
                            </p>
                        </div>
                        <Link
                            href={route('public.store.index')}
                            className="text-sm text-[#6b7c5c] hover:underline"
                        >
                            View All &rarr;
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {featuredProducts.map((product) => {
                            const outOfStock = (product.global_stock ?? 1) <= 0;
                            return (
                                <Link
                                    key={product.id}
                                    href={route('public.store.product', { category_slug: product.category?.slug || 'all', product_slug: product.slug })}
                                    className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md overflow-hidden flex flex-col h-full hover:shadow-sm transition-shadow"
                                >
                                    <div className="aspect-square w-full overflow-hidden bg-stone-50 dark:bg-zinc-700 relative">
                                        {product.primary_image && product.primary_image.length > 0 ? (
                                            <img
                                                src={`/storage/${product.primary_image[0].path}`}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-4 mix-blend-multiply dark:mix-blend-normal"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-stone-100 dark:bg-zinc-600" />
                                        )}
                                        {outOfStock && (
                                            <div className="absolute top-3 right-3 bg-stone-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-sm text-xs px-2 py-1 uppercase tracking-wide font-medium">
                                                Out of Stock
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex flex-col flex-1">
                                        <div className="text-xs uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                                            {product.category?.name || 'Product'}
                                        </div>
                                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mt-1 truncate">
                                            {product.name}
                                        </div>
                                        <div className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                                            Rs {parseFloat(product.price).toLocaleString()}
                                        </div>
                                        <button className="mt-3 w-full bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white text-sm rounded-md py-2 font-medium transition-colors">
                                            {outOfStock ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            )}

            {/* 3. FEATURE STRIP */}
            <section className="bg-white dark:bg-zinc-800 border-y border-stone-200 dark:border-zinc-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12 text-center">
                        {trustBadges.map((badge, i) => (
                            <div key={i} className="flex flex-col">
                                <span className="font-medium text-zinc-900 dark:text-zinc-100">{badge.title}</span>
                                <span className="text-sm text-zinc-500 dark:text-zinc-400">{badge.desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 4. WHY BUY FROM US */}
            <section className="bg-white dark:bg-zinc-800 border-b border-stone-200 dark:border-zinc-700 py-16">
                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="text-xs uppercase tracking-widest text-[#6b7c5c] font-medium">Why Invenio</div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">Built for Pakistani Tech Buyers.</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
                        <div className="border-t-2 border-[#6b7c5c] pt-6">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">100% Genuine</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                                Every product is sealed, authentic, and sourced directly from official distributors. No grey market, no refurbs.
                            </p>
                        </div>
                        <div className="border-t-2 border-[#6b7c5c] pt-6">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Pay on Delivery</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                                Order online, pay when it arrives at your door. No upfront payment required. Available across Pakistan.
                            </p>
                        </div>
                        <div className="border-t-2 border-[#6b7c5c] pt-6">
                            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">Official Warranty</h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                                All products come with full official brand warranty. We handle after-sales support so you never feel stuck.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. BRAND MARQUEE */}
            {uniqueBrands && uniqueBrands.length > 0 && (
                <section className="py-12 bg-[#faf9f6] dark:bg-zinc-900">
                    <div className="overflow-hidden relative w-full group">
                        <div className="flex gap-8 animate-marquee w-max group-hover:[animation-play-state:paused]" style={{ willChange: 'transform' }}>
                            {marqueeItems.map((brand, i) => (
                                <Link
                                    key={`${brand.id}-${i}`}
                                    href={route('public.store.category', { category_slug: brand.slug })}
                                    className="flex flex-col items-center justify-center gap-2 min-w-[140px] bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md px-8 py-6 shrink-0 hover:border-zinc-400 transition-colors"
                                >
                                    {brand.name && <BrandLogo name={brand.name} className="w-10 h-10 object-contain filter grayscale dark:invert" />}
                                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{brand.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* 6. WHATSAPP CTA BANNER */}
            <section className="bg-[#6b7c5c] py-12 px-4 border-y border-[#5a6b4c]">
                <div className="flex items-center justify-between flex-wrap gap-6 max-w-7xl mx-auto">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Have a question before you buy?</h2>
                        <p className="text-sm text-white/80 mt-1">Chat with us on WhatsApp. We reply within minutes.</p>
                    </div>
                    <a
                        href="https://wa.me/923110000000"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white text-[#6b7c5c] hover:bg-stone-100 font-semibold rounded-md px-6 py-3 text-sm transition-colors"
                    >
                        Chat on WhatsApp
                    </a>
                </div>
            </section>

            {/* 7. TESTIMONIALS */}
            <section className="px-4 md:px-8 py-16 bg-[#faf9f6] dark:bg-zinc-900">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">What Our Customers Say</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Real buyers, real experiences.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md p-6 flex flex-col">
                                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed" spellCheck={false}>
                                    {t.text}
                                </p>
                                <div className="mt-4">
                                    <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{t.name}</div>
                                    <div className="text-xs text-zinc-400 dark:text-zinc-500">{t.location}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 8. CTA SECTION */}
            <section className="py-24 bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-200 border-t border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
                        Experience the Invenio Difference
                    </h2>
                    <p className="text-zinc-400 font-normal leading-relaxed mb-10 max-w-2xl mx-auto text-lg">
                        From product discovery to after-sales support, we're with you every step. Trusted by thousands of tech enthusiasts.
                    </p>
                    <Link
                        href={route('public.store.index')}
                        className="inline-block px-8 py-3 bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-md font-medium transition-colors"
                    >
                        Browse All Products
                    </Link>
                </div>
            </section>
        </PublicLayout>
    );
}
