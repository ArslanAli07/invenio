import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#faf9f6] dark:bg-zinc-900 flex flex-col items-center justify-center px-4">
            <Head title="Log in" />

            {/* Logo Area */}
            <div className="text-center mb-8">
                <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Invenio.</span>
                <p className="text-xs uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-1">
                    Control Center
                </p>
            </div>

            {/* Login Card */}
            <div className="w-full max-w-md bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-sm p-8">
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-center">Welcome back</h1>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-1 mb-6">Please enter your details to sign in</p>

                {status && (
                    <div className="mb-4 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="w-full border border-zinc-200 dark:border-zinc-600 rounded-md px-3 py-2.5 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 transition-colors"
                            autoComplete="username"
                            placeholder="admin@invenio.test"
                            required
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                Password
                            </label>
                            {canResetPassword && (
                                <Link
                                    href={route('password.request')}
                                    className="text-xs text-[#6b7c5c] hover:underline"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </div>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="w-full border border-zinc-200 dark:border-zinc-600 rounded-md px-3 py-2.5 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-500 transition-colors"
                            autoComplete="current-password"
                            placeholder="••••••••"
                            required
                            onChange={(e) => setData('password', e.target.value)}
                        />
                        <InputError message={errors.password} className="mt-1.5 text-xs text-rose-500" />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center select-none cursor-pointer">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                className="border-zinc-300 dark:border-zinc-600 text-[#6b7c5c] focus:ring-[#6b7c5c]/50 rounded"
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="ms-2.5 text-sm text-zinc-500 dark:text-zinc-400">
                                Remember me
                            </span>
                        </label>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-md py-2.5 text-sm font-semibold transition-colors mt-2"
                        >
                            {processing ? "Signing In..." : "Sign In"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
