import React from 'react';

const PrivacyPolicy = () => {
    return (
        <div className="max-w-5xl mx-auto px-4 py-16 text-stone-800">
            <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>

            <p className="text-sm text-stone-500 mb-10">
                Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="space-y-6 leading-relaxed">
                <p>
                    At <strong>SGPF</strong>, we value your privacy and are committed to protecting
                    your personal information. This Privacy Policy explains how we collect, use,
                    and safeguard your data when you visit or make a purchase from our website.
                </p>

                <h2 className="text-2xl font-semibold mt-8">Information We Collect</h2>
                <p>
                    When you use our website, we may collect personal information such as your
                    name, email address, phone number, shipping address, and payment-related
                    details necessary to process your orders.
                </p>

                <h2 className="text-2xl font-semibold mt-8">How We Use Your Information</h2>
                <ul className="list-disc ml-6 space-y-2">
                    <li>To process and deliver your orders</li>
                    <li>To communicate order updates and support responses</li>
                    <li>To improve our products, services, and user experience</li>
                    <li>To comply with legal and regulatory requirements</li>
                </ul>

                <h2 className="text-2xl font-semibold mt-8">Payment Security</h2>
                <p>
                    All payments are securely processed through trusted third-party payment
                    gateways such as Razorpay. We do not store or process your card or UPI
                    details on our servers.
                </p>

                <h2 className="text-2xl font-semibold mt-8">Data Sharing</h2>
                <p>
                    We do not sell or rent your personal data to third parties. Your information
                    may only be shared with service providers involved in order fulfillment,
                    payment processing, and delivery.
                </p>

                <h2 className="text-2xl font-semibold mt-8">Cookies</h2>
                <p>
                    Our website may use cookies to enhance your browsing experience and analyze
                    website traffic. You can choose to disable cookies in your browser settings.
                </p>

                <h2 className="text-2xl font-semibold mt-8">Your Rights</h2>
                <p>
                    You have the right to access, update, or request deletion of your personal
                    information. For any privacy-related concerns, you can contact us using the
                    details below.
                </p>

                <h2 className="text-2xl font-semibold mt-8">Contact Us</h2>
                <p>
                    If you have any questions about this Privacy Policy, please contact us at:
                </p>

                <p className="font-medium">
                    Email: <a href="mailto:support@sgpf.in" className="text-amber-600 hover:underline">
                        support@sgpf.in
                    </a>
                </p>
                <p className="font-medium">
                    Phone: <a href="9829269866" className="text-amber-600 hover:underline">
                        +91 9829269866
                    </a>
                </p>
            </section>
        </div>
    );
};

export default PrivacyPolicy;
