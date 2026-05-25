import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { LogIn } from 'lucide-react';

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
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold tracking-tight text-white">Welcome back</h1>
                <p className="text-sm text-slate-400 mt-1">Please enter your details to sign in</p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm font-medium text-emerald-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-slate-300 font-medium mb-1.5" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full bg-slate-950/40 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3 transition-colors duration-200"
                        autoComplete="username"
                        placeholder="admin@invenio.test"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <InputLabel htmlFor="password" value="Password" className="text-slate-300 font-medium" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-blue-500 hover:text-blue-400 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full bg-slate-950/40 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3 transition-colors duration-200"
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center select-none cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            className="bg-slate-950/40 border-slate-800 text-blue-600 focus:ring-blue-500/50 rounded"
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2.5 text-sm text-slate-400 hover:text-slate-300 transition-colors">
                            Remember me
                        </span>
                    </label>
                </div>

                <div className="pt-2">
                    <Button 
                        type="submit" 
                        disabled={processing}
                        className="w-full bg-[#1B4FD8] hover:bg-blue-700 text-white font-semibold rounded-xl py-6 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all"
                    >
                        {processing ? (
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                            <>
                                <LogIn className="h-4 w-4" />
                                <span>Sign In</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
