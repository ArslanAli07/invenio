import ApplicationLogo from '@/Components/ApplicationLogo';
import { useTheme } from '@/Components/ThemeProvider';
import { Link, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Boxes,
    MapPin,
    UserCheck,
    Package,
    ClipboardList,
    Activity,
    Users,
    User as UserIcon,
    LogOut,
    Menu,
    X,
    ChevronDown,
    CheckCircle2,
    AlertCircle,
    Sun,
    Moon,
    ArrowRightLeft,
    PackageCheck,
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const { theme, toggleTheme } = useTheme();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    // Toast state
    const [toasts, setToasts] = useState([]);

    // Watch Inertia flash messages
    useEffect(() => {
        if (flash?.success) addToast(flash.success, 'success');
        if (flash?.error) addToast(flash.error, 'error');
    }, [flash]);

    const addToast = (message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        if (type === 'success') {
            setTimeout(() => removeToast(id), 4000);
        }
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const navigation = [
        { name: 'Dashboard',       href: route('dashboard'),          icon: LayoutDashboard, active: route().current('dashboard'),      roles: ['admin','manager','staff','supplier'] },
        { name: 'Products',        href: route('products.index'),     icon: Package,         active: route().current('products.*'),     roles: ['admin','manager','staff'] },
        { name: 'Brands',          href: route('categories.index'),   icon: Boxes,           active: route().current('categories.*'),   roles: ['admin','manager','staff'] },
        { name: 'Locations',       href: route('locations.index'),    icon: MapPin,          active: route().current('locations.*'),    roles: ['admin','manager','staff'] },
        { name: 'Suppliers',       href: route('suppliers.index'),    icon: UserCheck,       active: route().current('suppliers.*'),    roles: ['admin','manager','staff'] },
        { name: 'Purchase Orders', href: route('po.index'),           icon: ClipboardList,   active: route().current('po.*'),           roles: ['admin','manager','staff','supplier'] },
        { name: 'Customer Orders', href: route('orders.index'),       icon: PackageCheck,    active: route().current('orders.*'),       roles: ['admin','manager','staff'] },
        { name: 'Stock Transfers', href: route('transfers.index'),    icon: ArrowRightLeft,  active: route().current('transfers.*'),    roles: ['admin','manager','staff'] },
        { name: 'Stock Log',       href: route('movements.index'),    icon: Activity,        active: route().current('movements.*'),    roles: ['admin','manager','staff'] },
        { name: 'Users',           href: route('users.index'),        icon: Users,           active: route().current('users.*'),        roles: ['admin','manager'] },
    ].filter(item => item.roles.includes(user.role));

    const { post } = useForm();
    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 font-sans text-zinc-900 dark:text-zinc-100 antialiased flex flex-col transition-colors duration-200">

            {/* ── Top Header ────────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 lg:left-56 right-0 h-16 bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700 z-[100] flex items-center justify-between px-4 sm:px-6 shadow-sm transition-colors duration-200">

                {/* Left — logo + mobile menu trigger */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md lg:hidden transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <Link href="/dashboard" className="flex items-center gap-2.5 lg:hidden">
                        <div className="w-8 h-8 bg-[#6b7c5c] rounded-md flex items-center justify-center shrink-0">
                            <ApplicationLogo className="h-5 w-5 fill-current text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg tracking-wider text-zinc-900 dark:text-zinc-100 leading-none">INVENIO</span>
                            <span className="text-[9px] font-bold tracking-[0.18em] text-zinc-500 dark:text-zinc-400 uppercase mt-0.5">Control Center</span>
                        </div>
                    </Link>
                </div>

                {/* Centre — breadcrumb */}
                <div className="hidden md:flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>Invenio</span>
                    <span className="text-zinc-300 dark:text-zinc-600">/</span>
                    <span className="text-zinc-800 dark:text-zinc-200 capitalize">
                        {route().current()?.split('.')[0] || 'Dashboard'}
                    </span>
                </div>

                {/* Right — theme toggle + user dropdown */}
                <div className="flex items-center gap-2">

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="relative p-2 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-600 text-zinc-500 dark:text-zinc-400 transition-all duration-200"
                    >
                        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
                            <Moon className="h-4 w-4 text-zinc-400" />
                        </span>
                        <span className={`flex items-center justify-center transition-all duration-300 ${theme === 'dark' ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
                            <Sun className="h-4 w-4 text-zinc-500" />
                        </span>
                    </button>

                    {/* User dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-md transition-colors border border-transparent hover:border-zinc-200 dark:hover:border-zinc-600"
                        >
                            <div className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-600 flex items-center justify-center text-xs font-semibold text-zinc-700 dark:text-zinc-200 uppercase">
                                {user.name.charAt(0)}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 leading-none">{user.name}</span>
                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize font-medium mt-0.5">{user.role}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                        </button>

                        {userDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-md z-50 p-1 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                                    {/* User info header */}
                                    <div className="px-3 py-2.5 border-b border-zinc-100 dark:border-zinc-700 mb-1">
                                        <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">{user.name}</p>
                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 capitalize mt-0.5">{user.role}</p>
                                    </div>
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-md transition-colors"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <UserIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
                                        <span>Profile Settings</span>
                                    </Link>
                                    <hr className="border-zinc-100 dark:border-zinc-700 my-1" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-zinc-700 rounded-md transition-colors text-left"
                                    >
                                        <LogOut className="h-4 w-4 text-red-400 dark:text-red-500" />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* ── Sidebar + Main ────────────────────────────────────────── */}
            <div className="flex flex-1 pt-16 relative">

                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex flex-col w-56 border-r border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 fixed top-0 bottom-0 left-0 z-30 transition-colors duration-200 h-screen">
                    {/* Logo Area */}
                    <div className="px-4 py-5 border-b border-zinc-200 dark:border-zinc-700">
                        <Link href="/dashboard" className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-[#6b7c5c] rounded-md flex items-center justify-center shrink-0">
                                <ApplicationLogo className="h-5 w-5 fill-current text-white" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-extrabold text-lg tracking-wider text-zinc-900 dark:text-zinc-100 leading-none">INVENIO</span>
                                <span className="text-[9px] font-bold tracking-[0.18em] text-zinc-500 dark:text-zinc-400 uppercase mt-0.5">Control Center</span>
                            </div>
                        </Link>
                    </div>

                    {/* Nav Section */}
                    <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={
                                        item.active
                                            ? "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm font-medium bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                                            : "flex items-center gap-3 w-full px-3 py-2.5 rounded-md text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-150 group"
                                    }
                                >
                                    <Icon className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-110 ${
                                        item.active
                                            ? "text-zinc-600 dark:text-zinc-300"
                                            : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors duration-150"
                                    }`} />
                                    <span className={
                                        item.active
                                            ? "text-zinc-900 dark:text-zinc-100 font-medium"
                                            : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 transition-colors duration-150"
                                    }>
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Tablet Sidebar (64px icon-only) */}
                <aside className="hidden md:flex lg:hidden flex-col w-16 border-r border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 fixed top-16 bottom-0 left-0 z-30 items-center py-4 space-y-2 transition-colors duration-200 overflow-y-auto">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={item.name}
                                className={`group p-2.5 rounded-md transition-colors flex items-center justify-center ${
                                    item.active
                                        ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
                                }`}
                            >
                                <Icon className={`h-4 w-4 ${item.active ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'}`} />
                            </Link>
                        );
                    })}
                </aside>

                {/* Mobile Drawer */}
                {sidebarOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-zinc-800 z-50 shadow-xl flex flex-col p-4 animate-in slide-in-from-left duration-200 lg:hidden border-r border-zinc-200 dark:border-zinc-700 transition-colors duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <span className="font-extrabold text-base tracking-wider text-zinc-900 dark:text-zinc-100">INVENIO</span>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <nav className="flex-1 space-y-1 overflow-y-auto">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`group flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                                                item.active
                                                    ? 'bg-zinc-100 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium'
                                                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700 hover:text-zinc-900 dark:hover:text-zinc-100'
                                            }`}
                                        >
                                            <Icon className={`h-4 w-4 shrink-0 ${item.active ? 'text-zinc-700 dark:text-zinc-300' : 'text-zinc-400 dark:text-zinc-500'}`} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </aside>
                    </>
                )}

                <main className="flex-1 md:pl-16 lg:pl-56 min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-zinc-900 pb-20 md:pb-6 transition-colors duration-200">
                    <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
                        {header && (
                            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                {header}
                            </div>
                        )}
                        <div className="flex-1 flex flex-col">
                            {children}
                        </div>
                    </div>
                </main>

                {/* Mobile Bottom Tab Bar — shows all nav items, scrollable */}
                <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 md:hidden flex items-center justify-around z-40 px-1 shadow-sm transition-colors duration-200 overflow-x-auto gap-0">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const label = item.name === 'Purchase Orders' ? 'Orders' :
                                      item.name === 'Dashboard' ? 'Home' :
                                      item.name === 'Brands' ? 'Brands' :
                                      item.name === 'Stock Transfers' ? 'Transfers' :
                                      item.name;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center flex-1 min-w-[52px] py-1 transition-all ${
                                    item.active ? 'text-[#6b7c5c] dark:text-[#8fa67a]' : 'text-zinc-400 dark:text-zinc-500'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-bold mt-1 tracking-tight leading-none text-center whitespace-nowrap">{label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center flex-1 min-w-[52px] py-1 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="text-[10px] font-bold mt-1 tracking-tight">Logout</span>
                    </button>
                </nav>
            </div>

            {/* ── Toasts ────────────────────────────────────────────────── */}
            <div className="fixed top-20 right-6 z-[150] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-start gap-3 p-4 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 border-l-4 rounded-lg shadow-md pointer-events-auto transition-all animate-in slide-in-from-right-5 duration-300 ${
                            toast.type === 'success'
                                ? 'border-emerald-500'
                                : 'border-rose-500'
                        }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <p className={`text-sm font-semibold leading-tight ${toast.type === 'success' ? 'text-emerald-900 dark:text-emerald-300' : 'text-rose-900 dark:text-rose-300'}`}>
                                {toast.type === 'success' ? 'Success' : 'Error'}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-relaxed">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-ink-100"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
