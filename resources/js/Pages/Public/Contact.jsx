import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Contact() {
    return (
        <PublicLayout>
            <Head title="Contact Us | Invenio" />
            
            <div className="min-h-screen bg-[#faf9f6] dark:bg-zinc-900 py-16 px-4">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 text-center">Get in Touch</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-2 mb-12">We'd love to hear from you. Our friendly team is always here to chat.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div>
                            <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md p-8">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Contact Information</h2>
                                
                                <div>
                                    <div className="flex items-start gap-3 mb-4">
                                        <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                        <div>
                                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Email Us</h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">support@invenio.pk</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start gap-3 mb-4">
                                        <Phone className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                        <div>
                                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Call Us</h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">+92 300 0000000</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 mb-4">
                                        <MapPin className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                                        <div>
                                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Visit Us</h3>
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">123 Tech Avenue, Block 4<br/>Gulshan-e-Iqbal, Karachi</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-stone-200 dark:border-zinc-700">
                                    <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 mt-6 mb-3">Fastest Support</h3>
                                    <a href="https://wa.me/923000000000?text=Hi%20Invenio" target="_blank" rel="noreferrer" className="w-full block bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-md py-2.5 text-sm font-medium transition-colors text-center">
                                        Chat on WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Placeholder */}
                        <div>
                            <div className="bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-md p-8">
                                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Send us a message</h2>
                                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks for your message! We'll get back to you soon."); }}>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                                        <input type="text" id="name" className="w-full border border-stone-200 dark:border-zinc-600 rounded-md px-3 py-2.5 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-400" required />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
                                        <input type="email" id="email" className="w-full border border-stone-200 dark:border-zinc-600 rounded-md px-3 py-2.5 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-400" required />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Message</label>
                                        <textarea id="message" rows={5} className="w-full border border-stone-200 dark:border-zinc-600 rounded-md px-3 py-2.5 text-sm bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-400" required></textarea>
                                    </div>
                                    <button type="submit" className="w-full bg-[#6b7c5c] hover:bg-[#5a6b4c] text-white rounded-md py-2.5 text-sm font-medium transition-colors mt-2">
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
