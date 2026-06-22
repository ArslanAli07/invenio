import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { ShieldCheck, Truck, Clock, HeadphonesIcon } from 'lucide-react';
import BrandLogo from '@/Components/BrandLogo';

export default function Home({ featuredProducts, brands }) {
    const trustBadges = [
        { icon: ShieldCheck, title: 'Genuine Products',  desc: '100% authentic, sealed in box'       },
        { icon: Truck, title: 'Cash on Delivery',  desc: 'Pay when you receive your order'     },
        { icon: Clock, title: 'Fast Shipping',     desc: 'Delivery within 2–3 working days'    },
        { icon: HeadphonesIcon, title: 'Warranty Support',  desc: 'Official brand warranty covered'     },
    ];

    const uniqueBrands = brands ? [...new Map(brands.map(b => [b.id, b])).values()] : [];

    return (
        <PublicLayout>
            <Head title="Invenio | Premium Tech Store Pakistan" />

            {/* HERO SECTION */}
            <section className="bg-[#faf9f6] dark:bg-zinc-900 min-h-[500px] flex items-center justify-center text-center px-4 border-b border-stone-200 dark:border-zinc-700">
                <div className="max-w-3xl mx-auto py-20 flex flex-col items-center">
                    <span className="bg-stone-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-stone-200 dark:border-zinc-700 rounded-md text-xs px-3 py-1 mb-6 uppercase tracking-widest font-semibold">
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

            {/* FEATURE STRIP */}
            <section className="bg-white dark:bg-zinc-800 border-b border-stone-200 dark:border-zinc-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-12 text-center md:text-left">
                        {trustBadges.map((badge, i) => {
                            const Icon = badge.icon;
                            return (
                                <div key={i} className="flex items-center gap-4">
                                    <Icon className="w-8 h-8 text-zinc-400 dark:text-zinc-500" strokeWidth={1.5} />
                                    <div className="flex flex-col">
                                        <span className="font-medium text-zinc-900 dark:text-zinc-100">{badge.title}</span>
                                        <span className="text-sm text-zinc-500 dark:text-zinc-400 font-normal">{badge.desc}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* FEATURED PRODUCTS (Grid style as preparation for store) */}
            {featuredProducts && featuredProducts.length > 0 && (
                <section className="py-20 bg-[#faf9f6] dark:bg-zinc-900">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-end justify-between mb-8">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Featured Deals</h2>
                            <Link
                                href={route('public.store.index')}
                                className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                            >
                                View All
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {featuredProducts.map((product) => {
                                const outOfStock = (product.global_stock ?? 1) <= 0;
                                return (
                                    <Link
                                        key={product.id}
                                        href={route('public.store.product', { category_slug: product.category?.slug || 'all', product_slug: product.slug })}
                                        className="group block bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md hover:shadow-sm transition-shadow overflow-hidden flex flex-col h-full"
                                    >
                                        <div className="aspect-square bg-stone-50 dark:bg-zinc-700 p-4 flex items-center justify-center relative">
                                            {product.primary_image && product.primary_image.length > 0 ? (
                                                <img
                                                    src={`/storage/${product.primary_image[0].path}`}
                                                    alt={product.name}
                                                    className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-stone-200 dark:bg-zinc-600 rounded-sm" />
                                            )}
                                            {outOfStock && (
                                                <div className="absolute top-3 right-3 bg-stone-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-sm text-xs px-2 py-1 uppercase tracking-wide font-medium">
                                                    Out of Stock
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 flex flex-col flex-1">
                                            <span className="text-xs text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1">
                                                {product.category?.name || 'Product'}
                                            </span>
                                            <h3 className="font-medium text-zinc-900 dark:text-zinc-100 flex-1">
                                                {product.name}
                                            </h3>
                                            <div className="mt-4 flex items-center justify-between">
                                                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                                                    Rs {parseFloat(product.price).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* BRAND CAROUSEL */}
            {uniqueBrands && uniqueBrands.length > 0 && (
                <section className="py-20 bg-white dark:bg-zinc-800 border-y border-stone-200 dark:border-zinc-700">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="mb-8">
                            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Shop by Brand</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {uniqueBrands.map((brand, i) => (
                                <Link
                                    key={i}
                                    href={route('public.store.category', { category_slug: brand.slug })}
                                    className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md p-6 flex flex-col items-center justify-center gap-3 hover:bg-stone-50 dark:hover:bg-zinc-700 transition-colors"
                                >
                                    <BrandLogo name={brand.name} className="h-8 w-auto object-contain filter grayscale dark:invert" />
                                    <span className="text-zinc-700 dark:text-zinc-300 text-sm font-medium">{brand.name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA SECTION */}
            <section className="py-24 bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-200">
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
