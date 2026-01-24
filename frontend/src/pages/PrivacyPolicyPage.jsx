import React from 'react';
import { Shield, Lock, Eye, Mail, Phone, FileText } from 'lucide-react';

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-stone-50 py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        We value your trust. Here is a simple overview of how we treat your personal information.
                    </p>
                </div>

                {/* Main Content Cards */}
                <div className="space-y-6">
                    {/* Information Collection */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-50 rounded-xl">
                                <Eye className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-stone-900 mb-3">What We Collect</h2>
                                <p className="text-stone-600 leading-relaxed">
                                    We collect only the essential information needed to process your orders and provide a great experience. This includes your name, shipping address, contact details, and payment information (handled securely by Razorpay).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* How We Use It */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-stone-100 rounded-xl">
                                <FileText className="w-6 h-6 text-stone-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-stone-900 mb-3">How We Use It</h2>
                                <p className="text-stone-600 leading-relaxed">
                                    Your data is used solely for:
                                </p>
                                <ul className="list-disc list-inside mt-2 space-y-1 text-stone-600">
                                    <li>Processing and delivering your orders.</li>
                                    <li>Sending order updates and invoices.</li>
                                    <li>Improving our store based on your feedback.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Security */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow duration-300">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-50 rounded-xl">
                                <Lock className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-stone-900 mb-3">Data Security</h2>
                                <p className="text-stone-600 leading-relaxed">
                                    We treat your data with the utmost care. All transactions are encrypted, and we never sell your personal information to third parties.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Section */}
                    <div className="mt-12 bg-stone-900 rounded-3xl p-10 text-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"></div>
                        <Shield className="w-12 h-12 text-amber-500 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold mb-4">Questions regarding privacy?</h2>
                        <p className="text-stone-300 mb-8 max-w-lg mx-auto">
                            We are always here to help. Reach out to us if you have any concerns about your data.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                            <a href="mailto:support@sgpf.in" className="flex items-center gap-3 text-lg font-medium hover:text-amber-400 transition-colors group">
                                <div className="p-2 bg-stone-800 rounded-lg group-hover:bg-stone-700 transition-colors">
                                    <Mail className="w-5 h-5" />
                                </div>
                                support@sgpf.in
                            </a>
                            <a href="tel:9829269866" className="flex items-center gap-3 text-lg font-medium hover:text-amber-400 transition-colors group">
                                <div className="p-2 bg-stone-800 rounded-lg group-hover:bg-stone-700 transition-colors">
                                    <Phone className="w-5 h-5" />
                                </div>
                                +91 98292 69866
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
