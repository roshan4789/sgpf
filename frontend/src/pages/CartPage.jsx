import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowRight, Trash2, Plus, Minus, ChevronLeft, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import api from '../services/api';
import Toast from '../components/ui/Toast';

const CartPage = () => {
    const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);



    const itemsPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const taxPrice = Math.round(itemsPrice * 0.18);
    const shippingPrice = itemsPrice > 1000 ? 0 : 50; // Example logic
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    const loadRazorpay = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login?redirect=cart');
            return;
        }

        // Use user's saved address or fallback (In a real app, force them to add one)
        const shippingAddress = user.addresses && user.addresses.length > 0
            ? user.addresses[0]
            : null;

        if (!shippingAddress) {
            setToast({ message: "Please add a shipping address in your Profile first!", type: "error" });
            setTimeout(() => navigate('/profile?tab=addresses'), 1500);
            return;
        }

        setIsLoading(true);
        try {
            const res = await loadRazorpay();
            if (!res) {
                setToast({ message: "Razorpay SDK failed to load", type: "error" });
                return;
            }

            // 1. Create Razorpay Order (Backend)
            // Backend expects: { orderItems, itemsPrice } and calculates the rest or takes it.
            // Map cart items to match backend schema (product: ID, qty: quantity)
            const formattedOrderItems = cart.map(item => ({
                product: item._id || item.id,
                name: item.name,
                image: item.image,
                price: item.price,
                qty: item.quantity,
                countInStock: item.countInStock
            }));

            const { data: orderResponse } = await api.post(`/orders`, {
                orderItems: formattedOrderItems,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice
            }, { headers: { Authorization: `Bearer ${user.token}` } });

            // 2. Initialize Razorpay Payment
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
                amount: orderResponse.amount, // Amount from backend (in paise)
                currency: orderResponse.currency,
                name: "SGPF",
                description: "Art & Frames",
                image: "/logo.png",
                order_id: orderResponse.id, // Razorpay Order ID from backend
                handler: async (response) => {
                    try {
                        // 3. Verify Payment & Save Order (Backend)
                        const paymentData = {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            orderItems: formattedOrderItems, // Pass formatted items to save it
                            shippingAddress: shippingAddress,
                            itemsPrice,
                            taxPrice,
                            shippingPrice,
                            totalPrice,
                            paymentMethod: 'Razorpay'
                        };

                        await api.post(`/orders/verify`, paymentData, {
                            headers: { Authorization: `Bearer ${user.token}` }
                        });

                        clearCart();
                        setToast({ message: "Payment Successful!", type: "success" });
                        setTimeout(() => navigate('/profile'), 2000);
                    } catch (e) {
                        console.error("Verification Error", e);
                        setToast({ message: "Payment Verification Failed", type: "error" });
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || ''
                },
                theme: {
                    color: "#b45309"
                }
            };

            const rzp1 = new window.Razorpay(options);
            rzp1.open();

        } catch (error) {
            console.error("Checkout Error", error);
            setToast({ message: error.response?.data?.message || "Checkout failed. Try again.", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="max-w-6xl mx-auto py-20 px-4 text-center">
                <div className="bg-white rounded-3xl border border-stone-100 p-12 shadow-sm inline-block">
                    <ShoppingCart size={64} className="mx-auto text-stone-300 mb-6" />
                    <h3 className="text-2xl font-bold text-stone-900 mb-2">Your Cart is Empty</h3>
                    <p className="text-stone-500 mb-8">Looks like you haven't added anything yet.</p>
                    <Link to="/" className="inline-flex items-center gap-2 bg-amber-700 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-800 transition-colors">
                        <ArrowRight size={20} /> Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <h1 className="text-4xl font-serif font-bold mb-2 text-stone-900">Shopping Cart</h1>
            <p className="text-stone-500 mb-8">{cart.length} items in your cart</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                        <div key={item._id || item.id} className="bg-white p-4 rounded-2xl border border-stone-100 flex gap-4 md:gap-6 items-center shadow-sm">
                            <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl bg-stone-50" />

                            <div className="flex-1">
                                <h3 className="font-bold text-stone-900 text-lg mb-1">{item.name}</h3>
                                <p className="text-stone-500 text-sm mb-4">{item.category}</p>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center border border-stone-200 rounded-lg">
                                        <button onClick={() => updateQuantity(item._id || item.id, -1)} className="p-2 hover:bg-stone-50 rounded-l-lg"><Minus size={16} /></button>
                                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id || item.id, 1)} className="p-2 hover:bg-stone-50 rounded-r-lg"><Plus size={16} /></button>
                                    </div>
                                    <p className="font-bold text-amber-700 text-lg">₹{item.price * item.quantity}</p>
                                </div>
                            </div>

                            <button onClick={() => removeFromCart(item._id || item.id)} className="p-3 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all self-start">
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}

                    <Link to="/" className="inline-flex items-center gap-2 text-stone-600 hover:text-amber-700 font-medium mt-6">
                        <ChevronLeft size={20} /> Continue Shopping
                    </Link>
                </div>

                {/* Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-sm border border-stone-100 p-8 sticky top-24">
                        <h3 className="text-xl font-bold text-stone-900 mb-6">Order Summary</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between text-stone-600">
                                <span>Subtotal</span>
                                <span className="font-bold">₹{itemsPrice}</span>
                            </div>
                            <div className="flex justify-between text-stone-600">
                                <span>Shipping</span>
                                <span className={shippingPrice === 0 ? "text-green-600 font-bold" : "font-bold"}>{shippingPrice === 0 ? "FREE" : `₹${shippingPrice}`}</span>
                            </div>
                            <div className="flex justify-between text-stone-600 border-t border-stone-100 pt-4">
                                <span>Tax (18% GST)</span>
                                <span className="font-bold">₹{taxPrice}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-2xl font-bold text-stone-900 mb-8 bg-stone-50 p-4 rounded-xl">
                            <span>Total</span>
                            <span className="text-amber-700">₹{totalPrice}</span>
                        </div>

                        <Button onClick={handleCheckout} disabled={isLoading} className="w-full text-lg py-4 mb-4">
                            {isLoading ? "Processing..." : "Proceed to Checkout"}
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-xs text-stone-400">
                            <Lock size={12} /> Secure Checkout via Razorpay
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
