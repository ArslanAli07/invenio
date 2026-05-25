import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Boxes, 
    MapPin, 
    UserCheck, 
    Package, 
    History, 
    User as UserIcon, 
    LogOut, 
    Menu, 
    X, 
    ChevronDown, 
    CheckCircle2, 
    AlertCircle 
} from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const permissions = auth.can || {};

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    
    // Toast state
    const [toasts, setToasts] = useState([]);

    // Watch Inertia flash messages
    useEffect(() => {
        if (flash?.success) {
            addToast(flash.success, 'success');
        }
        if (flash?.error) {
            addToast(flash.error, 'error');
        }
    }, [flash]);

    const addToast = (message, type = 'success') => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        
        if (type === 'success') {
            setTimeout(() => {
                removeToast(id);
            }, 4000);
        }
    };

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const navigation = [
        { name: 'Dashboard', href: route('dashboard'), icon: LayoutDashboard, active: route().current('dashboard') },
        { name: 'Products', href: route('products.index'), icon: Package, active: route().current('products.*') },
        { name: 'Categories', href: route('categories.index'), icon: Boxes, active: route().current('categories.*') },
        { name: 'Locations', href: route('locations.index'), icon: MapPin, active: route().current('locations.*') },
        { name: 'Suppliers', href: route('suppliers.index'), icon: UserCheck, active: route().current('suppliers.*') },
    ];

    const { post } = useForm();
    const handleLogout = (e) => {
        e.preventDefault();
        post(route('logout'));
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased flex flex-col">
            {/* Top Navigation Header (fixed 64px) */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 sm:px-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-md flex items-center justify-center">
                            <ApplicationLogo className="h-6 w-6 fill-current text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-lg tracking-wider text-slate-900 leading-none">INVENIO</span>
                            <span className="text-[9px] font-bold tracking-[0.18em] text-slate-500 uppercase mt-0.5">Control Center</span>
                        </div>
                    </Link>
                </div>

                {/* Header breadcrumb (hidden on mobile) */}
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-500 font-medium">
                    <span>Invenio</span>
                    <span className="text-slate-300">/</span>
                    <span className="text-slate-800 capitalize">
                        {route().current()?.split('.')[0] || 'Dashboard'}
                    </span>
                </div>

                {/* User Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-200"
                    >
                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#1B4FD8] to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-inner uppercase">
                            {user.name.charAt(0)}
                        </div>
                        <div className="hidden sm:flex flex-col text-left">
                            <span className="text-xs font-semibold text-slate-950 leading-none">{user.name}</span>
                            <span className="text-[10px] text-slate-500 capitalize font-medium mt-0.5">{user.role}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                    </button>

                    {userDropdownOpen && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setUserDropdownOpen(false)} />
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-2 py-1 animate-in fade-in-50 slide-in-from-top-2 duration-150">
                                <Link 
                                    href={route('profile.edit')}
                                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-xl transition-colors"
                                    onClick={() => setUserDropdownOpen(false)}
                                >
                                    <UserIcon className="h-4 w-4 text-slate-400" />
                                    <span>Profile Settings</span>
                                </Link>
                                <hr className="border-slate-100 my-1" />
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
                                >
                                    <LogOut className="h-4 w-4 text-red-400" />
                                    <span>Log Out</span>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Sidebar Navigation Shell */}
            <div className="flex flex-1 pt-16 relative">
                {/* Desktop Sidebar (240px wide, collapses to 64px on tablet/md) */}
                <aside className="hidden lg:flex flex-col w-60 border-r border-slate-200 bg-white fixed top-16 bottom-0 left-0 z-30 transition-all duration-300">
                    <nav className="flex-1 p-4 space-y-1">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                                        item.active 
                                            ? 'bg-blue-50/70 text-[#1B4FD8] shadow-sm border-l-4 border-[#1B4FD8]' 
                                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                                    }`}
                                >
                                    <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:scale-105 ${item.active ? 'text-[#1B4FD8]' : 'text-slate-400'}`} />
                                    <span>{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Tablet Sidebar (64px wide) */}
                <aside className="hidden md:flex lg:hidden flex-col w-16 border-r border-slate-200 bg-white fixed top-16 bottom-0 left-0 z-30 items-center py-4 space-y-4">
                    {navigation.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={item.name}
                                className={`group p-3 rounded-2xl transition-all duration-200 flex items-center justify-center hover:scale-105 ${
                                    item.active 
                                        ? 'bg-blue-50 text-[#1B4FD8] border border-blue-100 shadow-sm' 
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                                }`}
                            >
                                <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:scale-110 ${item.active ? 'text-[#1B4FD8]' : 'text-slate-400'}`} />
                            </Link>
                        );
                    })}
                </aside>

                {/* Mobile Drawer Sidebar Overlay */}
                {sidebarOpen && (
                    <>
                        <div 
                            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                        <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 shadow-2xl flex flex-col p-5 animate-in slide-in-from-left duration-200 lg:hidden">
                            <div className="flex items-center justify-between mb-8">
                                <span className="font-extrabold text-lg tracking-wider text-slate-950">INVENIO</span>
                                <button 
                                    onClick={() => setSidebarOpen(false)}
                                    className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
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
                                            className={`group flex items-center gap-3 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200 ${
                                                item.active 
                                                    ? 'bg-blue-50/70 text-[#1B4FD8] shadow-sm border-l-4 border-[#1B4FD8]' 
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border-l-4 border-transparent'
                                            }`}
                                        >
                                            <Icon className={`h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5 ${item.active ? 'text-[#1B4FD8]' : 'text-slate-400'}`} />
                                            <span>{item.name}</span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </aside>
                    </>
                )}

                {/* Main Content Layout Wrapper */}
                <main className="flex-1 md:pl-16 lg:pl-60 min-h-[calc(100vh-4rem)] flex flex-col bg-slate-50 pb-20 md:pb-6">
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

                {/* Mobile Bottom Tab Bar (hidden on desktop/tablet) */}
                <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 md:hidden flex items-center justify-around z-40 px-2 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
                    {navigation.slice(0, 4).map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
                                    item.active ? 'text-[#1B4FD8]' : 'text-slate-400'
                                }`}
                            >
                                <Icon className="h-5.5 w-5.5" />
                                <span className="text-[10px] font-bold mt-1 tracking-tight">{item.name}</span>
                            </Link>
                        );
                    })}
                    <button
                        onClick={handleLogout}
                        className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-red-500"
                    >
                        <LogOut className="h-5.5 w-5.5" />
                        <span className="text-[10px] font-bold mt-1 tracking-tight">Logout</span>
                    </button>
                </nav>
            </div>

            {/* Custom Self-Contained Floating Toasts */}
            <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`flex items-start gap-3 p-4 bg-white border-l-4 rounded-2xl shadow-xl pointer-events-auto transition-all animate-in slide-in-from-right-5 duration-300 ${
                            toast.type === 'success' 
                                ? 'border-emerald-500 text-emerald-950' 
                                : 'border-rose-500 text-rose-950'
                        }`}
                    >
                        {toast.type === 'success' ? (
                            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        ) : (
                            <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-semibold leading-tight">
                                {toast.type === 'success' ? 'Success' : 'Error'}
                            </p>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                {toast.message}
                            </p>
                        </div>
                        <button 
                            onClick={() => removeToast(toast.id)}
                            className="p-1 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
