import React, { useState } from 'react';
import { Package, RefreshCw, CheckCircle, XCircle, Clock, Mail, Phone, MapPin } from 'lucide-react';

const ReturnsPage = () => {
    const [formData, setFormData] = useState({
        orderId: '',
        reason: '',
        description: '',
        email: '',
        phone: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const returnReasons = [
        'Defective or damaged product',
        'Wrong item received',
        'Product not as described',
        'Changed my mind',
        'Quality issues',
        'Other',
    ];

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Basic validation
        if (!formData.orderId || !formData.reason || !formData.email || !formData.phone) {
            setError('Please fill in all required fields');
            return;
        }

        // Simulate submission (in real app, this would call an API)
        console.log('Return request submitted:', formData);
        setSubmitted(true);

        // Reset form after 3 seconds
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                orderId: '',
                reason: '',
                description: '',
                email: '',
                phone: '',
            });
        }, 5000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
                        Returns & Exchange
                    </h1>
                    <p className="text-stone-600 text-lg">
                        We want you to be completely satisfied with your purchase
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Return Policy */}
                    <div className="space-y-6 animate-slide-up">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-6">Return Policy</h2>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-900 mb-2">7-Day Return Window</h3>
                                        <p className="text-stone-600">
                                            You can return most items within 7 days of delivery for a full refund or exchange.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Package className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-900 mb-2">Original Condition</h3>
                                        <p className="text-stone-600">
                                            Items must be unused, in original packaging, and in the same condition as received.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <RefreshCw className="w-6 h-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-900 mb-2">Easy Exchange</h3>
                                        <p className="text-stone-600">
                                            Exchange for a different size, color, or product of equal or greater value.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                        <Clock className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-stone-900 mb-2">Quick Processing</h3>
                                        <p className="text-stone-600">
                                            Refunds are processed within 5-7 business days after we receive your return.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Non-Returnable Items */}
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                            <div className="flex items-start gap-3">
                                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-red-900 mb-2">Non-Returnable Items</h3>
                                    <ul className="text-red-800 space-y-1 text-sm">
                                        <li>• Customized or personalized products</li>
                                        <li>• Items marked as final sale</li>
                                        <li>• Products damaged due to misuse</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* How to Return */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-6">How to Return</h2>
                            <ol className="space-y-4">
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">1</span>
                                    <div>
                                        <p className="font-semibold text-stone-900">Submit Return Request</p>
                                        <p className="text-stone-600 text-sm">Fill out the return form with your order details</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">2</span>
                                    <div>
                                        <p className="font-semibold text-stone-900">Wait for Approval</p>
                                        <p className="text-stone-600 text-sm">We'll review and send you return instructions</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">3</span>
                                    <div>
                                        <p className="font-semibold text-stone-900">Ship the Item</p>
                                        <p className="text-stone-600 text-sm">Pack securely and ship to our return address</p>
                                    </div>
                                </li>
                                <li className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold">4</span>
                                    <div>
                                        <p className="font-semibold text-stone-900">Get Your Refund</p>
                                        <p className="text-stone-600 text-sm">Receive refund within 5-7 business days</p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Return Request Form */}
                    <div className="animate-slide-up">
                        <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-24">
                            <h2 className="text-2xl font-bold text-stone-900 mb-6">Submit Return Request</h2>

                            {submitted ? (
                                <div className="text-center py-12 animate-bounce-in">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">Request Submitted!</h3>
                                    <p className="text-stone-600">
                                        We've received your return request. Our team will contact you within 24 hours.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label htmlFor="orderId" className="block text-sm font-semibold text-stone-700 mb-2">
                                            Order ID *
                                        </label>
                                        <input
                                            type="text"
                                            id="orderId"
                                            name="orderId"
                                            value={formData.orderId}
                                            onChange={handleChange}
                                            placeholder="Enter your order ID"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="reason" className="block text-sm font-semibold text-stone-700 mb-2">
                                            Reason for Return *
                                        </label>
                                        <select
                                            id="reason"
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            required
                                        >
                                            <option value="">Select a reason</option>
                                            {returnReasons.map((reason) => (
                                                <option key={reason} value={reason}>
                                                    {reason}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label htmlFor="description" className="block text-sm font-semibold text-stone-700 mb-2">
                                            Additional Details
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Please provide any additional information..."
                                            rows="4"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-2">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="your.email@example.com"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-semibold text-stone-700 mb-2">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                                            <p className="text-sm font-medium">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all transform hover:scale-[1.02] shadow-lg"
                                    >
                                        Submit Return Request
                                    </button>
                                </form>
                            )}

                            {/* Contact Info */}
                            <div className="mt-8 pt-8 border-t border-stone-200">
                                <p className="text-sm text-stone-600 mb-4">Need help with your return?</p>
                                <div className="space-y-2">
                                    <a href="tel:+919876543210" className="flex items-center gap-2 text-amber-700 hover:text-amber-800 text-sm font-medium">
                                        <Phone className="w-4 h-4" />
                                        +91 98765 43210
                                    </a>
                                    <a href="mailto:returns@shriganpati.com" className="flex items-center gap-2 text-amber-700 hover:text-amber-800 text-sm font-medium">
                                        <Mail className="w-4 h-4" />
                                        returns@shriganpati.com
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReturnsPage;
