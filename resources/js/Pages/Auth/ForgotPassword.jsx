import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold tracking-tight text-white">Reset password</h1>
                <p className="text-sm text-slate-400 mt-2">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm font-medium text-emerald-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div>
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full bg-slate-950/40 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3 transition-colors duration-200"
                        isFocused={true}
                        placeholder="admin@invenio.test"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
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
                                <Mail className="h-4 w-4" />
                                <span>Send Reset Link</span>
                            </>
                        )}
                    </Button>
                </div>

                <div className="pt-4 text-center">
                    <Link
                        href={route('login')}
                        className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        <span>Back to Sign In</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
