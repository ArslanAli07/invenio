import { Head } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function Contact() {
    return (
        <PublicLayout>
            <Head title="Contact Us | Invenio" />
            
            <div className="bg-slate-50 dark:bg-ink-900 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4">Get in Touch</h1>
                        <p className="text-lg text-slate-500 dark:text-slate-400">We'd love to hear from you. Our friendly team is always here to chat.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Contact Info */}
                        <div>
                            <div className="bg-white dark:bg-ink-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-ink-700">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Contact Information</h2>
                                
                                <div className="space-y-6">
                                    <div className="flex items-start">
                                        <div className="bg-blue-50 dark:bg-ink-700 p-3 rounded-full text-blue-600 dark:text-blue-400 mr-4">
                                            <Mail className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">Email Us</h3>
                                            <p className="text-slate-500 dark:text-slate-400 mt-1">support@invenio.pk</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start">
                                        <div className="bg-blue-50 dark:bg-ink-700 p-3 rounded-full text-blue-600 dark:text-blue-400 mr-4">
                                            <Phone className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">Call Us</h3>
                                            <p className="text-slate-500 dark:text-slate-400 mt-1">+92 300 0000000</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <div className="bg-blue-50 dark:bg-ink-700 p-3 rounded-full text-blue-600 dark:text-blue-400 mr-4">
                                            <MapPin className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-white">Visit Us</h3>
                                            <p className="text-slate-500 dark:text-slate-400 mt-1">123 Tech Avenue, Block 4<br/>Gulshan-e-Iqbal, Karachi</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 pt-8 border-t border-slate-100 dark:border-ink-700">
                                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Fastest Support</h3>
                                    <a href="https://wa.me/923000000000?text=Hi%20Invenio" target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center px-6 py-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-colors">
                                        <MessageCircle className="h-5 w-5 mr-2" />
                                        Chat on WhatsApp
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form Placeholder */}
                        <div>
                            <div className="bg-white dark:bg-ink-800 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-ink-700">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Send us a message</h2>
                                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Thanks for your message! We'll get back to you soon."); }}>
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                                        <input type="text" id="name" className="mt-1 block w-full border-slate-300 dark:border-ink-600 dark:bg-ink-900 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                        <input type="email" id="email" className="mt-1 block w-full border-slate-300 dark:border-ink-600 dark:bg-ink-900 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required />
                                    </div>
                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                                        <textarea id="message" rows={4} className="mt-1 block w-full border-slate-300 dark:border-ink-600 dark:bg-ink-900 dark:text-white rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm" required></textarea>
                                    </div>
                                    <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
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
