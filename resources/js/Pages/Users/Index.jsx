import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from '@/Components/ui/sheet';
import { Button } from '@/Components/ui/button';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import {
    Plus,
    Search,
    Edit2,
    Users,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    Shield,
    Eye,
    KeyRound,
} from 'lucide-react';

// ── Role badge ───────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
    admin:    { label: 'Admin',    icon: ShieldCheck, class: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600' },
    manager:  { label: 'Manager',  icon: Shield,      class: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600' },
    staff:    { label: 'Staff',    icon: Eye,         class: 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-600' },
    supplier: { label: 'Supplier', icon: Users,       class: 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-500/20' },
};

function RoleBadge({ role }) {
    const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.staff;
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${cfg.class}`}>
            <Icon className="h-3.5 w-3.5" />
            {cfg.label}
        </span>
    );
}

export default function Index({ users, suppliers, filters, can }) {
    const [search, setSearch] = useState(filters.search || '');
    const [role,   setRole]   = useState(filters.role   || '');
    const [status, setStatus] = useState(filters.status || '');

    const [isOpen,       setIsOpen]       = useState(false);
    const [editingUser,  setEditingUser]  = useState(null);
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, put, delete: destroy, processing, errors, reset, clearErrors } = useForm({
        name:        '',
        email:       '',
        password:    '',
        role:        'staff',
        supplier_id: '',
        is_active:   true,
    });

    // ── Filters ──────────────────────────────────────────────────────────────
    const applyFilters = (s, r, st) => {
        router.get(route('users.index'), {
            search: s || undefined,
            role:   r || undefined,
            status: st || undefined,
        }, { preserveState: true, replace: true });
    };

    // ── Sheet helpers ────────────────────────────────────────────────────────
    const openCreate = () => {
        clearErrors();
        reset();
        setData({ name: '', email: '', password: '', role: 'staff', supplier_id: '', is_active: true });
        setEditingUser(null);
        setShowPassword(false);
        setIsOpen(true);
    };

    const openEdit = (user) => {
        clearErrors();
        setEditingUser(user);
        setData({ name: user.name, email: user.email, password: '', role: user.role, supplier_id: user.supplier_id || '', is_active: !!user.is_active });
        setShowPassword(false);
        setIsOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingUser) {
            put(route('users.update', editingUser.id), { onSuccess: () => setIsOpen(false) });
        } else {
            post(route('users.store'), { onSuccess: () => { setIsOpen(false); reset(); } });
        }
    };

    const handleDeactivate = (user) => {
        if (!confirm(`Deactivate "${user.name}"? They will be logged out and unable to sign in.`)) return;
        destroy(route('users.destroy', user.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Users" />

            {/* Page header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Users</h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                        Manage team members, roles, and access.
                    </p>
                </div>
                {can.create && (
                    <Button
                        onClick={openCreate}
                        className="bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Add User
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4 mb-6 shadow-sm">
                <div className="flex flex-col md:flex-row gap-3 items-center">
                    {/* Search */}
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <TextInput
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); applyFilters(e.target.value, role, status); }}
                            placeholder="Search by name or email…"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 dark:text-zinc-100 text-sm focus:border-zinc-400 focus:ring-zinc-400 rounded-xl"
                        />
                    </div>

                    {/* Role */}
                    <select
                        value={role}
                        onChange={(e) => { setRole(e.target.value); applyFilters(search, e.target.value, status); }}
                        className="w-full md:w-40 px-3 py-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
                    >
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="staff">Staff</option>
                        <option value="supplier">Supplier</option>
                    </select>

                    {/* Status */}
                    <select
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); applyFilters(search, role, e.target.value); }}
                        className="w-full md:w-44 px-3 py-2.5 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400/30"
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr className="bg-slate-50/75 dark:bg-zinc-700/50 border-b border-zinc-200 dark:border-zinc-700 text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Joined</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-700">
                            {users.data.length > 0 ? (
                                users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-700/40 transition-colors">
                                        {/* Avatar + Name */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full from-[#1B4FD8] to-indigo-500 text-white font-bold flex items-center justify-center text-sm shadow-inner uppercase shrink-0">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm">{user.name}</span>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="px-6 py-4 text-sm text-zinc-500 dark:text-zinc-400">
                                            {user.email}
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-4">
                                            <RoleBadge role={user.role} />
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                                                    Inactive
                                                </span>
                                            )}
                                        </td>

                                        {/* Joined */}
                                        <td className="px-6 py-4 text-xs text-zinc-400 dark:text-zinc-500">
                                            {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {can.update && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => openEdit(user)}
                                                        className="hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-400 rounded-xl"
                                                        title="Edit user"
                                                    >
                                                        <Edit2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                {can.delete && user.is_active && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeactivate(user)}
                                                        className="rounded-xl text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 font-semibold px-3"
                                                        title="Deactivate user"
                                                    >
                                                        Deactivate
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                                            <div className="p-3 bg-zinc-100 dark:bg-zinc-700 rounded-md text-zinc-400 dark:text-zinc-500 mb-4">
                                                <Users className="h-8 w-8" />
                                            </div>
                                            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">No users found</h3>
                                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 text-center">
                                                Try adjusting your filters.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {users.links && users.data.length > 0 && (
                    <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between bg-zinc-50 dark:bg-zinc-700">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                            Showing <span className="font-semibold text-slate-800 dark:text-zinc-200">{users.from}</span> to{' '}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{users.to}</span> of{' '}
                            <span className="font-semibold text-slate-800 dark:text-zinc-200">{users.total}</span> users
                        </span>
                        <div className="flex gap-1.5">
                            {users.links.map((link, idx) => {
                                if (link.url === null) return null;
                                if (link.label.includes('Previous')) return (
                                    <Button key={idx} variant="outline" size="sm"
                                        className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                        <ChevronLeft className="h-4 w-4" /><span>Previous</span>
                                    </Button>
                                );
                                if (link.label.includes('Next')) return (
                                    <Button key={idx} variant="outline" size="sm"
                                        className="rounded-xl flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200"
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                        <span>Next</span><ChevronRight className="h-4 w-4" />
                                    </Button>
                                );
                                return (
                                    <Button key={idx} variant={link.active ? 'default' : 'outline'} size="sm"
                                        className={`rounded-xl h-9 w-9 p-0 ${link.active ? 'bg-[#6b7c5c] text-white' : 'hover:bg-zinc-100 dark:hover:bg-zinc-700 dark:border-zinc-600 dark:text-zinc-200'}`}
                                        onClick={() => router.get(link.url, {}, { preserveState: true })}>
                                        {link.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Slide-over ───────────────────────────────────────────────── */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetContent side="right" className="w-full sm:max-w-md bg-white dark:bg-zinc-800 p-6 border-l border-zinc-200 dark:border-zinc-700 shadow-2xl flex flex-col h-full overflow-hidden z-[210]">
                    <SheetHeader className="mb-6">
                        <SheetTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                            {editingUser ? 'Edit User' : 'Add User'}
                        </SheetTitle>
                        <SheetDescription className="text-xs text-zinc-500 dark:text-zinc-400">
                            {editingUser
                                ? 'Update name, email, role, or password. Leave password blank to keep the current one.'
                                : 'Create a new team member. Share the password with them directly.'}
                        </SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                        <div className="space-y-4 overflow-y-auto pr-1 flex-1 mb-4 min-h-0">

                            {/* Name */}
                            <div>
                                <InputLabel htmlFor="name" value="Full Name" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                                <TextInput
                                    id="name" type="text" value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Sarah Johnson"
                                    className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 dark:text-zinc-100 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm"
                                    isFocused
                                />
                                <InputError message={errors.name} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            {/* Email */}
                            <div>
                                <InputLabel htmlFor="email" value="Email Address" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                                <TextInput
                                    id="email" type="email" value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="e.g. sarah@company.com"
                                    className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 dark:text-zinc-100 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm"
                                />
                                <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            {/* Password */}
                            <div>
                                <InputLabel
                                    htmlFor="password"
                                    value={editingUser ? 'New Password (optional)' : 'Password'}
                                    className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5"
                                />
                                <div className="relative">
                                    <TextInput
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder={editingUser ? 'Leave blank to keep current' : 'Min. 8 characters'}
                                        className="block w-full pr-10 bg-slate-50/50 dark:bg-zinc-700/50 border-zinc-200 dark:border-zinc-700 dark:text-zinc-100 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-ink-200 transition-colors"
                                    >
                                        <KeyRound className="h-4 w-4" />
                                    </button>
                                </div>
                                <InputError message={errors.password} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            {/* Role */}
                            <div>
                                <InputLabel htmlFor="role" value="Role" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm shadow-sm transition focus:outline-none"
                                >
                                    <option value="staff">Staff — view and record movements</option>
                                    <option value="manager">Manager — full CRUD, no admin settings</option>
                                    <option value="admin">Admin — full access</option>
                                    <option value="supplier">Supplier — vendor portal access only</option>
                                </select>
                                <InputError message={errors.role} className="mt-1.5 text-xs text-rose-500" />
                            </div>

                            {/* Role explanation */}
                            <div className="bg-slate-50 dark:bg-zinc-700/30 rounded-xl p-3 border border-zinc-100 dark:border-zinc-700 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                                <p><span className="font-semibold text-purple-600 dark:text-purple-400">Admin</span> — manage users, delete anything, full system access</p>
                                <p><span className="font-semibold text-[#6b7c5c] dark:text-[#8fa67a]">Manager</span> — create/edit products, POs, suppliers, locations. Cannot manage users.</p>
                                <p><span className="font-semibold text-zinc-600 dark:text-zinc-300">Staff</span> — view everything, record movements, receive PO deliveries.</p>
                                <p><span className="font-semibold text-orange-600 dark:text-orange-400">Supplier</span> — log in to view their assigned POs only. No other access.</p>
                            </div>

                            {/* Supplier ID Selection (Only if role is Supplier) */}
                            {data.role === 'supplier' && (
                                <div>
                                    <InputLabel htmlFor="supplier_id" value="Assigned Supplier" className="text-zinc-700 dark:text-zinc-200 font-semibold mb-1.5" />
                                    <select
                                        id="supplier_id"
                                        value={data.supplier_id}
                                        onChange={(e) => setData('supplier_id', e.target.value)}
                                        className="block w-full bg-slate-50/50 dark:bg-zinc-700/50 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:border-zinc-400 focus:ring-zinc-400 rounded-xl px-4 py-2.5 text-sm shadow-sm transition focus:outline-none"
                                        required
                                    >
                                        <option value="" disabled>Select a supplier…</option>
                                        {suppliers.map(sup => (
                                            <option key={sup.id} value={sup.id}>{sup.name}</option>
                                        ))}
                                    </select>
                                    <InputError message={errors.supplier_id} className="mt-1.5 text-xs text-rose-500" />
                                </div>
                            )}

                            {/* Active toggle */}
                            <div className="bg-zinc-50 dark:bg-zinc-700 rounded-xl p-4 border border-slate-150 dark:border-zinc-700">
                                <label className="flex items-center cursor-pointer select-none">
                                    <Checkbox
                                        name="is_active"
                                        checked={data.is_active}
                                        className="bg-white border-slate-300 text-blue-600 focus:ring-zinc-400 rounded"
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                    />
                                    <div className="ms-3">
                                        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 block">Active</span>
                                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 block leading-tight">
                                            Inactive users cannot log in.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-zinc-100 dark:border-zinc-700/50 pt-4 flex gap-3">
                            <Button
                                type="button" variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="flex-1 rounded-xl py-5 hover:bg-slate-50 dark:hover:bg-zinc-700 dark:border-zinc-700 dark:text-zinc-200 font-semibold text-sm"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit" disabled={processing}
                                className="flex-1 bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white font-semibold rounded-xl py-5 flex items-center justify-center gap-1.5 shadow-md "
                            >
                                {processing
                                    ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    : <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
                                }
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </AuthenticatedLayout>
    );
}
