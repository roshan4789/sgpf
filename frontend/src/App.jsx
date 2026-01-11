import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// Using safe, standard icons that won't crash your browser
import {
    ShoppingCart, Search, Menu, X, Star, Trash2, CheckCircle,
    ArrowRight, Plus, Minus, Home, Layers, User, Lock,
    LogOut, Phone, Bell, Package, ChevronDown, ChevronLeft, ChevronRight,
    MapPin, Loader2, AlertTriangle, RefreshCw, Image, Eye, Heart, Filter, SlidersHorizontal, Share2, Clock
} from 'lucide-react';

// --- CONFIGURATION ---
const API_URL = 'http://127.0.0.1:5000';

// --- HELPER: Load Razorpay ---
const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// --- DATA: Categories ---
const CATEGORY_HIERARCHY = {
    "Posters": ["Religious", "Marvel", "Anime", "Mcu", "Cars", "Bikes", "Jets"],
    "Frames": ["Deep Box Frame", "Led Light Frame", "Italian Frame", "Canvas Frame", "Brass Frame", "Silver Frame", "Metal Frame", "Aluminum Frame", "Wooden Frame"],
    "Pure Tanjore Work": ["Gold Work", "Silver Work"],
    "MDF Cutouts": ["Religious Cutouts", "Decor Cutouts"]
};

// --- DATA: Fallback Content ---
// Kept empty so it uses your real DB data. 
// If DB is empty, it shows "No Products Found" UI.
const INITIAL_PRODUCTS = [];

const BANNER_SLIDES = [
    { id: 1, image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&q=80", subtitle: "PREMIUM ART & FRAMING", title: "Frame Your Precious Moments & Divine Memories", desc: "From handcrafted wooden frames to exquisite religious posters, we help you preserve what matters most.", color: "text-amber-400" },
    { id: 2, image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1600&q=80", subtitle: "HANDCRAFTED ELEGANCE", title: "Turn Your Walls Into A Masterpiece", desc: "Explore our new collection of Italian and Mahogany finished frames.", color: "text-amber-400" },
    { id: 3, image: "https://images.unsplash.com/photo-1628191011993-4350f92696b0?w=1600&q=80", subtitle: "DIVINE COLLECTION", title: "Authentic Tanjore Art & Gold Work", desc: "Bring home the blessings with our certified Gold and Silver foil Tanjore artworks.", color: "text-amber-400" }
];

// --- COMPONENTS ---
const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-amber-700 text-white hover:bg-amber-800 shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-50",
        secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 active:scale-95",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 active:scale-95",
        ghost: "text-gray-600 hover:bg-gray-100 active:scale-95",
        staff: "bg-stone-800 text-white hover:bg-black shadow-lg"
    };
    return <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Badge = ({ children }) => <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px]">{children}</span>;

const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
    return <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-slide-up ${type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>{type === 'success' ? <CheckCircle size={20} /> : type === 'error' ? <AlertTriangle size={20} /> : <Package size={20} />} <span className="font-medium">{message}</span></div>;
};

// --- MAIN APPLICATION ---
export default function App() {
    const [view, setView] = useState('home');

    // 🛒 FIX: Lazy Cart Load (Prevents empty cart on refresh)
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('ganpatiCart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });

    const [products, setProducts] = useState(INITIAL_PRODUCTS);
    const [banners, setBanners] = useState(BANNER_SLIDES);

    // PAGINATION STATE
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [productsLoading, setProductsLoading] = useState(false);

    const [activeMainCategory, setActiveMainCategory] = useState(null);
    const [activeSubCategory, setActiveSubCategory] = useState('All');
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [toast, setToast] = useState(null);

    const [user, setUser] = useState(null);
    const [loginForm, setLoginForm] = useState({ phone: '', password: '' });
    const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [isRegistering, setIsRegistering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [resetMode, setResetMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [activeTab, setActiveTab] = useState('profile');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '' });
    const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '' });
    const [bulkOrder, setBulkOrder] = useState({ productName: '', quantity: '', details: '', date: '' });

    const [adminTab, setAdminTab] = useState('products');
    const [newProduct, setNewProduct] = useState({ name: '', price: '', mainCategory: 'Frames', category: 'Frames', countInStock: 10, image: '', description: '' });
    const [bannerForm, setBannerForm] = useState(BANNER_SLIDES);
    const [uploading, setUploading] = useState(false);
    const [addingToCart, setAddingToCart] = useState({}); // Track which product is being added
    const [cartQuantityAnimation, setCartQuantityAnimation] = useState({}); // Track quantity animations
    const [selectedProduct, setSelectedProduct] = useState(null); // Product details modal
    const [newBanner, setNewBanner] = useState({ image: '', title: '', subtitle: '', description: '' }); // Add banner form

    // Worker state
    const [worker, setWorker] = useState(null);
    const [orders, setOrders] = useState([]);
    const [workerTab, setWorkerTab] = useState('orders');

    // Create a ref for the products section
    const productsSectionRef = useRef(null);

    const scrollToProducts = () => {
        productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);

    // Update Document Title
    useEffect(() => {
        document.title = "Shri Ganpati | Premium Photo Frames & Art";
    }, []);

    // New Feature State
    const [wishlist, setWishlist] = useState([]);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [productReviews, setProductReviews] = useState([]);
    const [userOrders, setUserOrders] = useState([]);

    // Filtering & Sorting State
    const [filters, setFilters] = useState({ category: 'All', minPrice: '', maxPrice: '', sort: 'newest' });
    const [isFilterOpen, setIsFilterOpen] = useState(false); // Mobile sidebar toggle

    const showToast = (message, type = 'default') => { setToast({ message, type }); };

    // --- INITIALIZATION ---
    useEffect(() => {
        // 1. Load User Safely
        try {
            const savedUser = localStorage.getItem('ganpatiUser');
            if (savedUser) {
                const u = JSON.parse(savedUser);
                if (u && u.token) {
                    setUser(u);
                    setEditProfileForm({ name: u.name || '', phone: u.phone || '' });
                }
            }
        } catch (error) { localStorage.clear(); }

        fetchProducts(1);
        fetchBanners();

        // Clear form data on page refresh (security & UX)
        setLoginForm({ phone: '', password: '' });
        setRegisterForm({ name: '', email: '', phone: '', password: '' });
        setResetMode(false);
        setIsRegistering(false);
        setShowPassword(false);

        // 2. Token Expiry Handler
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response && error.response.status === 401) {
                    setUser(null);
                    localStorage.removeItem('ganpatiUser');
                    setView('login');
                    showToast("Session expired. Please login again.", "info");
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    // 3. Cart Auto-Sync
    useEffect(() => {
        localStorage.setItem('ganpatiCart', JSON.stringify(cart));
        if (user && user.token) {
            axios.put(`${API_URL}/api/users/profile`, { cart }, { headers: { Authorization: `Bearer ${user.token}` } })
                .catch(err => console.log("Sync error", err));
        }
    }, [cart, user]);

    // 4. Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isDropdownOpen && !e.target.closest('[data-categories-dropdown]')) {
                setIsDropdownOpen(false);
            }
            if (isProfileMenuOpen && !e.target.closest('[data-profile-dropdown]')) {
                setIsProfileMenuOpen(false);
            }
            if (isStaffMenuOpen && !e.target.closest('[data-staff-menu]')) {
                setIsStaffMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isDropdownOpen, isProfileMenuOpen, isStaffMenuOpen]);

    // Close staff menu on scroll
    useEffect(() => {
        const handleScroll = () => {
            if (isStaffMenuOpen) {
                setIsStaffMenuOpen(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isStaffMenuOpen]);

    useEffect(() => { const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % banners.length), 5000); return () => clearInterval(timer); }, [banners]);

    // --- API CALLS ---
    // --- API CALLS ---
    const fetchProducts = async (pageNumber = 1, append = false, filterOverride = null) => {
        setProductsLoading(true);
        try {
            const activeFilters = filterOverride || filters;
            const { category, minPrice, maxPrice, sort } = activeFilters;
            let query = `?pageNumber=${pageNumber}&sort=${sort}`;

            if (category && category !== 'All') query += `&category=${category}`;
            if (minPrice) query += `&minPrice=${minPrice}`;
            if (maxPrice) query += `&maxPrice=${maxPrice}`;
            if (searchQuery) query += `&keyword=${searchQuery}`;

            const { data } = await axios.get(`${API_URL}/api/products${query}`);
            const newProducts = Array.isArray(data) ? data : (data.products || []);
            const newTotalPages = data.pages || 1;

            if (append) setProducts(prev => [...prev, ...newProducts]);
            else setProducts(newProducts);

            setPage(pageNumber);
            setTotalPages(newTotalPages);
        } catch (e) {
            console.log("Error fetching products", e);
            showToast("Failed to load products", "error");
        } finally { setProductsLoading(false); }
    };

    const loadMore = () => { if (page < totalPages) fetchProducts(page + 1, true); };
    const fetchBanners = async () => { try { const { data } = await axios.get(`${API_URL}/api/banners`); if (data && data.length > 0) { setBanners(data); setBannerForm(data); } } catch (e) { console.log("Offline banners"); } };

    const fetchWishlist = async () => {
        if (!user) return;
        try {
            const { data } = await axios.get(`${API_URL}/api/users/wishlist`, { headers: { Authorization: `Bearer ${user.token}` } });
            setWishlist(data);
        } catch (error) { console.log("Wishlist error", error); }
    };

    const toggleWishlist = async (product) => {
        if (!user) { showToast("Please login to use wishlist", "info"); return; }
        try {
            const { data } = await axios.put(`${API_URL}/api/users/wishlist`, { productId: product._id || product.id }, { headers: { Authorization: `Bearer ${user.token}` } });
            setWishlist(data); // Returns updated list of IDs
            const isAdded = data.includes(product._id || product.id);
            showToast(isAdded ? "Added to Wishlist" : "Removed from Wishlist", "success");
        } catch (error) { showToast("Failed to update wishlist", "error"); }
    };

    const fetchRelatedProducts = async (id) => {
        try {
            const { data } = await axios.get(`${API_URL}/api/products/${id}/related`);
            setRelatedProducts(data);
        } catch (error) { setRelatedProducts([]); }
    };

    const fetchUserOrders = async () => {
        if (!user) return;
        try {
            const { data } = await axios.get(`${API_URL}/api/orders/myorders`, { headers: { Authorization: `Bearer ${user.token}` } });
            setUserOrders(data);
        } catch (error) { console.log("Error fetching orders", error); }
    };

    // --- ACTIONS ---
    const addToCart = (product) => {
        if (product.countInStock === 0) { showToast("Item sold out.", "info"); return; }

        const prodId = product._id || product.id;
        const existingItem = cart.find(item => (item._id || item.id) === prodId);
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const newQuantity = currentQuantity + 1;

        // Start button animation
        setAddingToCart(prev => ({ ...prev, [prodId]: true }));

        // Update cart immediately
        setCart(prev => {
            const existing = prev.find(item => (item._id || item.id) === prodId);
            if (existing) return prev.map(item => ((item._id || item.id) === prodId) ? { ...item, quantity: item.quantity + 1 } : item);
            return [...prev, { ...product, quantity: 1 }];
        });

        // Show quantity badge animation
        setCartQuantityAnimation(prev => ({ ...prev, [prodId]: { quantity: newQuantity, show: true, animating: true, disappearing: false } }));

        // After appear animation completes, mark as not animating but keep showing with pulse
        setTimeout(() => {
            setCartQuantityAnimation(prev => ({ ...prev, [prodId]: { ...prev[prodId], animating: false } }));
        }, 500);

        // Reset button state after click animation
        setTimeout(() => {
            setAddingToCart(prev => {
                const newState = { ...prev };
                delete newState[prodId];
                return newState;
            });
        }, 600);

        // Start fade out after 2 seconds (like modern e-commerce sites)
        setTimeout(() => {
            setCartQuantityAnimation(prev => ({ ...prev, [prodId]: { ...prev[prodId], disappearing: true } }));
            // Clean up after fade out animation completes
            setTimeout(() => {
                setCartQuantityAnimation(prev => {
                    const newState = { ...prev };
                    delete newState[prodId];
                    return newState;
                });
            }, 400);
        }, 2000);
    };

    // Get current quantity for a product
    const getProductQuantity = (productId) => {
        const item = cart.find(item => (item._id || item.id) === productId);
        return item ? item.quantity : 0;
    };

    const handleNotifyMe = async (product) => {
        if (!user) { showToast("Please login to get notified", "info"); return; }
        try {
            await axios.post(`${API_URL}/api/products/notify`, { userId: user._id, productId: product._id || product.id });
            showToast("We will notify you when back in stock!", "success");
        } catch (error) { showToast("Notification request sent!", "success"); }
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => {
            const itemId = item._id || item.id;
            return itemId !== id;
        }));
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            const itemId = item._id || item.id;
            if (itemId === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
            return item;
        }));
    };

    const handleCheckout = async () => {
        if (!user) { setView('login'); showToast("Please login", "info"); return; }
        if (!user.addresses || user.addresses.length === 0) { setView('account'); setActiveTab('profile'); showToast("Please add an address first", "error"); return; }
        setIsLoading(true);
        try {
            const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
            if (!res) { showToast('Razorpay SDK failed to load', 'error'); return; }
            const itemsPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
            const { data: orderData } = await axios.post(`${API_URL}/api/orders`, { orderItems: cart, itemsPrice }, { headers: { Authorization: `Bearer ${user.token}` } });
            const { data: key } = await axios.get(`${API_URL}/api/config/razorpay`);
            const options = {
                key: key, amount: orderData.amount, currency: orderData.currency, name: "Shri Ganpati", description: "Art Order", order_id: orderData.id,
                handler: async function (response) {
                    try {
                        await axios.post(`${API_URL}/api/orders/verify`, { razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature, orderItems: cart, itemsPrice, shippingAddress: user.addresses[0] }, { headers: { Authorization: `Bearer ${user.token}` } });
                        setCart([]); setView('account'); setActiveTab('orders'); showToast("Payment Successful!", "success");
                    } catch (err) { showToast("Payment Verification Failed", "error"); }
                },
                prefill: { name: user.name, email: user.email, contact: user.phone }, theme: { color: "#b45309" },
            };
            const paymentObject = new window.Razorpay(options); paymentObject.open();
        } catch (error) { showToast("Order Creation Failed.", "error"); } finally { setIsLoading(false); }
    };

    const handleAddProduct = async () => {
        if (!newProduct.name || !newProduct.price) {
            showToast("Please fill in name and price", "error");
            return;
        }
        if (!newProduct.mainCategory) {
            showToast("Please select a main category", "error");
            return;
        }
        setIsLoading(true);
        try {
            // Ensure mainCategory and category are set
            const productData = {
                ...newProduct,
                mainCategory: newProduct.mainCategory || newProduct.category,
                category: newProduct.category || newProduct.mainCategory,
            };
            await axios.post(`${API_URL}/api/products`, productData, { headers: { Authorization: `Bearer ${user.token}` } });
            showToast("Product Added!", "success");
            setNewProduct({ name: '', price: '', mainCategory: 'Frames', category: 'Frames', countInStock: 10, image: '', description: '' });
            fetchProducts(1);
        } catch (error) {
            const errorMessage = error.response?.data?.message || "Failed to Add Product";
            showToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };
    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Delete?")) return;
        try { await axios.delete(`${API_URL}/api/products/${id}`, { headers: { Authorization: `Bearer ${user.token}` } }); showToast("Deleted", "success"); fetchProducts(1); } catch (error) { showToast("Failed", "error"); }
    };
    const handleSaveBanners = async () => {
        try { await axios.post(`${API_URL}/api/banners`, bannerForm, { headers: { Authorization: `Bearer ${user.token}` } }); setBanners(bannerForm); showToast("Banners Updated!", "success"); } catch (error) { showToast("Update failed", "error"); }
    };

    const handleAddBanner = () => {
        if (!newBanner.image || !newBanner.title) {
            showToast("Please fill image and title", "error");
            return;
        }
        setBannerForm([...bannerForm, { id: bannerForm.length + 1, ...newBanner, color: 'text-amber-400' }]);
        setNewBanner({ image: '', title: '', subtitle: '', description: '' });
        showToast("Banner added! Click 'Save All Banners' to confirm.", "success");
    };

    const handleRemoveBanner = (index) => {
        if (window.confirm("Remove this banner?")) {
            setBannerForm(bannerForm.filter((_, i) => i !== index));
            showToast("Banner removed", "success");
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        try { const { data } = await axios.put(`${API_URL}/api/users/profile`, { address: newAddress }, { headers: { Authorization: `Bearer ${user.token}` } }); setUser(data); setNewAddress({ street: '', city: '', state: '', zip: '' }); showToast("Address Saved!", "success"); } catch (error) { showToast("Failed to save", "error"); }
    };
    const handleBulkSubmit = async (e) => {
        e.preventDefault(); setIsLoading(true);
        try { await axios.post(`${API_URL}/api/orders/bulk`, { ...bulkOrder, user }, { headers: { Authorization: `Bearer ${user.token}` } }); showToast("Request Sent!", "success"); setBulkOrder({ productName: '', quantity: '', details: '', date: '' }); } catch (error) { showToast("Failed", "error"); } finally { setIsLoading(false); }
    };

    const handleLogin = async (e) => {
        e.preventDefault(); setIsLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/users/login`, { email: loginForm.phone, password: loginForm.password });
            if (view === 'staff-login') {
                if (!data.isAdmin && !data.isWorker) {
                    showToast("Access Denied. Staff/Worker Only.", "error");
                    setIsLoading(false);
                    return;
                }
                if (data.isWorker) {
                    setWorker(data);
                    localStorage.setItem('ganpatiWorker', JSON.stringify(data));
                    setLoginForm({ phone: '', password: '' });
                    setShowPassword(false);
                    setView('worker-dashboard');
                    showToast(`Welcome ${data.name}!`, "success");
                    setIsLoading(false);
                    return;
                }
            }
            setUser(data);
            localStorage.setItem('ganpatiUser', JSON.stringify(data));
            if (data.cart && data.cart.length > 0) setCart(data.cart); // Restore Cart
            setEditProfileForm({ name: data.name, phone: data.phone });
            // Clear sensitive form data
            setLoginForm({ phone: '', password: '' });
            setShowPassword(false);
            if (data.isAdmin) setView('admin'); else setView('home');
            showToast(`Welcome ${data.name}!`, "success");
        } catch (error) {
            showToast(error.response?.data?.message || "Login Failed.", "error");
        } finally { setIsLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!registerForm.name || !registerForm.email || !registerForm.phone || !registerForm.password) { showToast("Please fill all fields", "error"); return; }
        if (registerForm.phone.length < 10) { showToast("Phone must be 10 digits", "error"); return; }
        setIsLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/api/users`, { ...registerForm, isAdmin: false });
            setUser(data); setEditProfileForm({ name: data.name, phone: data.phone });
            // Clear sensitive form data
            setRegisterForm({ name: '', email: '', phone: '', password: '' });
            setIsRegistering(false);
            setLoginForm({ phone: '', password: '' });
            setShowPassword(false);
            setView('home'); showToast("Account created!", "success");
        } catch (error) { showToast(error.response?.data?.message || "Registration Failed.", "error"); } finally { setIsLoading(false); }
    };

    const handleResetPassword = async (e) => { e.preventDefault(); showToast("Reset link sent.", "success"); setResetMode(false); };
    const goToStaffLogin = () => { setLoginForm({ phone: '', password: '' }); setIsRegistering(false); setResetMode(false); setView('staff-login'); };

    // Logout handler - clears all sensitive data
    const handleLogout = () => {
        setUser(null);
        setCart([]);
        localStorage.removeItem('ganpatiUser');
        localStorage.removeItem('ganpatiCart');
        setLoginForm({ phone: '', password: '' });
        setRegisterForm({ name: '', email: '', phone: '', password: '' });
        setShowPassword(false);
        setResetMode(false);
        setIsRegistering(false);
        setEditProfileForm({ name: '', phone: '' });
        setView('home');
        showToast("Logged out successfully", "success");
    };

    const handleMainCategorySelect = (mainCat) => {
        const newFilters = { ...filters, category: mainCat || 'All' };
        setFilters(newFilters);
        setActiveMainCategory(mainCat);
        setActiveSubCategory('All');
        setIsCategoryModalOpen(false);
        setView('home');
        fetchProducts(1, false, newFilters);
        scrollToProducts();
    };
    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

    const uploadFileHandler = async (e) => {
        const file = e.target.files[0];

        if (!file) {
            showToast('Please select a file', 'error');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showToast('Invalid file type. Please upload an image (JPEG, PNG, GIF, or WebP)', 'error');
            return;
        }

        // Validate file size (5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            showToast('File too large. Maximum size is 5MB', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const { data } = await axios.post(`${API_URL}/api/upload`, formData, config);

            // Handle both old string format and new object format
            const imagePath = typeof data === 'string' ? data : (data.path || data);
            const fullImageUrl = imagePath.startsWith('http') ? imagePath : `${API_URL}${imagePath}`;

            // Update the product form with the new path
            setNewProduct({ ...newProduct, image: fullImageUrl });
            showToast(data.message || 'Image Uploaded Successfully!', 'success');
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Image Upload Failed';
            showToast(errorMessage, 'error');
        } finally {
            setUploading(false);
        }
    };

    // --- VIEW RENDERERS ---
    const renderAdmin = () => (
        <div className="min-h-[calc(100vh-200px)] py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-stone-900 flex items-center gap-3 mb-2">
                            <div className="p-3 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg">
                                <Layers size={28} className="text-white" />
                            </div>
                            Admin Dashboard
                        </h1>
                        <p className="text-stone-600">Manage products, banners, and store settings</p>
                    </div>
                    <Button variant="secondary" onClick={() => setView('home')} className="px-6">
                        <ArrowRight size={18} /> Exit Admin
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-3 mb-8 items-center justify-between flex-wrap">
                    <div className="flex gap-3">
                        {[
                            { id: 'products', label: 'Products', icon: Package },
                            { id: 'banners', label: 'Banners', icon: Image }
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setAdminTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${adminTab === tab.id
                                        ? 'bg-amber-700 text-white shadow-lg'
                                        : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300'
                                        }`}
                                >
                                    <Icon size={18} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    <Button onClick={() => setView('worker-dashboard')} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2">
                        👷 View Worker Panel
                    </Button>
                </div>

                {/* Content */}
                {adminTab === 'products' && (
                    <div className="grid lg:grid-cols-4 gap-8 w-full">
                        {/* Add Product Form */}
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8 h-fit">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-100 rounded-lg">
                                    <Plus size={20} className="text-amber-700" />
                                </div>
                                <h3 className="text-xl font-bold text-stone-900">Add Product</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Product Name</label>
                                    <input placeholder="Enter product name" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Price (₹)</label>
                                    <input placeholder="0.00" type="number" min="0" step="0.01" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Image</label>
                                    <input placeholder="Image URL" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 mb-2 bg-stone-50" value={newProduct.image} readOnly />
                                    <div className="relative">
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                            onChange={uploadFileHandler}
                                            disabled={uploading}
                                            className="w-full text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                        />
                                        {uploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
                                                <Loader2 className="animate-spin text-amber-700" size={20} />
                                            </div>
                                        )}
                                    </div>
                                    {newProduct.image && (
                                        <img src={newProduct.image} alt="Preview" className="w-full h-32 object-cover rounded-lg border border-stone-200 mt-2" onError={(e) => { e.target.style.display = 'none'; }} />
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Main Category</label>
                                    <select className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" value={newProduct.mainCategory} onChange={e => {
                                        const mainCat = e.target.value;
                                        setNewProduct({ ...newProduct, mainCategory: mainCat, category: mainCat });
                                    }} required>
                                        {Object.keys(CATEGORY_HIERARCHY).map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Stock</label>
                                    <input placeholder="0" type="number" min="0" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" value={newProduct.countInStock} onChange={e => setNewProduct({ ...newProduct, countInStock: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
                                    <textarea placeholder="Product description..." className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" rows="3" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                                </div>
                                <Button onClick={handleAddProduct} className="w-full bg-amber-700 hover:bg-amber-800 text-white shadow-lg py-3" disabled={isLoading || !newProduct.name || !newProduct.price}>
                                    {isLoading ? <Loader2 className="animate-spin" /> : "Add Product"}
                                </Button>
                            </div>
                        </div>

                        {/* Product List */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <div>
                                        <h3 className="text-xl font-bold text-stone-900">Inventory</h3>
                                        <p className="text-sm text-stone-500 mt-1">{products.length} products total</p>
                                    </div>
                                    <Button variant="secondary" onClick={() => fetchProducts(1)} disabled={productsLoading} className="p-3">
                                        {productsLoading ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                                    </Button>
                                </div>

                                {productsLoading ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="animate-spin mx-auto mb-3 text-amber-700" size={32} />
                                        <p className="text-stone-600 font-medium">Loading inventory...</p>
                                    </div>
                                ) : products.length === 0 ? (
                                    <div className="text-center py-12 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                                        <Package size={40} className="mx-auto text-stone-300 mb-3" />
                                        <p className="text-stone-600 font-medium">No products yet</p>
                                        <p className="text-stone-500 text-sm">Add your first product using the form →</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg border border-stone-200">
                                        <table className="w-full border-collapse">
                                            <thead className="bg-gradient-to-r from-amber-50 to-stone-50 border-b-2 border-stone-200">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-stone-900">Image</th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-stone-900">Product Name</th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-stone-900">Description</th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-stone-900">Category</th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-stone-900">Price</th>
                                                    <th className="px-6 py-4 text-left text-sm font-bold text-stone-900">Stock</th>
                                                    <th className="px-6 py-4 text-center text-sm font-bold text-stone-900">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {products.map((p, idx) => (
                                                    <tr key={p._id || p.id} className={`border-b border-stone-200 hover:bg-amber-50 transition-colors duration-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}`}>
                                                        <td className="px-6 py-4">
                                                            <img
                                                                src={p.image}
                                                                alt={p.name}
                                                                className="w-12 h-12 object-cover rounded-lg border border-stone-200"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/48?text=No+Image'; }}
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-stone-900 truncate max-w-xs">{p.name}</p>
                                                        </td>
                                                        <td className="px-6 py-4 group relative">
                                                            <p className="text-xs text-stone-600 cursor-help line-clamp-2">{(p.description || 'No description').substring(0, 40)}...</p>
                                                            {p.description && (
                                                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 invisible group-hover:visible z-50 bg-stone-900 text-white text-xs rounded-lg px-3 py-2 w-64 whitespace-normal shadow-lg border border-stone-700">
                                                                    {p.description}
                                                                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-stone-900"></div>
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">{p.mainCategory || 'Uncategorized'}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-semibold text-amber-700">₹{p.price}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${p.countInStock > 10 ? 'bg-green-100 text-green-800' : p.countInStock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                                                {p.countInStock} units
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button onClick={() => {
                                                                    setNewProduct({
                                                                        _id: p._id || p.id,
                                                                        name: p.name,
                                                                        price: p.price,
                                                                        image: p.image,
                                                                        mainCategory: p.mainCategory,
                                                                        category: p.mainCategory,
                                                                        countInStock: p.countInStock,
                                                                        description: p.description,
                                                                        isEditing: true
                                                                    });
                                                                }} className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-700 hover:text-amber-800 rounded-lg transition-all duration-200 font-medium text-sm">
                                                                    ✏️
                                                                </button>
                                                                <Button variant="danger" onClick={() => handleDeleteProduct(p._id || p.id)} className="p-2">
                                                                    <Trash2 size={16} />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {adminTab === 'banners' && (
                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
                        <h3 className="text-2xl font-bold text-stone-900 mb-8">Manage Banners</h3>

                        {/* Add New Banner Section */}
                        <div className="mb-12 p-8 bg-gradient-to-br from-amber-50 to-stone-50 border-2 border-dashed border-amber-200 rounded-2xl">
                            <h4 className="font-bold text-lg text-stone-900 mb-6 flex items-center gap-2">
                                <Plus size={20} className="text-amber-700" />
                                Add New Banner
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Image URL</label>
                                    <input placeholder="https://images.unsplash.com/..." className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" value={newBanner.image} onChange={(e) => setNewBanner({ ...newBanner, image: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Title *</label>
                                    <input placeholder="Banner title" className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" value={newBanner.title} onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Subtitle</label>
                                    <input placeholder="e.g., PREMIUM ART" className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" value={newBanner.subtitle} onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
                                    <input placeholder="Banner description" className="w-full px-4 py-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" value={newBanner.description} onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })} />
                                </div>
                            </div>
                            <Button onClick={handleAddBanner} className="mt-6 w-full bg-amber-700 hover:bg-amber-800 text-white shadow-lg py-3">
                                <Plus size={18} /> Add Banner
                            </Button>
                        </div>

                        {/* Existing Banners */}
                        <div>
                            <h4 className="font-bold text-lg text-stone-900 mb-6">Current Banners ({bannerForm.length})</h4>
                            <div className="space-y-6">
                                {bannerForm.map((b, i) => (
                                    <div key={i} className="p-6 border border-stone-200 rounded-2xl bg-gradient-to-br from-stone-50 to-white relative group hover:shadow-lg transition-shadow">
                                        <div className="absolute top-4 right-4">
                                            <button
                                                onClick={() => handleRemoveBanner(i)}
                                                className="p-2 bg-red-100 hover:bg-red-600 text-red-600 hover:text-white rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <h4 className="font-bold text-lg text-stone-900 mb-4 flex items-center gap-2">
                                            <div className="w-8 h-8 bg-amber-700 text-white rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</div>
                                            Slide {i + 1}
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">Image URL</label>
                                                <input placeholder="https://..." className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" value={b.image} onChange={(e) => { const newB = [...bannerForm]; newB[i].image = e.target.value; setBannerForm(newB) }} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">Title</label>
                                                <input placeholder="Banner title" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" value={b.title} onChange={(e) => { const newB = [...bannerForm]; newB[i].title = e.target.value; setBannerForm(newB) }} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">Subtitle</label>
                                                <input placeholder="Banner subtitle" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" value={b.subtitle} onChange={(e) => { const newB = [...bannerForm]; newB[i].subtitle = e.target.value; setBannerForm(newB) }} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-stone-700 mb-2">Description</label>
                                                <input placeholder="Banner description" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white" value={b.desc} onChange={(e) => { const newB = [...bannerForm]; newB[i].desc = e.target.value; setBannerForm(newB) }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleSaveBanners} className="mt-8 w-full bg-amber-700 hover:bg-amber-800 text-white shadow-lg py-3">
                            💾 Save All Banners
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );

    const renderStaffLogin = () => (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Credentials Section */}
                    <div className="space-y-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold text-stone-900 mb-2">Staff Portal</h2>
                            <p className="text-stone-600">Use the credentials below to login</p>
                        </div>

                        {/* Admin Credentials */}
                        <div className="p-6 bg-gradient-to-br from-amber-50 to-stone-50 border-2 border-amber-200 rounded-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-700 rounded-lg flex items-center justify-center text-white font-bold">👨‍💼</div>
                                <h3 className="text-xl font-bold text-stone-900">Admin Account</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-white rounded-lg border border-amber-200">
                                    <p className="text-xs text-stone-500 uppercase font-semibold">Email/Username</p>
                                    <p className="font-mono text-lg font-bold text-stone-900">admin@ganpati.com</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-amber-200">
                                    <p className="text-xs text-stone-500 uppercase font-semibold">Password</p>
                                    <p className="font-mono text-lg font-bold text-stone-900">admin123</p>
                                </div>
                            </div>
                        </div>

                        {/* Worker Credentials */}
                        <div className="p-6 bg-gradient-to-br from-blue-50 to-stone-50 border-2 border-blue-200 rounded-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-700 rounded-lg flex items-center justify-center text-white font-bold">👷</div>
                                <h3 className="text-xl font-bold text-stone-900">Worker Account</h3>
                            </div>
                            <div className="space-y-3">
                                <div className="p-3 bg-white rounded-lg border border-blue-200">
                                    <p className="text-xs text-stone-500 uppercase font-semibold">Email/Username</p>
                                    <p className="font-mono text-lg font-bold text-stone-900">worker@ganpati.com</p>
                                </div>
                                <div className="p-3 bg-white rounded-lg border border-blue-200">
                                    <p className="text-xs text-stone-500 uppercase font-semibold">Password</p>
                                    <p className="font-mono text-lg font-bold text-stone-900">worker123</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Login Form Section */}
                    <div className="bg-white rounded-3xl shadow-xl border border-stone-100 p-8">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                                <Lock size={32} className="text-white" />
                            </div>
                            <h3 className="text-2xl font-bold text-stone-900">Staff Login</h3>
                            <p className="text-stone-500 text-sm mt-2">Enter your credentials above</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Email or Username</label>
                                <input
                                    placeholder="admin@ganpati.com"
                                    className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-transparent transition-all"
                                    value={loginForm.phone}
                                    onChange={e => setLoginForm({ ...loginForm, phone: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-700 focus:border-transparent transition-all"
                                        value={loginForm.password}
                                        onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-400 hover:text-stone-700"
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>
                            </div>
                            <Button
                                className="w-full bg-stone-700 hover:bg-stone-800 text-white shadow-lg py-3 mt-6"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : "🔐 Login"}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-stone-200">
                            <button onClick={() => setView('home')} className="w-full text-center text-sm text-stone-500 hover:text-stone-700 font-medium transition-colors">← Return to Home</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Worker Data Fetching
    useEffect(() => {
        if (worker && worker.isWorker) {
            fetchWorkerOrders();
        }
    }, [worker]);

    const fetchWorkerOrders = async () => {
        setOrdersLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/api/orders/worker/pending`, {
                headers: { Authorization: `Bearer ${worker.token}` }
            });
            setOrders(data);
        } catch (error) {
            showToast("Failed to fetch orders", "error");
        } finally {
            setOrdersLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (orderId, status, trackingId = null) => {
        try {
            await axios.put(
                `${API_URL}/api/orders/${orderId}/status`,
                { orderStatus: status, trackingId, courier: trackingId ? 'FedEx' : undefined, estimatedDelivery: status === 'shipped' ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) : undefined },
                { headers: { Authorization: `Bearer ${worker.token}` } }
            );
            showToast(`Order marked as ${status}`, "success");
            fetchWorkerOrders();
        } catch (error) {
            showToast("Update failed", "error");
        }
    };

    const renderWorkerDashboard = () => (
        <div className="min-h-[calc(100vh-200px)] py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-serif font-bold text-stone-900 flex items-center gap-3 mb-2">
                            <div className="p-3 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg">
                                <Package size={28} className="text-white" />
                            </div>
                            Worker Dashboard
                        </h1>
                        <p className="text-stone-600">Process orders and manage inventory</p>
                    </div>
                    <Button onClick={() => { setWorker(null); setView('home'); }} variant="secondary" className="px-6">
                        <LogOut size={18} /> Logout
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-3 mb-8">
                    {[
                        { id: 'orders', label: 'Orders', icon: ShoppingCart },
                        { id: 'stocks', label: 'Stocks', icon: Package },
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setWorkerTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${workerTab === tab.id
                                    ? 'bg-amber-700 text-white shadow-lg'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300'
                                    }`}
                            >
                                <Icon size={18} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Orders Tab */}
                {workerTab === 'orders' && (
                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-stone-900">Pending Orders</h3>
                                <p className="text-sm text-stone-500 mt-1">{orders.length} orders waiting to be processed</p>
                            </div>
                            <Button variant="secondary" className="p-3" onClick={fetchWorkerOrders}>
                                <RefreshCw size={18} className={ordersLoading ? "animate-spin" : ""} />
                            </Button>
                        </div>

                        {ordersLoading ? (
                            <div className="text-center py-12">
                                <Loader2 className="animate-spin mx-auto mb-3 text-amber-700" size={32} />
                                <p className="text-stone-600 font-medium">Loading orders...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map(order => (
                                    <div key={order._id} className="p-6 border border-stone-200 rounded-2xl hover:shadow-md transition-shadow duration-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center mb-4">
                                            <div>
                                                <p className="text-xs text-stone-500 uppercase">Order ID</p>
                                                <p className="font-bold text-stone-900 text-sm">{order._id}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-stone-500 uppercase">Customer</p>
                                                <p className="font-semibold text-stone-900">{order.user?.name || 'Unknown'}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-stone-500 uppercase">Amount</p>
                                                <p className="font-bold text-amber-700 text-lg">₹{order.itemsPrice}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-stone-500 uppercase">Items</p>
                                                <p className="font-semibold text-stone-900">{order.orderItems.reduce((acc, i) => acc + i.quantity, 0)} items</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-stone-500 uppercase">Status</p>
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {order.orderStatus.toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-stone-200">
                                            <p className="text-sm text-stone-600 mb-3"><strong>Address:</strong> {order.shippingAddress?.street}, {order.shippingAddress?.city}, {order.shippingAddress?.zip}</p>
                                            <div className="flex flex-wrap gap-2">
                                                {order.orderStatus === 'pending' && (
                                                    <button onClick={() => handleUpdateOrderStatus(order._id, 'processing')} className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors text-sm">
                                                        ⚙️ Mark Processing
                                                    </button>
                                                )}
                                                {order.orderStatus === 'processing' && (
                                                    <button onClick={() => {
                                                        const tid = prompt("Enter Tracking ID:");
                                                        if (tid) handleUpdateOrderStatus(order._id, 'shipped', tid);
                                                    }} className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors text-sm">
                                                        🚚 Mark Shipped
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {orders.length === 0 && <p className="text-center text-stone-500 py-8">No pending orders found.</p>}
                            </div>
                        )}
                    </div>
                )}

                {/* Stocks Tab - Reuse existing product list */}
                {workerTab === 'stocks' && (
                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-stone-900">Inventory Stocks</h3>
                                <p className="text-sm text-stone-500 mt-1">{products.length} products in stock</p>
                            </div>
                            <Button variant="secondary" className="p-3" onClick={() => fetchProducts(1)}>
                                <RefreshCw size={18} className={productsLoading ? "animate-spin" : ""} />
                            </Button>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-stone-200">
                            <table className="w-full border-collapse">
                                <thead className="bg-gradient-to-r from-blue-50 to-stone-50 border-b-2 border-stone-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-stone-900">Product</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-stone-900">Category</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-stone-900">Price</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-stone-900">Stock Level</th>
                                        <th className="px-6 py-4 text-left text-sm font-bold text-stone-900">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p, idx) => (
                                        <tr key={p._id || p.id} className={`border-b border-stone-200 hover:bg-blue-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-stone-50'}`}>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={p.image} alt={p.name} className="w-12 h-12 object-cover rounded-lg border border-stone-200" onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }} />
                                                    <p className="font-semibold text-stone-900 max-w-xs truncate">{p.name}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{p.mainCategory || 'Uncategorized'}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-semibold text-amber-700">₹{p.price}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-stone-900 text-lg">{p.countInStock} units</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${p.countInStock > 20 ? 'bg-green-100 text-green-800' : p.countInStock > 10 ? 'bg-yellow-100 text-yellow-800' : p.countInStock > 0 ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'}`}>
                                                    {p.countInStock > 20 ? '✓ In Stock' : p.countInStock > 10 ? '⚠️ Low Stock' : p.countInStock > 0 ? '⚠️ Very Low' : '✗ Out'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderUserAuth = () => (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden">
                {/* Header */}
                <div className="h-32 bg-gradient-to-r from-amber-600 to-amber-700"></div>

                <div className="p-8 -mt-16 relative z-10">
                    {/* Icon & Title */}
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg mx-auto mb-4">
                            {resetMode ? <Lock size={32} className="text-white" /> : isRegistering ? <User size={32} className="text-white" /> : <ShoppingCart size={32} className="text-white" />}
                        </div>
                        <h2 className="text-3xl font-bold text-stone-900">{resetMode ? "Reset Password" : isRegistering ? "Create Account" : "Welcome Back"}</h2>
                        <p className="text-stone-500 text-sm mt-2">{resetMode ? "Enter your email to reset" : isRegistering ? "Join us today" : "Login to your account"}</p>
                    </div>

                    {resetMode ? (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
                                <input placeholder="your@email.com" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all" required />
                            </div>
                            <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white shadow-lg">Send Reset Link</Button>
                            <button type="button" onClick={() => setResetMode(false)} className="w-full text-center text-sm text-stone-500 hover:text-amber-700 font-medium mt-2">← Back to Login</button>
                        </form>
                    ) : (
                        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                            {isRegistering && (
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                                    <input placeholder="John Doe" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" value={registerForm.name} onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })} required />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">{isRegistering ? "Email Address" : "Phone or Email"}</label>
                                <input placeholder={isRegistering ? "your@email.com" : "9999999999"} className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" value={isRegistering ? registerForm.email : loginForm.phone} onChange={e => isRegistering ? setRegisterForm({ ...registerForm, email: e.target.value }) : setLoginForm({ ...loginForm, phone: e.target.value })} required />
                            </div>
                            {isRegistering && (
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Phone Number</label>
                                    <input placeholder="9999999999" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent" value={registerForm.phone} onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })} required />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
                                <div className="relative">
                                    <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent pr-10" value={isRegistering ? registerForm.password : loginForm.password} onChange={e => isRegistering ? setRegisterForm({ ...registerForm, password: e.target.value }) : setLoginForm({ ...loginForm, password: e.target.value })} required />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 hover:text-amber-700 font-medium">{showPassword ? "Hide" : "Show"}</button>
                                </div>
                            </div>
                            {!isRegistering && (
                                <div className="flex justify-end">
                                    <button type="button" onClick={() => setResetMode(true)} className="text-sm text-amber-700 hover:text-amber-800 font-semibold">Forgot Password?</button>
                                </div>
                            )}
                            <Button className="w-full bg-amber-700 hover:bg-amber-800 text-white shadow-lg py-3" disabled={isLoading}>
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : (isRegistering ? "Create Account" : "Sign In")}
                            </Button>
                            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-stone-500">or</span></div></div>
                            <div className="text-center">
                                <p className="text-sm text-stone-600">{isRegistering ? "Already have an account? " : "Don't have an account? "}<button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-amber-700 font-bold hover:text-amber-800">{isRegistering ? "Sign in" : "Create one"}</button></p>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white font-sans text-gray-900">
            {/* Navigation */}
            <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-amber-100/50 w-full px-4 md:px-8 h-20 flex items-center shadow-md">
                {/* LEFT SECTION - LOGO + CATEGORIES */}
                <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
                    {/* Logo */}
                    <button onClick={() => { setView('home'); handleMainCategorySelect(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-2xl font-serif font-bold text-amber-900 tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity duration-300 group">
                        <img src="/sgpf-logo.png" alt="SGPF" className="w-12 h-12 object-contain" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }} />
                        <span className="hidden sm:inline text-amber-900 group-hover:text-amber-700 transition-colors">SGPF</span>
                    </button>


                </div>

                {/* CENTER - SEARCH BAR */}
                <div className="hidden md:flex flex-1 items-center justify-center px-4 md:px-8">
                    <div className="w-full max-w-md flex items-center gap-3 bg-gradient-to-r from-white/70 to-white/50 hover:from-white/90 hover:to-white/70 px-5 py-2.5 rounded-xl focus-within:ring-2 focus-within:ring-amber-500 transition-all border border-amber-100/40 backdrop-blur-sm">
                        <Search size={18} className="text-amber-700 flex-shrink-0" />
                        <input type="text" placeholder="Search products..." className="bg-transparent border-none outline-none text-sm flex-1 text-stone-700 placeholder-stone-400" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                </div>

                {/* RIGHT CORNER - ACTIONS */}
                <div className="flex items-center gap-2 md:gap-4 ml-auto flex-shrink-0">
                    {/* Search Icon (Mobile) */}
                    <button className="md:hidden p-2 hover:bg-amber-50 rounded-lg text-stone-700 transition-colors"><Search size={18} /></button>

                    {/* User Profile / Login with Dropdown */}
                    {user ? (
                        <div className="relative group" data-profile-dropdown>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center hover:opacity-90 transition-opacity duration-200"
                            >
                                <div className="w-9 h-9 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-amber-900 font-bold text-sm shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                                    {(user?.name || 'U').charAt(0)}
                                </div>
                            </button>

                            {/* Profile Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden z-50" onClick={e => e.stopPropagation()}>
                                    {/* Header */}
                                    <div className="bg-gradient-to-br from-amber-50 via-amber-50 to-stone-50 px-6 py-5 border-b border-stone-200">
                                        <p className="font-bold text-sm text-stone-900">{user?.name}</p>
                                        <p className="text-xs text-stone-500 mt-1 truncate">{user?.email}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                setView(user.isAdmin ? 'admin' : 'account');
                                                setIsProfileMenuOpen(false);
                                            }}
                                            className="w-full text-left px-6 py-3 hover:bg-gradient-to-r hover:from-amber-50 hover:to-transparent transition-colors duration-150 flex items-center gap-3 text-stone-700 hover:text-amber-700 font-medium text-sm"
                                        >
                                            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                                <User size={16} className="text-amber-700" />
                                            </div>
                                            {user.isAdmin ? 'Admin Dashboard' : 'My Account'}
                                        </button>

                                        {!user.isAdmin && (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        setView('cart');
                                                        setIsProfileMenuOpen(false);
                                                    }}
                                                    className="w-full text-left px-6 py-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-colors duration-150 flex items-center gap-3 text-stone-700 hover:text-blue-700 font-medium text-sm"
                                                >
                                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                                        <ShoppingCart size={16} className="text-blue-700" />
                                                    </div>
                                                    My Cart
                                                </button>

                                                <div className="h-px bg-stone-200 my-2"></div>
                                            </>
                                        )}

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsProfileMenuOpen(false);
                                            }}
                                            className="w-full text-left px-6 py-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-transparent transition-colors duration-150 flex items-center gap-3 text-red-600 hover:text-red-700 font-medium text-sm"
                                        >
                                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                                <LogOut size={16} className="text-red-700" />
                                            </div>
                                            Sign Out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : <button onClick={() => setView('login')} className="p-2 hover:bg-amber-50 rounded-lg text-stone-600 hover:text-amber-700 transition-colors"><User size={18} /></button>}

                    {/* Cart - Hidden for Admin */}
                    {!user?.isAdmin && (
                        <button className="relative p-2 hover:bg-amber-50 rounded-lg transition-colors text-stone-700 hover:text-amber-700" onClick={() => setView('cart')}>
                            <ShoppingCart size={18} />
                            <Badge>{cart.length}</Badge>
                        </button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden p-2 hover:bg-amber-50 rounded-lg transition-colors text-stone-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            <main className="w-full px-6 md:px-12 py-8 min-h-[calc(100vh-300px)]">
                {view === 'home' && (
                    <>
                        {/* Enhanced Hero Section */}
                        <div className="relative bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 text-white rounded-3xl overflow-hidden mb-16 min-h-[520px] flex items-center w-full shadow-2xl group">
                            {banners.map((slide, index) => (
                                <div key={slide.id || index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                                    {/* Enhanced overlay with gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent z-10"></div>
                                    <img src={slide.image} alt="Hero" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />

                                    {/* Enhanced content */}
                                    <div className="absolute z-20 inset-0 flex flex-col justify-center px-8 md:px-20 text-left">
                                        <div className="max-w-2xl">
                                            <span className={`${slide.color || 'text-amber-300'} font-bold tracking-widest uppercase mb-3 block text-sm animate-slide-up`}>{slide.subtitle}</span>
                                            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 leading-tight animate-slide-up" style={{ animationDelay: '0.1s' }}>
                                                {slide.title}
                                            </h1>
                                            <p className="text-amber-100 text-lg md:text-xl mb-10 max-w-xl leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                                                {slide.desc}
                                            </p>
                                            <div className="flex gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                                                <Button onClick={scrollToProducts} className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                                                    Shop Now
                                                </Button>
                                                <button onClick={scrollToProducts} className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-all duration-200">
                                                    Explore
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Enhanced navigation buttons */}
                            <button
                                onClick={prevSlide}
                                className="absolute left-6 z-30 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white border border-white/30 transition-all duration-200 hover:scale-110 transform"
                            >
                                <ChevronLeft size={28} />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="absolute right-6 z-30 p-3 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white border border-white/30 transition-all duration-200 hover:scale-110 transform"
                            >
                                <ChevronRight size={28} />
                            </button>

                            {/* Slide indicators */}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30 flex gap-2">
                                {banners.map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentSlide(i)}
                                        className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide
                                            ? 'bg-amber-400 w-8'
                                            : 'bg-white/50 w-2 hover:bg-white/70'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex flex-col lg:flex-row gap-8">
                                {/* Sidebar Filters */}
                                <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 lg:shadow-none lg:bg-transparent ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                                    <div className="h-full overflow-y-auto p-6 lg:p-0">
                                        <div className="flex justify-between items-center lg:hidden mb-6">
                                            <h3 className="text-xl font-bold text-stone-900">Filters</h3>
                                            <button onClick={() => setIsFilterOpen(false)}><X /></button>
                                        </div>

                                        {/* Categories */}
                                        <div className="mb-8">
                                            <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2"><Layers size={18} /> Categories</h4>
                                            <div className="space-y-2">
                                                <button onClick={() => {
                                                    const newFilters = { ...filters, category: 'All' };
                                                    setFilters(newFilters);
                                                    fetchProducts(1, false, newFilters);
                                                }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === 'All' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-stone-600 hover:bg-stone-100'}`}>
                                                    All Categories
                                                </button>
                                                {Object.keys(CATEGORY_HIERARCHY).map(cat => (
                                                    <button key={cat} onClick={() => {
                                                        const newFilters = { ...filters, category: cat };
                                                        setFilters(newFilters);
                                                        fetchProducts(1, false, newFilters);
                                                    }} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat ? 'bg-amber-100 text-amber-800 font-bold' : 'text-stone-600 hover:bg-stone-100'}`}>
                                                        {cat}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price Filter */}
                                        <div className="mb-8">
                                            <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2"><Filter size={18} /> Price Range</h4>
                                            <div className="grid grid-cols-2 gap-2 mb-3">
                                                <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" value={filters.minPrice} onChange={e => setFilters({ ...filters, minPrice: e.target.value })} />
                                                <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" value={filters.maxPrice} onChange={e => setFilters({ ...filters, maxPrice: e.target.value })} />
                                            </div>
                                            <Button onClick={() => fetchProducts(1)} className="w-full text-sm py-2">Apply</Button>
                                        </div>
                                    </div>
                                </aside>

                                {/* Main Content */}
                                <div className="flex-1" ref={productsSectionRef}>
                                    {/* Section Header & Sort */}
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-stone-100 pb-6">
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2 relative inline-block">
                                                Explore Collection
                                                {/* Decorative underline */}
                                                <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-amber-500 rounded-full"></span>
                                            </h2>
                                            <p className="text-stone-600 mt-3 font-medium">Found {products.length} premium items</p>
                                        </div>

                                        <div className="flex gap-3 w-full md:w-auto">
                                            <button onClick={() => setIsFilterOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg bg-white text-stone-700 font-medium hover:bg-stone-50">
                                                <Filter size={18} /> Filters
                                            </button>

                                            <div className="relative flex-1 md:flex-none">
                                                <select
                                                    className="w-full md:w-48 appearance-none bg-white border border-stone-200 text-stone-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-amber-500"
                                                    value={filters.sort}
                                                    onChange={(e) => {
                                                        const newFilters = { ...filters, sort: e.target.value };
                                                        setFilters(newFilters);
                                                        fetchProducts(1, false, newFilters);
                                                    }}
                                                >
                                                    <option value="newest">Newest First</option>
                                                    <option value="price-asc">Price: Low to High</option>
                                                    <option value="price-desc">Price: High to Low</option>
                                                    <option value="rating">Top Rated</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-700">
                                                    <ChevronDown size={14} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {productsLoading ? (
                                        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto" /> Loading Products...</div>
                                    ) : products.length === 0 ? (
                                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                                            <Package size={48} className="mx-auto text-stone-300 mb-4" />
                                            <h3 className="text-xl font-bold text-stone-500">No Products Found</h3>
                                            <p className="text-stone-400">Try adjusting your filters or checking back later.</p>
                                            <button
                                                onClick={() => { setFilters({ category: 'All', minPrice: '', maxPrice: '', sort: 'newest' }); fetchProducts(1); }}
                                                className="mt-4 text-amber-700 font-bold hover:underline"
                                            >
                                                Clear All Filters
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                                {products.map((p, index) => {
                                                    const isSoldOut = p.countInStock === 0;
                                                    return (
                                                        <div
                                                            key={p._id || p.id}
                                                            className="group flex flex-col bg-white rounded-2xl border border-stone-200 overflow-hidden hover:border-amber-200 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 animate-fade-in-up"
                                                            style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
                                                        >
                                                            {/* Image Container */}
                                                            <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-br from-stone-100 to-stone-50 h-56 md:h-64 cursor-pointer" onClick={() => setSelectedProduct(p)}>
                                                                <img
                                                                    src={p.image}
                                                                    alt={p.name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                                                                />

                                                                {/* Overlay */}
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                                                                    <div className="text-white text-sm font-bold backdrop-blur-md bg-black/50 px-4 py-2 rounded-lg">View Details</div>
                                                                </div>

                                                                {/* Stock Badge */}
                                                                {isSoldOut ? (
                                                                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">SOLD OUT</div>
                                                                ) : p.countInStock < 5 ? (
                                                                    <div className="absolute top-3 right-3 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse">Low Stock</div>
                                                                ) : null}

                                                                {/* Category Badge */}
                                                                <div className="absolute top-3 left-3 bg-amber-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold">
                                                                    {p.mainCategory || p.category}
                                                                </div>
                                                            </div>

                                                            {/* Content Container */}
                                                            <div className="flex-1 flex flex-col p-5 md:p-6">
                                                                {/* Title */}
                                                                <h3 className="font-bold text-sm md:text-base text-stone-900 mb-2 line-clamp-2 group-hover:text-amber-700 transition-colors duration-200">
                                                                    {p.name}
                                                                </h3>

                                                                {/* Rating */}
                                                                <div className="flex items-center gap-1 mb-4">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <Star key={i} size={14} className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-stone-300'} />
                                                                    ))}
                                                                    <span className="text-xs text-stone-500 ml-1">(42)</span>
                                                                </div>

                                                                {/* Price Section */}
                                                                <div className="mb-5">
                                                                    <div className="flex items-baseline gap-2">
                                                                        <span className="text-lg md:text-xl font-bold text-amber-700">₹{p.price}</span>
                                                                        {p.originalPrice && p.originalPrice > p.price && (
                                                                            <>
                                                                                <span className="text-sm text-stone-400 line-through">₹{p.originalPrice}</span>
                                                                                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                                                                                    {Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}% OFF
                                                                                </span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>

                                                                {/* Spacer */}
                                                                <div className="flex-1"></div>

                                                                {/* Action Buttons */}
                                                                <div className="flex gap-2">
                                                                    {isSoldOut ? (
                                                                        <button
                                                                            onClick={() => handleNotifyMe(p)}
                                                                            className="flex-1 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 transition-colors duration-200 text-sm font-semibold flex items-center justify-center gap-2"
                                                                        >
                                                                            <Bell size={16} /> Notify
                                                                        </button>
                                                                    ) : (
                                                                        <>
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    addToCart(p);
                                                                                }}
                                                                                disabled={addingToCart[p._id || p.id] || isSoldOut}
                                                                                aria-label={`Add ${p.name} to cart`}
                                                                                className={`
                                                            flex-1 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 text-sm
                                                            ${addingToCart[p._id || p.id]
                                                                                        ? 'bg-green-600 text-white shadow-lg'
                                                                                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg active:scale-95'
                                                                                    }
                                                            disabled:opacity-50
                                                        `}
                                                                            >
                                                                                {addingToCart[p._id || p.id] ? (
                                                                                    <>
                                                                                        <CheckCircle size={16} className="animate-checkmark" />
                                                                                        <span className="animate-fade-in-up">Added!</span>
                                                                                    </>
                                                                                ) : (
                                                                                    <>
                                                                                        <ShoppingCart size={16} />
                                                                                        <span className="hidden sm:inline">Add</span>
                                                                                    </>
                                                                                )}
                                                                            </button>
                                                                            <button
                                                                                onClick={() => setSelectedProduct(p)}
                                                                                className="px-3 py-2.5 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 transition-colors duration-200 font-semibold text-sm"
                                                                            >
                                                                                <Eye size={16} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>

                                            {page < totalPages && (
                                                <div className="mt-12 text-center">
                                                    <Button variant="secondary" onClick={loadMore} disabled={productsLoading}>
                                                        {productsLoading ? <Loader2 className="animate-spin" /> : "Load More Products"}
                                                    </Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
                {view === 'cart' && (
                    <div className="max-w-6xl mx-auto py-8 px-4">
                        <h1 className="text-4xl font-serif font-bold mb-2 text-stone-900">Shopping Cart</h1>
                        <p className="text-stone-500 mb-8">{cart.length} {cart.length === 1 ? 'item' : 'items'} in your cart</p>

                        {cart.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-2xl border border-stone-100 shadow-sm">
                                <ShoppingCart size={64} className="mx-auto text-stone-300 mb-4" />
                                <h3 className="text-2xl font-bold text-stone-800 mb-2">Your Cart is Empty</h3>
                                <p className="text-stone-500 mb-8">Start shopping to add items to your cart</p>
                                <Button onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mx-auto">
                                    <ArrowRight size={16} /> Continue Shopping
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Cart Items - Left Column */}
                                <div className="lg:col-span-2">
                                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                                        <div className="space-y-1 divide-y divide-stone-100">
                                            {cart.map((item, index) => (
                                                <div
                                                    key={item._id || item.id}
                                                    className="p-6 hover:bg-stone-50 transition-colors duration-200 group animate-fade-in-up"
                                                    style={{ animationDelay: `${index * 0.05}s` }}
                                                >
                                                    <div className="flex gap-6">
                                                        {/* Product Image */}
                                                        <div className="relative flex-shrink-0">
                                                            <img
                                                                src={item.image}
                                                                alt={item.name}
                                                                className="w-24 h-24 object-cover rounded-xl bg-stone-100 shadow-sm"
                                                                onError={(e) => { e.target.src = 'https://via.placeholder.com/96?text=No+Image'; }}
                                                            />
                                                            <div className="absolute -top-2 -right-2 bg-amber-700 text-white rounded-full min-w-[28px] h-7 flex items-center justify-center text-xs font-bold shadow-md">
                                                                {item.quantity}
                                                            </div>
                                                        </div>

                                                        {/* Product Details */}
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="text-lg font-bold text-stone-900 truncate mb-1">{item.name}</h3>
                                                            <p className="text-stone-500 text-sm mb-3">{item.category || 'Product'}</p>

                                                            {/* Price and Subtotal */}
                                                            <div className="flex items-baseline gap-2 mb-4">
                                                                <span className="text-xl font-bold text-amber-700">₹{item.price}</span>
                                                                <span className="text-sm text-stone-500">each</span>
                                                                <span className="ml-auto text-lg font-bold text-stone-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                                            </div>

                                                            {/* Quantity Controls & Delete */}
                                                            <div className="flex items-center gap-4">
                                                                {/* Quantity Selector */}
                                                                <div className="flex items-center gap-0 bg-stone-100 rounded-lg p-1 border border-stone-200">
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id || item._id, -1)}
                                                                        className="p-1.5 hover:bg-white rounded transition-colors duration-200"
                                                                        title="Decrease quantity"
                                                                    >
                                                                        <Minus size={16} className="text-stone-600" />
                                                                    </button>
                                                                    <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                                                                    <button
                                                                        onClick={() => updateQuantity(item.id || item._id, 1)}
                                                                        className="p-1.5 hover:bg-white rounded transition-colors duration-200"
                                                                        title="Increase quantity"
                                                                    >
                                                                        <Plus size={16} className="text-stone-600" />
                                                                    </button>
                                                                </div>

                                                                {/* Delete Button */}
                                                                <button
                                                                    onClick={() => removeFromCart(item.id || item._id)}
                                                                    className="ml-auto text-stone-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-all duration-200"
                                                                    title="Remove from cart"
                                                                >
                                                                    <Trash2 size={20} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Continue Shopping */}
                                    <button
                                        onClick={() => { setView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                                        className="mt-6 flex items-center gap-2 text-amber-700 hover:text-amber-800 font-semibold transition-colors duration-200"
                                    >
                                        <ChevronLeft size={18} /> Continue Shopping
                                    </button>
                                </div>

                                {/* Order Summary - Right Column */}
                                <div className="lg:col-span-1">
                                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 sticky top-24 h-fit">
                                        <h3 className="text-lg font-bold text-stone-900 mb-6">Order Summary</h3>

                                        {/* Price Breakdown */}
                                        <div className="space-y-4 mb-6">
                                            <div className="flex justify-between text-stone-600">
                                                <span>Subtotal</span>
                                                <span className="font-semibold">₹{cart.reduce((acc, item) => acc + (item.price * item.quantity), 0).toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-stone-600">
                                                <span>Shipping</span>
                                                <span className="font-semibold text-green-600">FREE</span>
                                            </div>
                                            <div className="flex justify-between text-stone-600 border-t border-stone-100 pt-4">
                                                <span className="font-semibold">Tax (est.)</span>
                                                <span className="font-semibold">₹{Math.round(cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 0.18).toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>

                                        {/* Total */}
                                        <div className="flex justify-between items-center text-2xl font-bold text-stone-900 mb-6 bg-stone-50 p-4 rounded-lg">
                                            <span>Total</span>
                                            <span className="text-amber-700">₹{(cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) + Math.round(cart.reduce((acc, item) => acc + (item.price * item.quantity), 0) * 0.18)).toLocaleString('en-IN')}</span>
                                        </div>

                                        {/* Checkout Button */}
                                        <Button
                                            onClick={handleCheckout}
                                            disabled={cart.length === 0 || isLoading}
                                            className="w-full bg-amber-700 hover:bg-amber-800 text-white shadow-lg hover:shadow-xl mb-4"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={18} />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    Proceed to Checkout
                                                    <ArrowRight size={18} />
                                                </>
                                            )}
                                        </Button>

                                        {/* Security Badge */}
                                        <div className="flex items-center justify-center gap-2 text-xs text-stone-500 bg-stone-50 p-3 rounded-lg">
                                            <Lock size={14} />
                                            Secure checkout powered by Razorpay
                                        </div>

                                        {/* Promo Code */}
                                        <div className="mt-6 pt-6 border-t border-stone-100">
                                            <p className="text-xs text-stone-500 mb-2">Have a promo code?</p>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Enter code"
                                                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm focus:border-amber-500 focus:outline-none"
                                                />
                                                <Button variant="secondary" className="px-4">Apply</Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {view === 'admin' && renderAdmin()}
                {view === 'account' && (
                    <div className="max-w-7xl mx-auto py-12 px-4">
                        <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">My Account</h1>
                        <p className="text-stone-500 mb-12">Manage your profile, addresses, and orders</p>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Sidebar - Profile Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden sticky top-24">
                                    <div className="h-24 bg-gradient-to-r from-amber-600 to-amber-700"></div>
                                    <div className="p-6 -mt-12 relative z-10">
                                        <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-4">
                                            {(user?.name || 'U').charAt(0)}
                                        </div>
                                        <h3 className="font-bold text-lg text-stone-900 text-center">{user?.name}</h3>
                                        <p className="text-sm text-stone-500 text-center mb-6">{user?.email}</p>
                                        <div className="space-y-2 text-sm text-stone-600 mb-6">
                                            <p><strong>Phone:</strong> {user?.phone}</p>
                                            <p><strong>Member Since:</strong> 2024</p>
                                        </div>
                                        <Button variant="danger" onClick={handleLogout} className="w-full">
                                            <LogOut size={16} /> Sign Out
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="lg:col-span-3">
                                {/* Tab Navigation */}
                                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                                    {[
                                        { id: 'profile', label: 'Profile', icon: User },
                                        { id: 'addresses', label: 'Addresses', icon: MapPin },
                                        { id: 'orders', label: 'Orders', icon: Package },
                                        { id: 'wishlist', label: 'Wishlist', icon: Heart }
                                    ].map(tab => {
                                        const Icon = tab.icon;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => setActiveTab(tab.id)}
                                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${activeTab === tab.id
                                                    ? 'bg-amber-700 text-white shadow-lg'
                                                    : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300'
                                                    }`}
                                            >
                                                <Icon size={18} />
                                                {tab.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Tab Content */}
                                <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
                                    {/* Profile Tab */}
                                    {activeTab === 'profile' && (
                                        <div className="space-y-6">
                                            <h3 className="text-xl font-bold text-stone-900">Edit Profile</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                                                    <input placeholder="Your name" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" value={editProfileForm.name} onChange={e => setEditProfileForm({ ...editProfileForm, name: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-stone-700 mb-2">Phone Number</label>
                                                    <input placeholder="Your phone" className="w-full px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" value={editProfileForm.phone} onChange={e => setEditProfileForm({ ...editProfileForm, phone: e.target.value })} />
                                                </div>
                                            </div>
                                            <Button className="bg-amber-700 hover:bg-amber-800 text-white">Save Changes</Button>
                                        </div>
                                    )}

                                    {/* Addresses Tab */}
                                    {activeTab === 'addresses' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-stone-900 mb-4">Saved Addresses</h3>
                                                {user?.addresses && user.addresses.length > 0 ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                        {user.addresses.map((addr, i) => (
                                                            <div key={i} className="p-4 border border-stone-200 rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors">
                                                                <p className="font-semibold text-stone-900">{addr.street}</p>
                                                                <p className="text-sm text-stone-600">{addr.city}, {addr.state} {addr.zip}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-stone-500 mb-6">No saved addresses yet</p>
                                                )}
                                            </div>

                                            {/* Add New Address */}
                                            <div className="border-t pt-6">
                                                <h4 className="font-bold text-stone-900 mb-4">Add New Address</h4>
                                                <form onSubmit={handleAddAddress} className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <input placeholder="Street Address" className="px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} required />
                                                        <input placeholder="City" className="px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                                        <input placeholder="State" className="px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                                                        <input placeholder="ZIP Code" className="px-4 py-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500" value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} required />
                                                    </div>
                                                    <Button className="bg-amber-700 hover:bg-amber-800 text-white">
                                                        <Plus size={16} /> Save Address
                                                    </Button>
                                                </form>
                                            </div>
                                        </div>
                                    )}

                                    {/* Orders Tab */}
                                    {activeTab === 'orders' && (
                                        <div>
                                            <h3 className="text-xl font-bold text-stone-900 mb-6">Your Orders</h3>
                                            {userOrders && userOrders.length > 0 ? (
                                                <div className="space-y-4">
                                                    {userOrders.map(order => (
                                                        <div key={order._id} className="p-6 border border-stone-200 rounded-2xl hover:shadow-md transition-shadow">
                                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                                                <div>
                                                                    <p className="text-xs text-stone-500 uppercase font-bold">Order ID</p>
                                                                    <p className="font-mono text-sm text-stone-900">#{order._id}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-stone-500 uppercase font-bold">Date</p>
                                                                    <p className="text-sm text-stone-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-stone-500 uppercase font-bold">Total</p>
                                                                    <p className="font-bold text-amber-700">₹{order.itemsPrice}</p>
                                                                </div>
                                                                <div>
                                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                                                                        {order.orderStatus.toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-2">
                                                                {order.orderItems.map((item, idx) => (
                                                                    <div key={idx} className="flex items-center gap-3 text-sm text-stone-600">
                                                                        <div className="w-2 h-2 rounded-full bg-stone-300"></div>
                                                                        <span>{item.name} <span className="text-stone-400">x{item.quantity}</span></span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                                                    <Package size={40} className="mx-auto text-stone-300 mb-3" />
                                                    <p className="text-stone-600 font-medium">No orders yet</p>
                                                    <p className="text-stone-500 text-sm mt-1">Start shopping to see your orders here</p>
                                                    <Button onClick={() => setView('home')} className="mt-4 bg-amber-700 hover:bg-amber-800 text-white">
                                                        Continue Shopping
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Wishlist Tab */}
                                    {activeTab === 'wishlist' && (
                                        <div>
                                            <h3 className="text-xl font-bold text-stone-900 mb-6">Your Wishlist</h3>
                                            {wishlist.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {products.filter(p => wishlist.includes(p._id)).map(p => (
                                                        <div key={p._id} className="flex gap-4 p-4 border border-stone-200 rounded-xl bg-white hover:shadow-md transition-all">
                                                            <img src={p.image} alt={p.name} className="w-24 h-24 object-cover rounded-lg" />
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-stone-900 line-clamp-1">{p.name}</h4>
                                                                <p className="text-amber-700 font-bold mb-2">₹{p.price}</p>
                                                                <div className="flex gap-2">
                                                                    <Button onClick={() => addToCart(p)} className="flex-1 text-xs py-2">Add to Cart</Button>
                                                                    <button onClick={() => toggleWishlist(p)} className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 text-red-500">
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 bg-stone-50 rounded-lg border border-dashed border-stone-200">
                                                    <Heart size={40} className="mx-auto text-stone-300 mb-3" />
                                                    <p className="text-stone-600 font-medium">Your wishlist is empty</p>
                                                    <Button onClick={() => setView('home')} className="mt-4 bg-amber-700 hover:bg-amber-800 text-white">
                                                        Find Items
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {(view === 'login' || view === 'register') && renderUserAuth()}
                {view === 'staff-login' && renderStaffLogin()}
                {view === 'worker-dashboard' && renderWorkerDashboard()}
            </main>

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in-up" onClick={() => setSelectedProduct(null)}>
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        {/* Image Section */}
                        <div className="relative h-80 bg-gradient-to-br from-amber-50 to-stone-100 overflow-hidden">
                            <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" onError={(e) => { e.target.src = 'https://via.placeholder.com/500?text=No+Image'; }} />
                            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all z-10">
                                <X size={24} className="text-stone-700" />
                            </button>
                            {selectedProduct.countInStock === 0 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold text-lg">OUT OF STOCK</span>
                                </div>
                            )}
                        </div>

                        {/* Details Section */}
                        <div className="p-8">
                            {/* Category Badge */}
                            <div className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold mb-4 uppercase tracking-wide">
                                {selectedProduct.mainCategory || selectedProduct.category}
                            </div>

                            {/* Title */}
                            <h2 className="text-3xl font-bold text-stone-900 mb-2">{selectedProduct.name}</h2>

                            {/* Rating */}
                            <div className="flex items-center gap-2 mb-6">
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={18} className={i < 4 ? 'fill-amber-400 text-amber-400' : 'text-stone-300'} />
                                    ))}
                                </div>
                                <span className="text-sm text-stone-600">(124 reviews)</span>
                            </div>

                            {/* Price Section */}
                            <div className="flex items-baseline gap-3 mb-6">
                                <span className="text-4xl font-bold text-amber-700">₹{selectedProduct.price}</span>
                                {selectedProduct.originalPrice && selectedProduct.originalPrice > selectedProduct.price && (
                                    <>
                                        <span className="text-xl text-stone-400 line-through">₹{selectedProduct.originalPrice}</span>
                                        <span className="text-lg font-bold text-green-600">{Math.round(((selectedProduct.originalPrice - selectedProduct.price) / selectedProduct.originalPrice) * 100)}% OFF</span>
                                    </>
                                )}
                            </div>

                            {/* Stock Info */}
                            <div className="mb-6 p-4 bg-amber-50/50 border border-amber-100 rounded-lg">
                                <p className="text-sm text-stone-700">
                                    <strong>In Stock:</strong> {selectedProduct.countInStock > 0 ? `${selectedProduct.countInStock} items available` : 'Out of Stock'}
                                </p>
                            </div>

                            {/* Description */}
                            {selectedProduct.description && (
                                <div className="mb-8">
                                    <h3 className="font-bold text-lg text-stone-900 mb-3">Description</h3>
                                    <p className="text-stone-700 leading-relaxed">{selectedProduct.description}</p>
                                </div>
                            )}

                            {/* Product Details Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-stone-50 rounded-xl">
                                <div>
                                    <p className="text-xs text-stone-500 uppercase font-bold mb-1">Category</p>
                                    <p className="text-stone-900 font-semibold">{selectedProduct.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-stone-500 uppercase font-bold mb-1">Stock Status</p>
                                    <p className={`font-semibold ${selectedProduct.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedProduct.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </p>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        if (selectedProduct.countInStock > 0) {
                                            addToCart(selectedProduct);
                                            setSelectedProduct(null);
                                        }
                                    }}
                                    disabled={selectedProduct.countInStock === 0}
                                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${selectedProduct.countInStock > 0
                                        ? 'bg-amber-700 text-white hover:bg-amber-800 active:scale-95 shadow-lg'
                                        : 'bg-stone-300 text-stone-600 cursor-not-allowed'
                                        }`}
                                >
                                    <ShoppingCart size={20} />
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedProduct.countInStock > 0) {
                                            addToCart(selectedProduct);
                                            setView('cart');
                                            setSelectedProduct(null);
                                        }
                                    }}
                                    disabled={selectedProduct.countInStock === 0}
                                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all border-2 ${selectedProduct.countInStock > 0
                                        ? 'border-amber-700 text-amber-700 hover:bg-amber-50 active:scale-95'
                                        : 'border-stone-300 text-stone-400 cursor-not-allowed'
                                        }`}
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Reviews Section */}
                            <div className="mb-12 border-t pt-8">
                                <h3 className="text-xl font-bold text-stone-900 mb-6">Customer Reviews</h3>
                                <div className="space-y-6">
                                    {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                                        selectedProduct.reviews.map((review, i) => (
                                            <div key={i} className="bg-stone-50 p-4 rounded-xl">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="flex text-amber-500">
                                                        {[...Array(5)].map((_, r) => (
                                                            <Star key={r} size={14} className={r < review.rating ? "fill-current" : "text-stone-300"} />
                                                        ))}
                                                    </div>
                                                    <span className="font-bold text-sm text-stone-900">{review.name}</span>
                                                    <span className="text-xs text-stone-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-stone-700 text-sm">{review.comment}</p>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-stone-500 italic">No reviews yet.</p>
                                    )}
                                </div>
                                {/* Write Review Form could go here */}
                            </div>

                            {/* Related Products Section */}
                            {relatedProducts.length > 0 && (
                                <div className="mb-8 border-t pt-8">
                                    <h3 className="text-xl font-bold text-stone-900 mb-6">You Might Also Like</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {relatedProducts.map(rp => (
                                            <div key={rp._id || rp.id} onClick={() => { setSelectedProduct(rp); fetchRelatedProducts(rp._id || rp.id); }} className="cursor-pointer group flex gap-4 p-3 rounded-xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all">
                                                <img src={rp.image} alt={rp.name} className="w-20 h-20 object-cover rounded-lg" />
                                                <div>
                                                    <h4 className="font-bold text-sm text-stone-900 group-hover:text-amber-700 line-clamp-2 mb-1">{rp.name}</h4>
                                                    <p className="font-bold text-amber-700">₹{rp.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-4 sticky bottom-0 bg-white p-4 border-t border-stone-100 -mx-8 -mb-8 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                                <button
                                    onClick={() => toggleWishlist(selectedProduct)}
                                    className={`p-3 rounded-xl border-2 transition-all ${wishlist.includes(selectedProduct._id || selectedProduct.id) ? 'border-red-200 bg-red-50 text-red-500' : 'border-stone-200 text-stone-400 hover:text-red-500 hover:border-red-200'}`}
                                >
                                    <Heart size={24} className={wishlist.includes(selectedProduct._id || selectedProduct.id) ? "fill-current" : ""} />
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedProduct.countInStock > 0) {
                                            addToCart(selectedProduct);
                                            setSelectedProduct(null);
                                        }
                                    }}
                                    disabled={selectedProduct.countInStock === 0}
                                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${selectedProduct.countInStock > 0
                                        ? 'bg-amber-700 text-white hover:bg-amber-800 active:scale-95 shadow-lg'
                                        : 'bg-stone-300 text-stone-600 cursor-not-allowed'
                                        }`}
                                >
                                    <ShoppingCart size={20} />
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => {
                                        if (selectedProduct.countInStock > 0) {
                                            addToCart(selectedProduct);
                                            setView('cart');
                                            setSelectedProduct(null);
                                        }
                                    }}
                                    disabled={selectedProduct.countInStock === 0}
                                    className={`flex-1 py-3 px-6 rounded-xl font-bold text-lg transition-all border-2 ${selectedProduct.countInStock > 0
                                        ? 'border-amber-700 text-amber-700 hover:bg-amber-50 active:scale-95'
                                        : 'border-stone-300 text-stone-400 cursor-not-allowed'
                                        }`}
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedProduct(null)}
                                className="w-full mt-4 py-2 text-stone-600 hover:text-stone-900 font-semibold transition-colors"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="bg-gradient-to-b from-stone-900 to-black text-stone-300 mt-24 pt-20 pb-8 w-full">
                <div className="w-full px-6 md:px-12">
                    <div className="max-w-7xl mx-auto">
                        {/* Main Footer Content */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                            {/* Brand */}
                            <div>
                                <div className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2 mb-4">
                                    <div className="w-10 h-10 bg-amber-700 rounded-lg flex items-center justify-center">
                                        <span className="font-sans font-black text-xs text-white">SG</span>
                                    </div>
                                    Shri Ganpati
                                </div>
                                <p className="text-stone-400 leading-relaxed text-sm">Premium photo frames, religious wall art, and custom framing solutions for every occasion.</p>
                                <div className="flex gap-4 mt-6">
                                    {[...Array(3)].map((_, i) => (
                                        <button key={i} className="w-10 h-10 rounded-full bg-stone-800 hover:bg-amber-700 transition-colors flex items-center justify-center text-stone-300 hover:text-white">
                                            <span className="text-lg">◆</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Collections */}
                            <div>
                                <h4 className="font-bold text-white mb-6">Collections</h4>
                                <ul className="space-y-3 text-stone-400 text-sm">
                                    <li><button onClick={() => { handleMainCategorySelect("Posters"); setView("home"); }} className="hover:text-amber-500 transition-colors font-medium">Posters</button></li>
                                    <li><button onClick={() => { handleMainCategorySelect("Frames"); setView("home"); }} className="hover:text-amber-500 transition-colors font-medium">Frames</button></li>
                                    <li><button onClick={() => { handleMainCategorySelect("Pure Tanjore Work"); setView("home"); }} className="hover:text-amber-500 transition-colors font-medium">Tanjore Art</button></li>
                                    <li><button onClick={() => { handleMainCategorySelect("MDF Cutouts"); setView("home"); }} className="hover:text-amber-500 transition-colors font-medium">MDF Cutouts</button></li>
                                </ul>
                            </div>

                            {/* Support */}
                            <div>
                                <h4 className="font-bold text-white mb-6">Support</h4>
                                <ul className="space-y-3 text-stone-400 text-sm">
                                    <li><button className="hover:text-amber-500 transition-colors font-medium">Track Order</button></li>
                                    <li><button className="hover:text-amber-500 transition-colors font-medium">Shipping Info</button></li>
                                    <li><button className="hover:text-amber-500 transition-colors font-medium">Returns & Exchange</button></li>
                                    <li><button className="hover:text-amber-500 transition-colors font-medium">Contact Us</button></li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h4 className="font-bold text-white mb-6">Get in Touch</h4>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start gap-3">
                                        <Phone size={16} className="text-amber-500 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-stone-300">+91 XXXX XXX XXX</p>
                                            <p className="text-stone-500 text-xs">Available 10 AM - 6 PM</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin size={16} className="text-amber-500 mt-1 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-stone-300">Mumbai, India</p>
                                            <p className="text-stone-500 text-xs">Serving across India</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="border-t border-stone-800 py-8">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <p className="text-sm text-stone-500">© 2026 Shri Ganpati. All rights reserved.</p>
                                <div className="flex items-center gap-6 text-sm">
                                    <button className="text-stone-400 hover:text-amber-500 transition-colors">Privacy Policy</button>
                                    <button className="text-stone-400 hover:text-amber-500 transition-colors">Terms of Service</button>
                                    <div className="relative" data-staff-menu>
                                        <button
                                            onClick={() => setIsStaffMenuOpen(!isStaffMenuOpen)}
                                            className="text-stone-400 hover:text-amber-500 transition-colors flex items-center gap-1 opacity-50 hover:opacity-100"
                                        >
                                            <Lock size={14} /> Staff
                                        </button>
                                        {isStaffMenuOpen && (
                                            <div className="absolute bottom-full right-0 mb-2 w-40 bg-stone-800 border border-stone-700 rounded-lg shadow-xl z-50">
                                                <button
                                                    onClick={() => { setView('staff-login'); setIsStaffMenuOpen(false); }}
                                                    className="w-full text-left px-4 py-3 hover:bg-stone-700 text-stone-300 hover:text-amber-500 transition-colors text-sm font-medium"
                                                >
                                                    🔐 Staff Login
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-md p-4 animate-fade-in-up" onClick={() => setIsCategoryModalOpen(false)}>
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="bg-gradient-to-r from-amber-600 to-amber-700 p-6 flex justify-between items-center">
                            <h3 className="text-2xl font-bold text-white">Shop by Category</h3>
                            <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={24} className="text-white" /></button>
                        </div>

                        {/* Categories */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="grid grid-cols-1 gap-2">
                                {Object.keys(CATEGORY_HIERARCHY).map((cat, i) => (
                                    <button
                                        key={cat}
                                        onClick={() => { handleMainCategorySelect(cat); }}
                                        className="flex justify-between items-center w-full p-4 hover:bg-amber-50 rounded-xl text-left transition-all duration-200 group border border-transparent hover:border-amber-200"
                                    >
                                        <div>
                                            <span className="font-bold text-stone-900 group-hover:text-amber-700 transition-colors">{cat}</span>
                                            <p className="text-sm text-stone-500 mt-0.5">{CATEGORY_HIERARCHY[cat].length} items</p>
                                        </div>
                                        <ChevronRight size={20} className="text-amber-600 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed top-20 left-0 right-0 bg-white border-b border-amber-100/30 shadow-xl z-30 animate-slide-down">
                    <div className="px-4 py-4 space-y-2">
                        <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); window.scrollTo({ top: 0 }); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-amber-50 font-medium text-stone-900 transition-colors">🏠 Home</button>
                        <button onClick={() => { setIsCategoryModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-amber-50 font-medium text-stone-900 transition-colors">📂 Categories</button>
                        {user ? <button onClick={() => { setView(user.isAdmin ? 'admin' : 'account'); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-amber-50 font-medium text-stone-900 transition-colors">{user.isAdmin ? '⚙️ Admin Dashboard' : '👤 My Account'}</button> : <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-amber-50 font-medium text-stone-900 transition-colors">🔐 Login</button>}
                    </div>
                </div>
            )}
        </div>
    );
}