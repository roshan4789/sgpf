import React, { useState } from 'react';
import { Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail } from 'lucide-react';
import api from '../services/api';

const TrackOrderPage = () => {
    const [orderId, setOrderId] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrackOrder = async (e) => {
        e.preventDefault();
        setError('');
        setOrderData(null);
        setLoading(true);

        try {
            const { data } = await api.post('/orders/track', {
                orderId: orderId.trim(),
            });
            setOrderData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Order not found. Please check your order ID.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-6 h-6 text-amber-500" />;
            case 'processing':
                return <Package className="w-6 h-6 text-blue-500" />;
            case 'shipped':
                return <Truck className="w-6 h-6 text-purple-500" />;
            case 'delivered':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            default:
                return <Clock className="w-6 h-6 text-stone-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-amber-500';
            case 'processing':
                return 'bg-blue-500';
            case 'shipped':
                return 'bg-purple-500';
            case 'delivered':
                return 'bg-green-500';
            default:
                return 'bg-stone-400';
        }
    };

    const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-stone-100 py-16 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
                        Track Your Order
                    </h1>
                    <p className="text-stone-600 text-lg">
                        Enter your order ID to see the current status and shipping details
                    </p>
                </div>

                {/* Search Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-slide-up">
                    <form onSubmit={handleTrackOrder} className="space-y-4">
                        <div>
                            <label htmlFor="orderId" className="block text-sm font-semibold text-stone-700 mb-2">
                                Order ID
                            </label>
                            <input
                                type="text"
                                id="orderId"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Enter your order ID (e.g., 65abc123...)"
                                className="w-full px-4 py-3 rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                                required
                            />
                            <p className="text-xs text-stone-500 mt-2">
                                You can find your order ID in the confirmation email or your profile orders section
                            </p>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            {loading ? 'Tracking...' : 'Track Order'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 animate-slide-down">
                            <p className="font-medium">{error}</p>
                        </div>
                    )}
                </div>

                {/* Order Details */}
                {orderData && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Status Timeline */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-6">Order Status</h2>

                            {/* Timeline */}
                            <div className="relative">
                                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-stone-200"></div>

                                {statusSteps.map((step, index) => {
                                    const isCompleted = statusSteps.indexOf(orderData.orderStatus) >= index;
                                    const isCurrent = orderData.orderStatus === step;

                                    return (
                                        <div key={step} className="relative flex items-start mb-8 last:mb-0">
                                            <div className={`relative z-10 flex items-center justify-center w-16 h-16 rounded-full ${isCompleted ? getStatusColor(step) : 'bg-stone-200'
                                                } shadow-lg transition-all duration-500`}>
                                                {getStatusIcon(step)}
                                            </div>
                                            <div className="ml-6 flex-1">
                                                <h3 className={`text-lg font-bold capitalize ${isCompleted ? 'text-stone-900' : 'text-stone-400'
                                                    }`}>
                                                    {step}
                                                </h3>
                                                {isCurrent && orderData.lastUpdate && (
                                                    <p className="text-sm text-stone-600 mt-1">{orderData.lastUpdate}</p>
                                                )}
                                                {step === 'delivered' && orderData.deliveredAt && (
                                                    <p className="text-sm text-stone-600 mt-1">
                                                        Delivered on {new Date(orderData.deliveredAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Shipping Details */}
                        {(orderData.trackingId || orderData.courier || orderData.estimatedDelivery) && (
                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold text-stone-900 mb-6">Shipping Details</h2>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {orderData.trackingId && (
                                        <div className="flex items-start gap-3">
                                            <Package className="w-5 h-5 text-amber-600 mt-1" />
                                            <div>
                                                <p className="text-sm text-stone-600">Tracking ID</p>
                                                <p className="font-semibold text-stone-900">{orderData.trackingId}</p>
                                            </div>
                                        </div>
                                    )}
                                    {orderData.courier && (
                                        <div className="flex items-start gap-3">
                                            <Truck className="w-5 h-5 text-amber-600 mt-1" />
                                            <div>
                                                <p className="text-sm text-stone-600">Courier</p>
                                                <p className="font-semibold text-stone-900">{orderData.courier}</p>
                                            </div>
                                        </div>
                                    )}
                                    {orderData.estimatedDelivery && (
                                        <div className="flex items-start gap-3">
                                            <Clock className="w-5 h-5 text-amber-600 mt-1" />
                                            <div>
                                                <p className="text-sm text-stone-600">Estimated Delivery</p>
                                                <p className="font-semibold text-stone-900">
                                                    {new Date(orderData.estimatedDelivery).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Shipping Address */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-6">Delivery Address</h2>
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-amber-600 mt-1" />
                                <div>
                                    <p className="text-stone-900">{orderData.shippingAddress.street}</p>
                                    <p className="text-stone-900">
                                        {orderData.shippingAddress.city}, {orderData.shippingAddress.state} {orderData.shippingAddress.zip}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <h2 className="text-2xl font-bold text-stone-900 mb-6">Order Items</h2>
                            <div className="space-y-4">
                                {orderData.orderItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-stone-50 rounded-lg">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-20 h-20 object-cover rounded-lg"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-stone-900">{item.name}</h3>
                                            <p className="text-sm text-stone-600">Quantity: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-stone-900">₹{item.price}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t border-stone-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold text-stone-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-amber-600">₹{orderData.itemsPrice}</span>
                                </div>
                            </div>
                        </div>

                        {/* Help Section */}
                        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-8 border border-amber-200">
                            <h3 className="text-xl font-bold text-stone-900 mb-4">Need Help?</h3>
                            <p className="text-stone-700 mb-4">
                                If you have any questions about your order, feel free to contact us:
                            </p>
                            <div className="flex flex-col md:flex-row gap-4">
                                <a
                                    href="tel:+919876543210"
                                    className="flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium"
                                >
                                    <Phone className="w-5 h-5" />
                                    +91 98765 43210
                                </a>
                                <a
                                    href="mailto:support@sgpf.com"
                                    className="flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium"
                                >
                                    <Mail className="w-5 h-5" />
                                    support@sgpf.com
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrackOrderPage;
