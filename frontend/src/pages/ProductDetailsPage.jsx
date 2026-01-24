import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { ShoppingCart, Star, Heart, ArrowLeft, CheckCircle } from 'lucide-react';
import { PageLoader } from '../components/ui/Loader';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { fetchRelatedProducts, products } = useShop();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [related, setRelated] = useState([]);
    const [toast, setToast] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);



    useEffect(() => {
        const loadProduct = async () => {
            setLoading(true);
            try {
                // Try finding in existing list first to save bandwidth
                const cached = products.find(p => (p._id || p.id) === id);
                if (cached) {
                    setProduct(cached);
                    setMainImage(cached.image);
                } else {
                    const { data } = await api.get(`/products/${id}`);
                    setProduct(data);
                    setMainImage(data.image);
                }

                // Fetch related
                const relatedData = await fetchRelatedProducts(id);
                setRelated(relatedData);
            } catch (e) {
                console.error("Error loading product", e);
            } finally {
                setLoading(false);
            }
        };
        loadProduct();
    }, [id, products]); // Re-run if ID changes

    useEffect(() => {
        if (product && user && user.wishlist) {
            setIsWishlisted(user.wishlist.some(item => item._id === product._id || item === product._id));
        }
    }, [product, user]);

    if (loading) return <PageLoader message="Loading product details..." />;
    if (!product) return <div className="text-center py-20">Product not found <Link to="/" className="text-amber-700 underline">Go Home</Link></div>;

    const isSoldOut = product.countInStock === 0;

    const handleAddToCart = () => {
        addToCart(product);
        setToast({ message: "Added to Cart!", type: "success" });
    };

    const handleWishlist = async () => {
        if (!user) {
            setToast({ message: "Please login to add to wishlist", type: "info" });
            return;
        }

        setWishlistLoading(true);
        try {
            const { data } = await api.put(`/users/wishlist`,
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

        } catch (error) {
            setToast({ message: "Failed to update wishlist", type: "error" });
        } finally {
            setWishlistLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-stone-50 py-8 px-4 md:px-12">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <Link to="/" className="inline-flex items-center gap-2 text-stone-600 hover:text-amber-700 mb-8 font-medium">
                <ArrowLeft size={20} /> Back to Shopping
            </Link>

            <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">
                    {/* Image Section */}
                    <div className="bg-stone-100 p-8 flex items-center justify-center min-h-[400px] lg:min-h-[600px] relative group">
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full h-full object-contain max-h-[500px] drop-shadow-xl"
                            onError={(e) => { e.target.src = 'https://via.placeholder.com/500?text=No+Image'; }}
                        />
                        {isSoldOut && (
                            <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                                <span className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold text-2xl shadow-xl transform -rotate-12">OUT OF STOCK</span>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="p-8 lg:p-12 lg:pr-20 flex flex-col justify-center">
                        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold mb-6 uppercase tracking-wide w-fit">
                            {product.mainCategory || product.category}
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-serif font-bold text-stone-900 mb-4 leading-tight">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex text-amber-400">
                                {[...Array(5)].map((_, i) => <Star key={i} size={20} className="fill-current" />)}
                            </div>
                            <span className="text-stone-500 font-medium">(124 verified reviews)</span>
                        </div>

                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-4xl lg:text-5xl font-bold text-amber-700">₹{product.price}</span>
                            {product.originalPrice && product.originalPrice > product.price && (
                                <>
                                    <span className="text-2xl text-stone-400 line-through">₹{product.originalPrice}</span>
                                    <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                                        {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% SAVE
                                    </span>
                                </>
                            )}
                        </div>

                        <p className="text-stone-600 text-lg leading-relaxed mb-8">{product.description || "Experience the divine elegance of this handcrafted masterpiece. Perfect for your home or as a thoughtful gift."}</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                                <p className="text-xs text-stone-500 uppercase font-bold mb-1">Availability</p>
                                <p className={`font-bold ${isSoldOut ? 'text-red-600' : 'text-green-600'}`}>
                                    {isSoldOut ? 'Sold Out' : 'In Stock'}
                                </p>
                            </div>
                            <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                                <p className="text-xs text-stone-500 uppercase font-bold mb-1">Delivery</p>
                                <p className="font-bold text-stone-900">2-5 Days</p>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-auto">
                            <Button
                                onClick={handleAddToCart}
                                disabled={isSoldOut}
                                className="flex-1 text-lg py-4 shadow-xl shadow-amber-100"
                            >
                                <ShoppingCart className="mr-2" /> Add to Cart
                            </Button>
                            <button
                                onClick={handleWishlist}
                                disabled={wishlistLoading}
                                className={`
                                    p-4 border-2 rounded-xl transition-all
                                    ${isWishlisted
                                        ? 'border-red-200 text-red-500 bg-red-50 hover:bg-red-100'
                                        : 'border-stone-200 hover:border-red-200 hover:text-red-500 hover:bg-red-50'
                                    }
                                    disabled:opacity-50
                                `}
                                title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                            >
                                <Heart size={24} className={isWishlisted ? 'fill-current' : ''} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products */}
            {related.length > 0 && (
                <div className="max-w-7xl mx-auto mt-16">
                    <h2 className="text-2xl font-bold text-stone-900 mb-8 border-b border-stone-200 pb-4">You Might Also Like</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {related.map(rp => (
                            <Link key={rp._id || rp.id} to={`/product/${rp._id || rp.id}`} className="group block bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition-all">
                                <div className="h-48 overflow-hidden bg-stone-100">
                                    <img src={rp.image} alt={rp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold text-stone-900 truncate group-hover:text-amber-700">{rp.name}</h3>
                                    <p className="text-amber-700 font-bold mt-1">₹{rp.price}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailsPage;
