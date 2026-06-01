import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-ink-100">Dashboard</h1>
                    <p className="text-sm text-slate-500 dark:text-ink-400 mt-1">Welcome back. Here's what's happening.</p>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-slate-200 dark:border-ink-750 shadow-sm p-6 dark:shadow-ink-950/20">
                <p className="text-slate-600 dark:text-ink-400 text-sm">
                    Dashboard content will be built in Phase 6. For now, navigate using the sidebar.
                </p>
            </div>
        </AuthenticatedLayout>
    );
}
