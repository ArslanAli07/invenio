import { Head, Link } from '@inertiajs/react';
import PublicLayout from '@/Layouts/PublicLayout';
import { CheckCircle, Package, MessageCircle, ArrowRight } from 'lucide-react';

export default function CheckoutSuccess({ orderNumber }) {
    return (
        <PublicLayout>
            <Head title="Order Confirmed | Invenio" />
            
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white dark:bg-ink-800 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-100 dark:border-ink-700 max-w-2xl w-full text-center relative overflow-hidden">
                    
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-green-50 to-white dark:from-green-900/20 dark:to-ink-800"></div>
                    
                    <div className="relative">
                        <div className="mx-auto w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-8">
                            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
                            Order Confirmed!
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                            Thank you for your purchase. Your order has been received and is currently being processed.
                        </p>
                        
                        <div className="bg-slate-50 dark:bg-ink-900 rounded-2xl p-6 mb-10 inline-block text-left w-full sm:w-auto min-w-[300px]">
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Order Number</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white flex items-center">
                                <Package className="h-6 w-6 mr-3 text-blue-600 dark:text-blue-400" />
                                {orderNumber}
                            </p>
                        </div>
                        
                        <div className="space-y-4 max-w-sm mx-auto mb-12">
                            <p className="text-slate-600 dark:text-slate-400">
                                Our team will contact you shortly to verify your delivery details before shipping.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a 
                                href={`https://wa.me/923000000000?text=Hi!%20I%20just%20placed%20an%20order%20on%20Invenio.%20My%20order%20number%20is%20${orderNumber}`}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border border-transparent rounded-full shadow-sm text-base font-bold text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                                <MessageCircle className="h-5 w-5 mr-2" />
                                Chat on WhatsApp
                            </a>
                            <Link 
                                href={route('public.store.index')}
                                className="w-full sm:w-auto inline-flex justify-center items-center px-8 py-4 border-2 border-slate-200 dark:border-ink-600 rounded-full text-base font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-ink-700 transition-colors"
                            >
                                Continue Shopping <ArrowRight className="h-5 w-5 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}
