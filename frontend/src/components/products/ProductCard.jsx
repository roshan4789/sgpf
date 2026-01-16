import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Bell, Star, CheckCircle, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Toast from '../ui/Toast';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const [adding, setAdding] = useState(false);
    const [toast, setToast] = useState(null);
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    const isSoldOut = product.countInStock === 0;
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

    useEffect(() => {
        if (user && user.wishlist) {
            setIsWishlisted(user.wishlist.some(item => item._id === product._id || item === product._id));
        }
    }, [user, product._id]);

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAdding(true);
        addToCart(product);
        setTimeout(() => setAdding(false), 1000);
    };

    const handleNotifyMe = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            setToast({ message: "Please login to get notified", type: "info" });
            return;
        }
        try {
            await axios.post(`${API_URL}/api/products/notify`, { userId: user._id, productId: product._id || product.id });
            setToast({ message: "We will notify you when back in stock!", type: "success" });
        } catch (error) {
            setToast({ message: "Notification request sent!", type: "success" });
        }
    };

    const handleWishlist = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!user) {
            setToast({ message: "Please login to add to wishlist", type: "info" });
            return;
        }

        setWishlistLoading(true);
        try {
            const { data } = await axios.put(`${API_URL}/api/users/wishlist`, 
                { productId: product._id || product.id }, 
                { headers: { Authorization: `Bearer ${user.token}` } }
            );
            
            setIsWishlisted(!isWishlisted);
            setToast({ 
                message: isWishlisted ? "Removed from wishlist" : "Added to wishlist", 
                type: "success" 
            });
            
            // Update user in localStorage to reflect wishlist changes
            const updatedUser = { ...user, wishlist: data };
            localStorage.setItem('ganpatiUser', JSON.stringify(updatedUser));
            
            // Trigger a custom event to notify other components
            window.dispatchEvent(new CustomEvent('wishlistUpdated', { detail: data }));
            
        } catch (error) {
            setToast({ message: "Failed to update wishlist", type: "error" });
        } finally {
            setWishlistLoading(false);
        }
    };

    return (
        <div className="group flex flex-col bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Image Container */}
            <Link to={`/product/${product._id || product.id}`} className="relative overflow-hidden bg-stone-50 aspect-square block">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

                {/* Badges */}
                {isSoldOut ? (
                    <div className="absolute top-2 right-2 bg-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold">OUT OF STOCK</div>
                ) : product.countInStock < 5 ? (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2.5 py-1 rounded-md text-xs font-bold">LOW STOCK</div>
                ) : null}

                {product.originalPrice && product.originalPrice > product.price && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white px-2.5 py-1 rounded-md text-xs font-bold">
                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                    </div>
                )}
            </Link>

            {/* Content Container */}
            <div className="flex-1 flex flex-col p-4">
                <div className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">
                    {product.mainCategory || product.category}
                </div>

                <Link to={`/product/${product._id || product.id}`} className="block mb-2">
                    <h3 className="font-semibold text-sm text-stone-900 line-clamp-2 group-hover:text-stone-700 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-stone-300'} />
                    ))}
                    <span className="text-xs text-stone-500 ml-1">(42)</span>
                </div>

                {/* Price Section */}
                <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                        <span className="text-lg font-bold text-stone-900">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-stone-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                        )}
                    </div>
                </div>

                {/* Spacer */}
                <div className="flex-1"></div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {isSoldOut ? (
                        <button
                            onClick={handleNotifyMe}
                            className="flex-1 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                            <Bell size={16} /> Notify Me
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleAddToCart}
                                disabled={adding}
                                className={`
                                    flex-1 py-2.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 text-sm
                                    ${adding
                                        ? 'bg-green-600 text-white'
                                        : 'bg-stone-900 hover:bg-stone-800 text-white active:scale-95'
                                    }
                                    disabled:opacity-50
                                `}
                            >
                                {adding ? (
                                    <>
                                        <CheckCircle size={16} />
                                        <span>Added!</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart size={16} />
                                        <span>Add</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={handleWishlist}
                                disabled={wishlistLoading}
                                className={`
                                    px-3 py-2.5 rounded-lg border font-medium transition-all duration-300 flex items-center justify-center text-sm
                                    ${isWishlisted
                                        ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                        : 'border-stone-300 text-stone-700 hover:bg-stone-50'
                                    }
                                    disabled:opacity-50
                                `}
                                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <Heart size={16} className={isWishlisted ? 'fill-current' : ''} />
                            </button>
                            <Link
                                to={`/product/${product._id || product.id}`}
                                className="px-3 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors font-medium text-sm flex items-center justify-center"
                            >
                                <Eye size={16} />
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
