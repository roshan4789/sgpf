import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import axios from 'axios';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await axios.post('http://localhost:5000/api/contact', formData);
            setSubmitted(true);
            setFormData({
                name: '',
                email: '',
                phone: '',
                subject: '',
                message: '',
            });

            // Reset success message after 5 seconds
            setTimeout(() => {
                setSubmitted(false);
            }, 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-16 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-stone-600 text-lg">
                        We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Information */}
                    <div className="lg:col-span-1 space-y-6 animate-slide-up">
                        {/* Contact Cards */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                    <Phone className="w-6 h-6 text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 mb-1">Phone</h3>
                                    <a href="tel:+919876543210" className="text-stone-600 hover:text-amber-600 transition-colors">
                                        +91 98765 43210
                                    </a>
                                    <p className="text-sm text-stone-500 mt-1">Mon-Sat, 9AM-6PM</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 mb-1">Email</h3>
                                    <a href="mailto:support@sgpf.com" className="text-stone-600 hover:text-amber-600 transition-colors break-all">
                                        support@sgpf.com
                                    </a>
                                    <p className="text-sm text-stone-500 mt-1">We'll reply within 24 hours</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 mb-1">Address</h3>
                                    <p className="text-stone-600">
                                        SGPF Photo Frames<br />
                                        123 Market Street<br />
                                        Mumbai, Maharashtra 400001
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-stone-900 mb-1">Business Hours</h3>
                                    <div className="text-stone-600 text-sm space-y-1">
                                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                                        <p>Sunday: Closed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2 animate-slide-up">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-6">Send us a Message</h2>

                            {submitted ? (
                                <div className="text-center py-12 animate-bounce-in">
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-10 h-10 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-2">Message Sent Successfully!</h3>
                                    <p className="text-stone-600">
                                        Thank you for contacting us. We'll get back to you as soon as possible.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-semibold text-stone-700 mb-2">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="John Doe"
                                                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                                required
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
                                                placeholder="john@example.com"
                                                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
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
                                                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-semibold text-stone-700 mb-2">
                                                Subject *
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                placeholder="How can we help?"
                                                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-semibold text-stone-700 mb-2">
                                            Message *
                                        </label>
                                        <textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            placeholder="Tell us more about your inquiry..."
                                            rows="6"
                                            className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none transition-all"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-slide-down">
                                            <p className="text-sm font-medium">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            'Sending...'
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* FAQ Section */}
                        <div className="mt-8 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-8 border border-amber-200">
                            <h3 className="text-xl font-bold text-stone-900 mb-4">Frequently Asked Questions</h3>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-stone-900 mb-1">What are your shipping times?</h4>
                                    <p className="text-stone-700 text-sm">
                                        Most orders are processed within 1-2 business days and delivered within 5-7 business days.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-stone-900 mb-1">Do you offer custom framing?</h4>
                                    <p className="text-stone-700 text-sm">
                                        Yes! We offer custom framing services. Contact us with your requirements for a quote.
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-stone-900 mb-1">What payment methods do you accept?</h4>
                                    <p className="text-stone-700 text-sm">
                                        We accept all major credit/debit cards, UPI, net banking, and digital wallets through Razorpay.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
