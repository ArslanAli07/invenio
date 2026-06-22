import { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { ShoppingCart, Menu, X, Search, Sun, Moon } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useCart } from '@/Contexts/CartContext';
import CartDrawer from '@/Components/CartDrawer';

export default function PublicLayout({ children }) {
    const { url } = usePage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cartCount, setIsCartOpen } = useCart();
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const isDarkMode = localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
        setIsDark(isDarkMode);
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, []);

    const toggleDark = () => {
        const next = !isDark;
        setIsDark(next);
        if (next) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
        }
    };

    const navLinks = [
        { name: 'Home',    href: route('public.home'),         active: url === '/' },
        { name: 'Store',   href: route('public.store.index'),  active: url.startsWith('/store') },
        { name: 'About',   href: route('public.about'),        active: url === '/about' },
        { name: 'Contact', href: route('public.contact'),      active: url === '/contact' },
    ];

    return (
        <div className="min-h-screen flex flex-col font-sans">
            <Toaster position="top-right" toastOptions={{ style: { fontFamily: 'inherit', fontSize: '14px' } }} />

            {/* Top Promo Bar */}
            <div className="bg-zinc-900 dark:bg-zinc-950 text-zinc-100 dark:text-zinc-300 text-xs py-2 px-4 text-center hidden md:block">
                Free delivery on orders over Rs 3,000. Shop with confidence.
            </div>

            {/* Navbar */}
            <nav className="bg-white dark:bg-zinc-800 border-b border-stone-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 sticky top-0 w-full z-[100] shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        {/* Logo */}
                        <div className="flex items-center gap-8">
                            <Link href={route('public.home')} className="text-xl font-bold tracking-tight">
                                Invenio.
                            </Link>

                            {/* Desktop Nav Links */}
                            <div className="hidden md:flex items-center gap-6">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`text-sm transition-colors ${
                                            link.active
                                                ? 'text-[#6b7c5c] font-medium'
                                                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 font-normal'
                                        }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleDark}
                                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors focus:outline-none"
                                aria-label="Toggle Dark Mode"
                            >
                                {isDark ? <Sun className="h-5 w-5" strokeWidth={1.5} /> : <Moon className="h-5 w-5" strokeWidth={1.5} />}
                            </button>

                            <button
                                onClick={() => setIsCartOpen(true)}
                                className="relative flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors focus:outline-none"
                                aria-label="Cart"
                            >
                                <ShoppingCart className="h-5 w-5" strokeWidth={1.5} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 flex items-center justify-center h-4 w-4 rounded-full bg-[#6b7c5c] text-[10px] text-white font-bold">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </button>

                            {/* Mobile menu toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden flex items-center justify-center text-zinc-500 dark:text-zinc-400 focus:outline-none"
                            >
                                {isMobileMenuOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800">
                        <div className="px-4 py-4 flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-base py-2 ${
                                        link.active ? 'text-[#6b7c5c] font-medium' : 'text-zinc-600 dark:text-zinc-400 font-normal'
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
            <footer className="bg-zinc-900 dark:bg-zinc-950 text-zinc-400 dark:text-zinc-500 pt-16 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="md:col-span-1">
                            <span className="text-xl font-bold tracking-tight text-white block mb-4">Invenio.</span>
                            <p className="text-sm leading-relaxed mb-6">
                                Premium tech destination. Genuine products, fast delivery, expert support.
                            </p>
                        </div>
                        
                        <div>
                            <h3 className="text-xs font-bold text-white tracking-wider uppercase mb-4">Shop</h3>
                            <ul className="space-y-3">
                                <li><Link href={route('public.store.index')} className="text-sm hover:text-white transition-colors">All Products</Link></li>
                                <li><Link href={route('public.store.index')} className="text-sm hover:text-white transition-colors">New Arrivals</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-white tracking-wider uppercase mb-4">Support</h3>
                            <ul className="space-y-3">
                                <li><Link href={route('public.contact')} className="text-sm hover:text-white transition-colors">Contact Us</Link></li>
                                <li><span className="text-sm">support@invenio.pk</span></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold text-white tracking-wider uppercase mb-4">Legal</h3>
                            <ul className="space-y-3">
                                <li><Link href={route('public.about')} className="text-sm hover:text-white transition-colors">About Us</Link></li>
                                <li><Link href="#" className="text-sm hover:text-white transition-colors">Privacy</Link></li>
                                <li><Link href="#" className="text-sm hover:text-white transition-colors">Terms</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 dark:border-zinc-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p className="text-xs">© {new Date().getFullYear()} Invenio. All rights reserved.</p>
                        <Link href={route('login')} className="text-xs hover:text-white transition-colors">Staff Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
