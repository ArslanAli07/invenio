import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ShoppingCart, Menu, X, Moon, Sun, Zap, Search } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useCart } from '@/Contexts/CartContext';
import CartDrawer from '@/Components/CartDrawer';

export default function PublicLayout({ children }) {
    const { url } = usePage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { cartCount, setIsCartOpen } = useCart();

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDarkMode(false);
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 8);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleDarkMode = () => {
        if (isDarkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            setIsDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            setIsDarkMode(true);
        }
    };

    const navLinks = [
        { name: 'Home',    href: route('public.home'),         active: url === '/' },
        { name: 'Store',   href: route('public.store.index'),  active: url.startsWith('/store') },
        { name: 'About',   href: route('public.about'),        active: url === '/about' },
        { name: 'Contact', href: route('public.contact'),      active: url === '/contact' },
    ];

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-ink-900 transition-colors duration-200">
            <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'inherit', fontSize: '14px' } }} />

            {/* Top Promo Bar */}
            <div className="bg-slate-900 dark:bg-ink-950 text-slate-400 text-xs py-2 px-4 text-center hidden md:block">
                <span>🎉 Free delivery on orders over <strong className="text-indigo-400">Rs 3,000</strong> &nbsp;·&nbsp; 🛡️ 100% Genuine Products &nbsp;·&nbsp; 📞 0311-INVENIO</span>
            </div>

            {/* Navbar */}
            <nav className={`bg-white dark:bg-ink-800 border-b border-slate-200 dark:border-ink-700 sticky top-0 z-50 transition-all duration-200 ${isScrolled ? 'shadow-sm' : ''}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center h-16 gap-4">

                        {/* Logo */}
                        <Link href={route('public.home')} className="flex items-center gap-2.5 flex-shrink-0 group">
                            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center transition-opacity group-hover:opacity-85">
                                <Zap className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                                Invenio<span className="text-indigo-600">.</span>
                            </span>
                        </Link>

                        {/* Desktop Nav Links */}
                        <div className="hidden md:flex items-center gap-1 ml-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-ink-700'
                                    }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-md mx-4">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <input
                                    type="search"
                                    placeholder="Search phones, laptops, accessories…"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.target.value.trim()) {
                                            window.location.href = route('public.store.index') + '?search=' + encodeURIComponent(e.target.value.trim());
                                        }
                                    }}
                                    className="w-full h-10 pl-9 pr-4 text-sm bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-ink-600 rounded-xl focus:outline-none focus:border-indigo-400 focus:bg-white dark:focus:bg-ink-800 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder-slate-400 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 ml-auto">
                            <button
                                onClick={toggleDarkMode}
                                className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-ink-700 transition-colors"
                                aria-label="Toggle dark mode"
                            >
                                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                            </button>

                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-ink-700 border border-slate-200 dark:border-ink-600 transition-all"
                                aria-label="Open cart"
                            >
                                <ShoppingCart className="h-4 w-4" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center h-4 w-4 rounded-full bg-indigo-600 text-[10px] text-white font-bold border-2 border-white dark:border-ink-800">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Mobile menu */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-ink-700 transition-colors"
                            >
                                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-slate-200 dark:border-ink-700 bg-white dark:bg-ink-800">
                        <div className="px-4 pt-3 pb-2">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input type="search" placeholder="Search products…" className="w-full h-10 pl-9 pr-4 text-sm bg-slate-50 dark:bg-ink-900 border border-slate-200 dark:border-ink-600 rounded-xl focus:outline-none dark:text-white" />
                            </div>
                        </div>
                        <div className="px-2 pb-3 space-y-0.5">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                                        link.active
                                            ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400'
                                            : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-ink-700'
                                    }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content */}
            <main className="flex-1 w-full">{children}</main>

            <CartDrawer />

            {/* Footer */}
            <footer className="bg-slate-900 dark:bg-ink-950 text-slate-400 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">

                        {/* Brand */}
                        <div className="md:col-span-1">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center">
                                    <Zap className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-lg font-extrabold text-white">Invenio<span className="text-indigo-400">.</span></span>
                            </div>
                            <p className="text-sm leading-relaxed mb-5">
                                Pakistan's premium tech destination. Genuine products, fast delivery, and expert support.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {['COD', 'VISA', 'JazzCash', 'Easypaisa'].map(m => (
                                    <span key={m} className="text-[11px] font-medium px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">{m}</span>
                                ))}
                            </div>
                        </div>

                        {/* Shop */}
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Shop</h3>
                            <ul className="space-y-2.5">
                                {[['All Products', route('public.store.index')], ['New Arrivals', route('public.store.index')], ['Flash Deals', route('public.store.index')]].map(([label, href]) => (
                                    <li key={label}>
                                        <Link href={href} className="text-sm hover:text-indigo-400 transition-colors">{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Support</h3>
                            <ul className="space-y-2.5 text-sm">
                                <li><Link href={route('public.contact')} className="hover:text-indigo-400 transition-colors">Contact Us</Link></li>
                                <li><a href="https://wa.me/923000000000" className="text-green-400 hover:text-green-300 font-medium transition-colors">WhatsApp Us</a></li>
                                <li><span>support@invenio.pk</span></li>
                            </ul>
                        </div>

                        {/* Company */}
                        <div>
                            <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Company</h3>
                            <ul className="space-y-2.5">
                                {[['About Us', route('public.about')], ['Privacy Policy', '#'], ['Terms of Service', '#']].map(([label, href]) => (
                                    <li key={label}>
                                        <Link href={href} className="text-sm hover:text-indigo-400 transition-colors">{label}</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs">© {new Date().getFullYear()} Invenio. All rights reserved. Made with ❤️ in Pakistan.</p>
                        <Link href={route('login')} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">Staff Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
