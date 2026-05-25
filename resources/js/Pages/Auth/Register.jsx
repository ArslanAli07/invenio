import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function Register() {
    const [confirmError, setConfirmError] = useState('');

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordChange = (e) => {
        const val = e.target.value;
        setData('password', val);
        if (data.password_confirmation && val !== data.password_confirmation) {
            setConfirmError('Passwords do not match.');
        } else {
            setConfirmError('');
        }
    };

    const handleConfirmPasswordChange = (e) => {
        const val = e.target.value;
        setData('password_confirmation', val);
        if (data.password && val !== data.password) {
            setConfirmError('Passwords do not match.');
        } else {
            setConfirmError('');
        }
    };

    const submit = (e) => {
        e.preventDefault();
        if (data.password !== data.password_confirmation) {
            setConfirmError('Passwords do not match.');
            return;
        }
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mb-6 text-center">
                <h1 className="text-xl font-bold tracking-tight text-white">Create your account</h1>
                <p className="text-sm text-slate-400 mt-1">Get started with Invenio Control Center</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="name" value="Full Name" className="text-slate-300 font-medium mb-1.5" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="block w-full bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 transition-colors duration-200"
                        autoComplete="name"
                        placeholder="John Doe"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />
                    <InputError message={errors.name} className="mt-1 text-xs text-rose-500" />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="Email Address" className="text-slate-300 font-medium mb-1.5" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="block w-full bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 transition-colors duration-200"
                        autoComplete="username"
                        placeholder="john@example.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />
                    <InputError message={errors.email} className="mt-1 text-xs text-rose-500" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Password" className="text-slate-300 font-medium mb-1.5" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="block w-full bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 transition-colors duration-200"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={handlePasswordChange}
                        required
                    />
                    <InputError message={errors.password} className="mt-1 text-xs text-rose-500" />
                </div>

                <div>
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" className="text-slate-300 font-medium mb-1.5" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className={`block w-full bg-slate-950 text-slate-100 placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl px-4 py-2.5 transition-all duration-200 ${
                            confirmError ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-800'
                        }`}
                        autoComplete="new-password"
                        placeholder="••••••••"
                        onChange={handleConfirmPasswordChange}
                        required
                    />
                    <InputError message={confirmError || errors.password_confirmation} className="mt-1 text-xs text-rose-500" />
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
                                <UserPlus className="h-4 w-4" />
                                <span>Register</span>
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
                        <span>Already registered? Sign In</span>
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
