import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function About() {
    return (
        <PublicLayout>
            <Head title="About Us | Invenio" />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6">About Invenio</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                        Welcome to Invenio, your number one source for all things mobile. We're dedicated to giving you the very best of smartphones, with a focus on dependability, customer service, and uniqueness.
                    </p>
                    <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                        Founded in 2026, Invenio has come a long way from its beginnings. When we first started out, our passion for premium tech drove us to do intense research, so that Invenio can offer you the world's most advanced mobile devices. We now serve customers all over Pakistan, and are thrilled that we're able to turn our passion into our own website.
                    </p>
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                        We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
                    </p>
                </div>
            </div>
        </PublicLayout>
    );
}
