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
        { name: 'Dashboard',       href: route('dashboard'),       icon: LayoutDashboard, active: route().current('dashboard'),    roles: ['admin','manager','staff'] },
        { name: 'Products',        href: route('products.index'),  icon: Package,         active: route().current('products.*'),   roles: ['admin','manager','staff'] },
        { name: 'Categories',      href: route('categories.index'),icon: Boxes,           active: route().current('categories.*'), roles: ['admin','manager','staff'] },
        { name: 'Locations',       href: route('locations.index'), icon: MapPin,          active: route().current('locations.*'),  roles: ['admin','manager','staff'] },
        { name: 'Suppliers',       href: route('suppliers.index'), icon: UserCheck,       active: route().current('suppliers.*'),  roles: ['admin','manager','staff'] },
        { name: 'Purchase Orders', href: route('po.index'),        icon: ClipboardList,   active: route().current('po.*'),         roles: ['admin','manager','staff'] },
        { name: 'Users',           href: route('users.index'),     icon: Users,           active: route().current('users.*'),      roles: ['admin','manager'] },
    ].filter(item => item.roles.includes(user.role));

    const { post } = useForm();
    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-ink-950 font-sans text-slate-900 dark:text-slate-100 antialiased flex flex-col transition-colors duration-200">

            {/* ── Top Header ────────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-ink-900 border-b border-slate-200 dark:border-ink-750 z-40 flex items-center justify-between px-4 sm:px-6 shadow-sm transition-colors duration-200">

                {/* Left — logo + mobile menu trigger */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-slate-500 dark:text-ink-400 hover:bg-slate-100 dark:hover:bg-ink-800 rounded-lg lg:hidden transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md flex items-center justify-center">
                            <ApplicationLogo className="h-6 w-6 fill-current text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg tracking-wider text-slate-900 dark:text-ink-100 leading-none">INVENIO</span>
                            <span className="text-[9px] font-bold tracking-[0.18em] text-slate-500 dark:text-ink-400 uppercase mt-0.5">Control Center</span>
                        </div>
                    </Link>
                </div>

                {/* Centre — breadcrumb */}
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 dark:text-ink-400 font-medium">
                    <span>Invenio</span>
                    <span className="text-slate-300 dark:text-slate-600">/</span>
                    <span className="text-slate-800 dark:text-ink-200 capitalize">
                        {route().current()?.split('.')[0] || 'Dashboard'}
                    </span>
                </div>

                {/* Right — theme toggle + user dropdown */}
                <div className="flex items-center gap-2">

                    {/* Theme toggle */}
                    <button
                        onClick={toggleTheme}
                        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        className="relative p-2 rounded-xl border border-slate-200 dark:border-ink-700 bg-slate-50 dark:bg-ink-800 hover:bg-slate-100 dark:hover:bg-ink-750 text-slate-500 dark:text-ink-400 transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                        <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`}>
                            <Moon className="h-4 w-4 text-indigo-400" />
                        </span>
                        <span className={`flex items-center justify-center transition-all duration-300 ${theme === 'dark' ? 'opacity-0 -rotate-90' : 'opacity-100 rotate-0'}`}>
                            <Sun className="h-4 w-4 text-amber-500" />
                        </span>
                    </button>

                    {/* User dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-ink-800 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                        >
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#1B4FD8] to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-inner uppercase">
                                {user.name.charAt(0)}
                            </div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="text-xs font-semibold text-slate-950 dark:text-ink-100 leading-none">{user.name}</span>
                                <span className="text-[10px] text-slate-500 dark:text-ink-400 capitalize font-medium mt-0.5">{user.role}</span>
                            </div>
                            <ChevronDown className="h-4 w-4 text-slate-400 dark:text-ink-400" />
                        </button>

                        {userDropdownOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-ink-800 border border-slate-200 dark:border-ink-700 rounded-2xl shadow-xl dark:shadow-ink-950/60 z-50 p-2 py-1 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                                    {/* User info header */}
                                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-ink-700 mb-1">
                                        <p className="text-xs font-semibold text-slate-900 dark:text-ink-100 truncate">{user.name}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-ink-400 capitalize mt-0.5">{user.role}</p>
                                    </div>
                                    <Link
                                        href={route('profile.edit')}
                                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-ink-200 hover:bg-slate-50 dark:hover:bg-ink-750/60 rounded-xl transition-colors"
                                        onClick={() => setUserDropdownOpen(false)}
                                    >
                                        <UserIcon className="h-4 w-4 text-slate-400 dark:text-ink-400" />
                                        <span>Profile Settings</span>
                                    </Link>
                                    <hr className="border-slate-100 dark:border-ink-700 my-1" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-left"
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

                {/* Desktop Sidebar (240px) */}
                <aside className="hidden lg:flex flex-col w-60 border-r border-slate-200 dark:border-ink-750 bg-white dark:bg-ink-900 fixed top-16 bottom-0 left-0 z-30 transition-colors duration-200">
                    <nav className="flex-1 p-4 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center gap-3 px-4 py-3 text-[15px] font-semibold rounded-2xl transition-all duration-200 ${
                                        item.active
                                            ? 'bg-blue-50 dark:bg-blue-500/10 text-[#1B4FD8] dark:text-blue-400 shadow-sm border-l-4 border-[#1B4FD8] dark:border-blue-400'
                                            : 'text-slate-600 dark:text-ink-400 hover:bg-slate-50 dark:hover:bg-ink-800 hover:text-slate-900 dark:hover:text-ink-100 border-l-4 border-transparent'
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-105 ${item.active ? 'text-[#1B4FD8] dark:text-blue-400' : 'text-slate-400 dark:text-ink-400'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Tablet Sidebar (64px icon-only) */}
                <aside className="hidden md:flex lg:hidden flex-col w-16 border-r border-slate-200 dark:border-ink-750 bg-white dark:bg-ink-900 fixed top-16 bottom-0 left-0 z-30 items-center py-4 space-y-4 transition-colors duration-200">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={item.name}
                                className={`group p-3 rounded-2xl transition-all duration-200 flex items-center justify-center hover:scale-105 ${
                                    item.active
                                        ? 'bg-blue-50 dark:bg-blue-500/10 text-[#1B4FD8] dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 shadow-sm'
                                        : 'text-slate-500 dark:text-ink-400 hover:bg-slate-50 dark:hover:bg-ink-800 hover:text-slate-900 dark:hover:text-ink-100 border border-transparent'
                                }`}
                            >
                                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${item.active ? 'text-[#1B4FD8] dark:text-blue-400' : 'text-slate-400 dark:text-ink-400'}`} />
                            </Link>
                        );
                    })}
                </aside>

                {/* Mobile Drawer */}
                {sidebarOpen && (
                    <>
                        <div
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <aside className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-ink-900 z-50 shadow-2xl flex flex-col p-5 animate-in slide-in-from-left duration-200 lg:hidden border-r border-slate-200 dark:border-ink-750 transition-colors duration-200">
                            <div className="flex items-center justify-between mb-8">
                                <span className="font-extrabold text-lg tracking-wider text-slate-950 dark:text-ink-100">INVENIO</span>
                                <button
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 text-slate-500 dark:text-ink-400 hover:bg-slate-100 dark:hover:bg-ink-800 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                            <nav className="flex-1 space-y-1.5">
                                {navigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`group flex items-center gap-3 px-4 py-3.5 text-[15px] font-semibold rounded-2xl transition-all duration-200 ${
                                                item.active
                                                    ? 'bg-blue-50 dark:bg-blue-500/10 text-[#1B4FD8] dark:text-blue-400 shadow-sm border-l-4 border-[#1B4FD8] dark:border-blue-400'
                                                    : 'text-slate-600 dark:text-ink-400 hover:bg-slate-50 dark:hover:bg-ink-800 hover:text-slate-900 dark:hover:text-ink-100 border-l-4 border-transparent'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 ${item.active ? 'text-[#1B4FD8] dark:text-blue-400' : 'text-slate-400 dark:text-ink-400'}`} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </aside>
                    </>
                )}

                {/* Main Content */}
                <main className="flex-1 md:pl-16 lg:pl-60 min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 dark:bg-ink-950 pb-20 md:pb-6 transition-colors duration-200">
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
                <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-ink-900 border-t border-slate-200 dark:border-ink-750 md:hidden flex items-center justify-around z-40 px-1 shadow-[0_-4px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.3)] transition-colors duration-200 overflow-x-auto gap-0">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        const label = item.name === 'Purchase Orders' ? 'Orders' :
                                      item.name === 'Dashboard' ? 'Home' :
                                      item.name === 'Categories' ? 'Categories' :
                                      item.name;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center flex-1 min-w-[52px] py-1 transition-all ${
                                    item.active ? 'text-[#1B4FD8] dark:text-blue-400' : 'text-slate-400 dark:text-ink-400'
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-bold mt-1 tracking-tight leading-none text-center whitespace-nowrap">{label}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center flex-1 min-w-[52px] py-1 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400"
                    >
                        <LogOut className="h-5 w-5" />
                        <span className="text-[10px] font-bold mt-1 tracking-tight">Logout</span>
                    </button>
                </nav>
            </div>

            {/* ── Toasts ────────────────────────────────────────────────── */}
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-start gap-3 p-4 bg-white dark:bg-ink-800 border-l-4 rounded-2xl shadow-xl dark:shadow-ink-950/60 pointer-events-auto transition-all animate-in slide-in-from-right-5 duration-300 ${
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
                            <p className="text-xs text-slate-500 dark:text-ink-400 mt-1 leading-relaxed">
                                {toast.message}
                            </p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-slate-100 dark:hover:bg-ink-750 rounded-lg transition-colors text-slate-400 hover:text-slate-600 dark:text-ink-400 dark:hover:text-ink-100"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
