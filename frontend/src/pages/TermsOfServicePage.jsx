import React from 'react';
import { FileSignature, ShoppingBag, RotateCcw, HelpCircle, Mail, Phone, Truck } from 'lucide-react';

const TermsOfServicePage = () => {
    return (
        <div className="min-h-screen bg-stone-50 py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-stone-900 mb-6">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
                        Keeping things transparent. Please read our terms of service to understand how we operate.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* General Terms */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300">
                        <FileSignature className="w-8 h-8 text-amber-600 mb-4" />
                        <h3 className="text-xl font-bold text-stone-900 mb-3">Agreement</h3>
                        <p className="text-stone-600 leading-relaxed">
                            By accessing SGPF Photo Frames, you agree to be bound by these terms. If you disagree with any part, you may not use our services.
                        </p>
                    </div>

                    {/* Products */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300">
                        <ShoppingBag className="w-8 h-8 text-amber-600 mb-4" />
                        <h3 className="text-xl font-bold text-stone-900 mb-3">Products & Pricing</h3>
                        <p className="text-stone-600 leading-relaxed">
                            All prices are in INR. We strive for accuracy in product descriptions, but slight variations in color or sizing may occur due to the handcrafted nature of our items.
                        </p>
                    </div>

                    {/* Shipping */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300">
                        <Truck className="w-8 h-8 text-amber-600 mb-4" />
                        <h3 className="text-xl font-bold text-stone-900 mb-3">Shipping</h3>
                        <p className="text-stone-600 leading-relaxed">
                            We process orders within 1-2 business days. Delivery times vary by location but usually take 5-7 business days across India.
                        </p>
                    </div>

                    {/* Returns */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-all duration-300">
                        <RotateCcw className="w-8 h-8 text-amber-600 mb-4" />
                        <h3 className="text-xl font-bold text-stone-900 mb-3">Returns</h3>
                        <p className="text-stone-600 leading-relaxed">
                            We accept returns within 7 days for damaged or defective items. Custom-made products are non-refundable unless they arrive damaged.
                        </p>
                    </div>
                </div>

                {/* Contact Footer */}
                <div className="mt-12 bg-white rounded-3xl p-8 border border-stone-200 text-center shadow-lg">
                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HelpCircle className="w-8 h-8 text-amber-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900 mb-4">Need help understanding our terms?</h2>
                    <p className="text-stone-600 mb-8">
                        Our support team is available to answer any questions you might have.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                        <a href="mailto:support@sgpf.in" className="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-amber-600 transition-colors font-medium">
                            <Mail className="w-5 h-5" />
                            support@sgpf.in
                        </a>
                        <a href="tel:9829269866" className="flex items-center gap-2 px-6 py-3 border-2 border-stone-200 text-stone-700 rounded-xl hover:border-amber-600 hover:text-amber-600 transition-all font-medium">
                            <Phone className="w-5 h-5" />
                            +91 98292 69866
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfServicePage;
