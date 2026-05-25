import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { KeyRound } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Reset Password" />

            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold tracking-tight text-white">Create new password</h1>
                <p className="text-sm text-slate-400 mt-1">Please enter your new security credentials</p>
            </div>

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
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" className="text-slate-300 font-medium mb-1.5" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full bg-slate-950/40 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3 transition-colors duration-200"
                        autoComplete="new-password"
                        isFocused={true}
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                    />
                    <InputError message={errors.password} className="mt-1.5 text-xs text-rose-500" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-slate-300 font-medium mb-1.5" />
                    <TextInput
                        type="password"
                        id="password_confirmation"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="block w-full bg-slate-950/40 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-3 transition-colors duration-200"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                    />
                    <InputError message={errors.password_confirmation} className="mt-1.5 text-xs text-rose-500" />
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
                                <KeyRound className="h-4 w-4" />
                                <span>Reset Password</span>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </GuestLayout>
    );
}
