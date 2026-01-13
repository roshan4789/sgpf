import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { ShoppingCart, Star, Heart, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';

const ProductDetailsPage = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { user } = useAuth(); // for wishlist if implemented
    const { fetchRelatedProducts, products } = useShop(); // try to get from cache first

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [related, setRelated] = useState([]);
    const [toast, setToast] = useState(null);
    const [mainImage, setMainImage] = useState('');

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

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
                    const { data } = await axios.get(`${API_URL}/api/products/${id}`);
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

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-amber-700" size={48} /></div>;
    if (!product) return <div className="text-center py-20">Product not found <Link to="/" className="text-amber-700 underline">Go Home</Link></div>;

    const isSoldOut = product.countInStock === 0;

    const handleAddToCart = () => {
        addToCart(product);
        setToast({ message: "Added to Cart!", type: "success" });
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
                            <button className="p-4 border-2 border-stone-200 rounded-xl hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-all">
                                <Heart size={24} />
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
