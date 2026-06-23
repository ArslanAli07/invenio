import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-950 font-sans antialiased text-slate-100 overflow-hidden px-4">
            {/* Ambient Background Decorative Glows */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-sky-500/10 blur-[130px] pointer-events-none" />

            {/* Subtle Grid overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35 pointer-events-none" />

            <div className="relative z-10 w-full sm:max-w-md">
                {/* Logo and Wordmark */}
                <div className="flex flex-col items-center justify-center mb-8">
                    <Link href="/" className="group flex flex-col items-center justify-center gap-3">
                        <div className="flex items-center justify-center p-4 rounded-lg bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 border border-slate-800 shadow-xl group-hover:border-blue-500/30 transition-all duration-300">
                            <ApplicationLogo className="h-10 w-10 fill-current text-blue-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-3xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-blue-500">
                                INVENIO
                            </span>
                            <span className="text-xs uppercase tracking-[0.3em] text-slate-500 mt-1 font-semibold">
                                Inventory Intelligence
                            </span>
                        </div>
                    </Link>
                </div>

                {/* Glassmorphic Card */}
                <div className="w-full overflow-hidden backdrop-blur-md bg-slate-900/60 border border-slate-800/80 shadow-2xl rounded-lg p-8 hover:border-slate-800 transition-all duration-300">
                    {children}
                </div>
            </div>
        </div>
    );
}
