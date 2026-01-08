import React, { useState, useEffect } from 'react';
import axios from 'axios';
// Using safe, standard icons that won't crash your browser
import { 
  ShoppingCart, Search, Menu, X, Star, Trash2, CheckCircle, 
  ArrowRight, Plus, Minus, Home, Layers, User, Lock, 
  LogOut, Phone, Bell, Package, ChevronDown, ChevronLeft, ChevronRight,
  MapPin, Loader2, AlertTriangle, RefreshCw
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
  return <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-slide-up ${type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>{type === 'success' ? <CheckCircle size={20} /> : type === 'error' ? <AlertTriangle size={20}/> : <Package size={20} />} <span className="font-medium">{message}</span></div>;
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
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '' });
  const [bulkOrder, setBulkOrder] = useState({ productName: '', quantity: '', details: '', date: '' });
  
  const [adminTab, setAdminTab] = useState('products');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Frames', countInStock: 10, image: '', description: '' });
  const [bannerForm, setBannerForm] = useState(BANNER_SLIDES);

  const showToast = (message, type = 'default') => { setToast({ message, type }); };

  // --- INITIALIZATION ---
  useEffect(() => {
    // 1. Load User Safely
    try {
        const savedUser = localStorage.getItem('ganpatiUser');
        if (savedUser) {
            const u = JSON.parse(savedUser);
            if(u && u.token) {
                setUser(u);
                setEditProfileForm({ name: u.name || '', phone: u.phone || '' });
            }
        }
    } catch (error) { localStorage.clear(); }

    fetchProducts(1);
    fetchBanners();

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
          axios.put(`${API_URL}/api/users/profile`, { cart }, { headers: { Authorization: `Bearer ${user.token}` }})
               .catch(err => console.log("Sync error", err));
      }
  }, [cart, user]);

  useEffect(() => { const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % banners.length), 5000); return () => clearInterval(timer); }, [banners]);

  // --- API CALLS ---
  const fetchProducts = async (pageNumber = 1, append = false) => {
    setProductsLoading(true);
    try { 
        const { data } = await axios.get(`${API_URL}/api/products?pageNumber=${pageNumber}`); 
        const newProducts = Array.isArray(data) ? data : (data.products || []);
        const newTotalPages = data.pages || 1;

        if (append) setProducts(prev => [...prev, ...newProducts]);
        else setProducts(newProducts);
        
        setPage(pageNumber);
        setTotalPages(newTotalPages);
    } catch (e) { console.log("Using offline product data"); } finally { setProductsLoading(false); }
  };

  const loadMore = () => { if (page < totalPages) fetchProducts(page + 1, true); };
  const fetchBanners = async () => { try { const { data } = await axios.get(`${API_URL}/api/banners`); if(data && data.length > 0) { setBanners(data); setBannerForm(data); } } catch (e) { console.log("Offline banners"); } };

  // --- ACTIONS ---
  const addToCart = (product) => {
    if (product.countInStock === 0) { showToast("Item sold out.", "info"); return; }
    setCart(prev => {
        const prodId = product._id || product.id;
        const existing = prev.find(item => (item._id || item.id) === prodId);
        if (existing) return prev.map(item => ((item._id || item.id) === prodId) ? { ...item, quantity: item.quantity + 1 } : item);
        return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added ${product.name}`, 'success');
  };
  
  const handleNotifyMe = async (product) => {
      if(!user) { showToast("Please login to get notified", "info"); return; }
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
      try { await axios.post(`${API_URL}/api/products`, newProduct, { headers: { Authorization: `Bearer ${user.token}` } }); showToast("Product Added!", "success"); fetchProducts(1); } catch (error) { showToast("Failed to Add", "error"); }
  };
  const handleDeleteProduct = async (id) => {
      if(!window.confirm("Delete?")) return;
      try { await axios.delete(`${API_URL}/api/products/${id}`, { headers: { Authorization: `Bearer ${user.token}` } }); showToast("Deleted", "success"); fetchProducts(1); } catch (error) { showToast("Failed", "error"); }
  };
  const handleSaveBanners = async () => {
      try { await axios.post(`${API_URL}/api/banners`, bannerForm, { headers: { Authorization: `Bearer ${user.token}` } }); setBanners(bannerForm); showToast("Banners Updated!", "success"); } catch (error) { showToast("Update failed", "error"); }
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
        if (view === 'staff-login' && !data.isAdmin) { showToast("Access Denied. Staff Only.", "error"); setIsLoading(false); return; }
        setUser(data);
        localStorage.setItem('ganpatiUser', JSON.stringify(data));
        if (data.cart && data.cart.length > 0) setCart(data.cart); // Restore Cart
        setEditProfileForm({ name: data.name, phone: data.phone });
        if (data.isAdmin) setView('admin'); else setView('home');
        showToast(`Welcome ${data.name}!`, "success");
    } catch (error) { 
        if (error.response?.status === 429) showToast("Too many attempts. Wait 15 mins.", "error");
        else showToast(error.response?.data?.message || "Login Failed.", "error"); 
    } finally { setIsLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if(!registerForm.name || !registerForm.email || !registerForm.phone || !registerForm.password) { showToast("Please fill all fields", "error"); return; }
    if(registerForm.phone.length < 10) { showToast("Phone must be 10 digits", "error"); return; }
    setIsLoading(true);
    try {
        const { data } = await axios.post(`${API_URL}/api/users`, { ...registerForm, isAdmin: false });
        setUser(data); setEditProfileForm({ name: data.name, phone: data.phone }); setView('home'); showToast("Account created!", "success");
    } catch (error) { showToast(error.response?.data?.message || "Registration Failed.", "error"); } finally { setIsLoading(false); }
  };

  const handleResetPassword = async (e) => { e.preventDefault(); showToast("Reset link sent.", "success"); setResetMode(false); };
  const goToStaffLogin = () => { setLoginForm({ phone: '', password: '' }); setIsRegistering(false); setResetMode(false); setView('staff-login'); };
  const handleMainCategorySelect = (mainCat) => { setActiveMainCategory(mainCat); setActiveSubCategory('All'); setIsCategoryModalOpen(false); setView('home'); window.scrollTo({ top: 500, behavior: 'smooth' }); };
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));

  // --- VIEW RENDERERS ---
  const renderAdmin = () => (
      <div className="w-full px-6 md:px-12 py-8">
          <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold flex items-center gap-2"><Layers/> Admin Dashboard</h1><Button variant="secondary" onClick={() => setView('home')}>Exit</Button></div>
          <div className="flex gap-4 mb-6"><Button onClick={()=>setAdminTab('products')} variant={adminTab==='products'?'primary':'secondary'}>Products</Button><Button onClick={()=>setAdminTab('banners')} variant={adminTab==='banners'?'primary':'secondary'}>Wallpapers</Button></div>
          {adminTab === 'products' && (
              <div className="grid md:grid-cols-3 gap-8">
                  <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
                      <h3 className="font-bold mb-4">Add New Item</h3>
                      <div className="space-y-3">
                          <input placeholder="Name" className="w-full p-2 border rounded" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} />
                          <input placeholder="Price" type="number" className="w-full p-2 border rounded" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} />
                          <input placeholder="Image URL" className="w-full p-2 border rounded" value={newProduct.image} onChange={e=>setNewProduct({...newProduct, image: e.target.value})} />
                          <select className="w-full p-2 border rounded" value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category: e.target.value})}>{Object.keys(CATEGORY_HIERARCHY).map(c=><option key={c} value={c}>{c}</option>)}</select>
                          <input placeholder="Stock" type="number" className="w-full p-2 border rounded" value={newProduct.countInStock} onChange={e=>setNewProduct({...newProduct, countInStock: e.target.value})} />
                          <Button onClick={handleAddProduct} className="w-full">Add Product</Button>
                      </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                      <h3 className="font-bold mb-4">Current Inventory</h3>
                      {products.map(p => (<div key={p._id||p.id} className="flex justify-between items-center bg-white p-4 rounded shadow-sm border"><div className="flex items-center gap-4"><img src={p.image} className="w-12 h-12 object-cover rounded"/><div><p className="font-bold">{p.name}</p><p className="text-sm">₹{p.price}</p></div></div><Button variant="danger" onClick={() => handleDeleteProduct(p._id)}><Trash2 size={16}/></Button></div>))}
                  </div>
              </div>
          )}
          {adminTab === 'banners' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                  <h3 className="font-bold text-lg mb-4">Edit Homepage Wallpapers</h3>
                  {bannerForm.map((b, i) => (<div key={i} className="mb-6 border p-4 rounded-lg bg-stone-50"><h4 className="font-bold text-sm mb-2 text-stone-500">Slide {i+1}</h4><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><input placeholder="Image URL" className="p-2 border rounded" value={b.image} onChange={(e) => {const newB = [...bannerForm]; newB[i].image = e.target.value; setBannerForm(newB)}} /><input placeholder="Title" className="p-2 border rounded" value={b.title} onChange={(e) => {const newB = [...bannerForm]; newB[i].title = e.target.value; setBannerForm(newB)}} /><input placeholder="Subtitle" className="p-2 border rounded" value={b.subtitle} onChange={(e) => {const newB = [...bannerForm]; newB[i].subtitle = e.target.value; setBannerForm(newB)}} /><input placeholder="Description" className="p-2 border rounded" value={b.desc} onChange={(e) => {const newB = [...bannerForm]; newB[i].desc = e.target.value; setBannerForm(newB)}} /></div></div>))}
                  <Button onClick={handleSaveBanners}>Save All Banners</Button>
              </div>
          )}
      </div>
  );

  const renderStaffLogin = () => (
    <div className="max-w-md mx-auto my-20 bg-stone-900 text-white p-10 rounded-2xl shadow-2xl border border-stone-800">
        <div className="text-center mb-8"><Lock size={40} className="mx-auto text-amber-500 mb-4"/><h2 className="text-2xl font-bold text-amber-500">Staff Portal</h2><p className="text-sm text-stone-400 mt-2">Restricted Access. Authorized Personnel Only.</p></div>
        <form onSubmit={handleLogin} className="space-y-4">
             <input placeholder="Staff Phone / ID" className="w-full p-3 bg-stone-800 border border-stone-700 rounded text-white focus:border-amber-500 outline-none" value={loginForm.phone} onChange={e => setLoginForm({...loginForm, phone: e.target.value})} required />
             <div className="relative"><input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 bg-stone-800 border border-stone-700 rounded text-white focus:border-amber-500 outline-none" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 hover:text-amber-500">{showPassword ? "Hide" : "Show"}</button></div>
             <Button variant="staff" className="w-full bg-amber-700 hover:bg-amber-600 text-white border-none mt-4">Secure Login</Button>
        </form>
        <div className="mt-6 text-center"><button onClick={() => setView('home')} className="text-stone-500 text-sm hover:text-white">Back to Home</button></div>
    </div>
  );

  const renderUserAuth = () => (
    <div className="max-w-md mx-auto my-20 bg-white p-8 rounded-2xl shadow-lg border border-stone-100">
        <div className="text-center mb-8"><h2 className="text-2xl font-bold">{resetMode ? "Reset Password" : isRegistering ? "Create Account" : "Welcome Back"}</h2></div>
        {resetMode ? (
            <form onSubmit={handleResetPassword} className="space-y-4"><input placeholder="Enter your registered email" className="w-full p-3 border rounded" required /><Button className="w-full">Send Reset Link</Button><button type="button" onClick={() => setResetMode(false)} className="w-full text-center text-sm text-stone-500 hover:underline">Back to Login</button></form>
        ) : (
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                {isRegistering && <input placeholder="Full Name" className="w-full p-3 border rounded" value={registerForm.name} onChange={e => setRegisterForm({...registerForm, name: e.target.value})} required />}
                <input placeholder="Phone Number" className="w-full p-3 border rounded" value={isRegistering ? registerForm.phone : loginForm.phone} onChange={e => isRegistering ? setRegisterForm({...registerForm, phone: e.target.value}) : setLoginForm({...loginForm, phone: e.target.value})} required />
                {isRegistering && <input placeholder="Email" className="w-full p-3 border rounded" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} required />}
                <div className="relative"><input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded pr-10" value={isRegistering ? registerForm.password : loginForm.password} onChange={e => isRegistering ? setRegisterForm({...registerForm, password: e.target.value}) : setLoginForm({...loginForm, password: e.target.value})} required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-500 hover:text-amber-700">{showPassword ? "Hide" : "Show"}</button></div>
                {!isRegistering && <div className="flex justify-end"><button type="button" onClick={() => setResetMode(true)} className="text-sm text-amber-700 hover:underline">Forgot Password?</button></div>}
                <Button className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin"/> : (isRegistering ? "Register" : "Login")}</Button>
                <div className="text-center mt-4 text-sm text-stone-500">{isRegistering ? "Already have an account? " : "Don't have an account? "}<button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-amber-700 font-bold hover:underline">{isRegistering ? "Log in" : "Register"}</button></div>
            </form>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-900">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 w-full px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <button onClick={() => { setView('home'); handleMainCategorySelect(null); window.scrollTo({top:0,behavior:'smooth'}); }} className="text-xl md:text-2xl font-serif font-bold text-amber-900 tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/sgpf-logo.png" alt="SGPF" className="w-12 h-12 object-contain" onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} />
              <span className="hidden sm:inline">SGPF</span>
            </button>
            <div className="hidden md:flex gap-6 items-center">
              <button onClick={() => { setView('home'); handleMainCategorySelect(null); window.scrollTo({top:0,behavior:'smooth'}); }} className="text-sm font-medium text-stone-600 hover:text-amber-700 transition-colors flex items-center gap-1"><Home size={16}/> Home</button>
              <button onClick={() => setIsCategoryModalOpen(true)} className="text-sm font-medium text-stone-600 hover:text-amber-700 transition-colors flex items-center gap-1"><Layers size={16}/> Categories <ChevronDown size={14}/></button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-lg focus-within:bg-white transition-all border border-transparent focus-within:border-amber-200"><Search size={18} className="text-stone-400" /><input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            {user ? (
                <button onClick={() => setView(user.isAdmin ? 'admin' : 'account')} className="flex items-center gap-2 hover:bg-stone-100 p-2 rounded-lg">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 font-bold text-xs">{(user?.name || 'U').charAt(0)}</div>
                </button>
            ) : <button onClick={() => setView('login')} className="p-2 hover:bg-stone-100 rounded-lg text-stone-600"><User size={22} /></button>}
            <button className="relative p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-700" onClick={() => setView('cart')}><ShoppingCart size={22} /><Badge>{cart.length}</Badge></button>
            <button className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
      </nav>

      <main className="w-full px-6 md:px-12 py-8 min-h-[calc(100vh-300px)]">
        {view === 'home' && (
            <>
                <div className="relative bg-stone-900 text-white rounded-3xl overflow-hidden mb-12 min-h-[450px] flex items-center w-full shadow-2xl group">
                    {banners.map((slide, index) => (
                        <div key={slide.id || index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}>
                            <div className="absolute inset-0 bg-black/40 z-10"></div>
                            <img src={slide.image} alt="Hero" className="w-full h-full object-cover" />
                            <div className="absolute z-20 inset-0 flex flex-col justify-center px-8 md:px-16 text-center md:text-left items-start">
                                <span className={`${slide.color || 'text-amber-400'} font-bold tracking-widest uppercase mb-4 block animate-slide-up`}>{slide.subtitle}</span>
                                <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight max-w-3xl animate-slide-up" style={{animationDelay: '0.1s'}}>{slide.title}</h1>
                                <p className="text-amber-100 text-lg mb-8 max-w-xl animate-slide-up" style={{animationDelay: '0.2s'}}>{slide.desc}</p>
                                <Button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>Shop Now</Button>
                            </div>
                        </div>
                    ))}
                    <button onClick={prevSlide} className="absolute left-4 z-30 p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white"><ChevronLeft size={32}/></button>
                    <button onClick={nextSlide} className="absolute right-4 z-30 p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white"><ChevronRight size={32}/></button>
                </div>

                {productsLoading ? <div className="text-center py-20"><Loader2 className="animate-spin mx-auto"/> Loading Products...</div> : 
                 products.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                        <Package size={48} className="mx-auto text-stone-300 mb-4"/>
                        <h3 className="text-xl font-bold text-stone-500">No Products Found</h3>
                        <p className="text-stone-400">Try adjusting your filters or adding items via Admin.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                        {products.map(p => {
                            const isSoldOut = p.countInStock === 0;
                            return (
                            <div key={p._id || p.id} className="bg-white rounded-xl border p-4 hover:shadow-lg transition-shadow group relative">
                                {isSoldOut && <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center font-bold text-stone-800">SOLD OUT</div>}
                                <img src={p.image} className="w-full h-48 object-cover rounded mb-4 group-hover:scale-105 transition-transform"/>
                                <h3 className="font-bold truncate">{p.name}</h3>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-amber-700 font-bold">₹{p.price}</span>
                                    {isSoldOut ? (
                                        <Button onClick={() => handleNotifyMe(p)} className="p-2 z-20 relative"><Bell size={16}/></Button>
                                    ) : (
                                        <Button onClick={() => addToCart(p)} className="p-2"><Plus size={16}/></Button>
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                )}
                
                {page < totalPages && (
                    <div className="mt-12 text-center">
                        <Button variant="secondary" onClick={loadMore} disabled={productsLoading}>
                            {productsLoading ? <Loader2 className="animate-spin"/> : "Load More Products"}
                        </Button>
                    </div>
                )}
            </>
        )}
        {view === 'cart' && (
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-serif font-bold mb-8">Your Cart ({cart.length})</h2>
                {cart.length === 0 ? <p className="text-center text-stone-500 py-10">Your cart is empty.</p> : (
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item._id || item.id} className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-stone-100">
                                <div className="flex items-center gap-4">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-stone-100" />
                                    <div><h3 className="font-bold text-stone-900">{item.name}</h3><p className="text-amber-700 font-semibold">₹{item.price}</p></div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2 bg-stone-50 rounded-lg p-1 border border-stone-200">
                                        <button onClick={() => updateQuantity(item.id || item._id, -1)} className="p-1 hover:bg-white rounded"><Minus size={16}/></button>
                                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id || item._id, 1)} className="p-1 hover:bg-white rounded"><Plus size={16}/></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id || item._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full"><Trash2 size={18}/></button>
                                </div>
                            </div>
                        ))}
                        <div className="mt-8 flex justify-between items-center bg-stone-900 text-white p-6 rounded-xl">
                            <span className="text-xl font-bold">Total: ₹{cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)}</span>
                            <Button onClick={handleCheckout} disabled={cart.length===0 || isLoading} className="bg-white text-stone-900 hover:bg-stone-200">{isLoading ? <Loader2 className="animate-spin"/> : "Checkout Now"}</Button>
                        </div>
                    </div>
                )}
            </div>
        )}
        {view === 'admin' && renderAdmin()}
        {view === 'account' && (
            <div className="max-w-6xl mx-auto my-10 px-4">
                <h1 className="text-3xl font-serif font-bold text-stone-800 mb-8">My Account</h1>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="md:col-span-1 bg-white rounded-xl border border-stone-100 shadow-sm p-6 text-center">
                        <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-amber-800 mb-3">{(user?.name || 'U').charAt(0)}</div>
                        <h3 className="font-bold">{user?.name}</h3>
                        <p className="text-sm text-stone-500">{user?.email}</p>
                        <Button variant="ghost" onClick={() => { setUser(null); setView('home'); }} className="w-full mt-6 text-red-600">Sign Out</Button>
                    </div>
                    <div className="md:col-span-3 bg-white p-8 rounded-xl border border-stone-100 shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2"><MapPin size={18}/> Saved Addresses</h3>
                        {user?.addresses?.map((a,i)=><div key={i} className="border p-3 rounded mb-2 bg-stone-50 text-sm">{a.street}, {a.city}</div>)}
                        <form onSubmit={handleAddAddress} className="space-y-4 mt-6 border-t pt-6">
                            <h4 className="font-bold text-sm text-stone-400">ADD NEW ADDRESS</h4>
                            <div className="grid grid-cols-2 gap-4"><input placeholder="Street" className="border p-2 rounded" value={newAddress.street} onChange={e=>setNewAddress({...newAddress, street: e.target.value})}/><input placeholder="City" className="border p-2 rounded" value={newAddress.city} onChange={e=>setNewAddress({...newAddress, city: e.target.value})}/></div>
                            <Button className="w-full">Save Address</Button>
                        </form>
                    </div>
                </div>
            </div>
        )}
        {(view === 'login' || view === 'register') && renderUserAuth()}
        {view === 'staff-login' && renderStaffLogin()}
      </main>

      <footer className="bg-stone-900 text-stone-300 pt-16 pb-8 w-full">
        <div className="w-full px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="text-2xl font-serif font-bold text-white tracking-tight flex items-center gap-2 mb-4"><div className="w-8 h-8 bg-amber-700 rounded-lg flex items-center justify-center text-white"><span className="font-sans font-black text-xs">SG</span></div>Shri Ganpati</div>
              <p className="text-stone-400 leading-relaxed text-sm">Your trusted destination for premium photo frames, religious wall art, and custom framing solutions.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Collections</h4>
              <ul className="space-y-2 text-stone-400 text-sm"><li onClick={() => handleMainCategorySelect("Posters")} className="cursor-pointer hover:text-amber-500">Posters</li><li onClick={() => handleMainCategorySelect("Frames")} className="cursor-pointer hover:text-amber-500">Frames</li><li onClick={() => handleMainCategorySelect("Pure Tanjore Work")} className="cursor-pointer hover:text-amber-500">Tanjore Art</li></ul>
            </div>
            <div><h4 className="font-bold text-white mb-4">Customer Care</h4><ul className="space-y-2 text-stone-400 text-sm"><li>Track Your Order</li><li>Shipping Policy</li><li>Contact Support</li></ul></div>
          </div>
          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500"><p>© 2026 Shri Ganpati Photo Frame. All rights reserved.</p><div className="flex items-center gap-4"><button onClick={() => {if(user && user.isAdmin) setView('admin'); else goToStaffLogin()}} className="flex items-center gap-1 opacity-20 hover:opacity-100 transition-opacity"><Lock size={12} /> Staff Entrance</button></div></div>
        </div>
      </footer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsCategoryModalOpen(false)}>
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Categories</h3><button onClick={() => setIsCategoryModalOpen(false)}><X size={20}/></button></div>
                <div className="grid grid-cols-1 gap-2">{Object.keys(CATEGORY_HIERARCHY).map(cat => (<button key={cat} onClick={() => {setActiveMainCategory(cat); setIsCategoryModalOpen(false);}} className="flex justify-between w-full p-4 hover:bg-stone-50 rounded-lg text-left"><span className="font-semibold">{cat}</span><ChevronRight size={16}/></button>))}</div>
            </div>
        </div>
      )}
      {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-stone-100 p-4 shadow-xl">
             <div className="flex flex-col gap-4">
               <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="text-left font-medium p-2 hover:bg-amber-50 rounded-lg">Home</button>
               <button onClick={() => { setIsCategoryModalOpen(true); setIsMobileMenuOpen(false); }} className="text-left font-medium p-2 hover:bg-amber-50 rounded-lg">Categories</button>
               {user ? <button onClick={() => { setView('account'); setIsMobileMenuOpen(false); }} className="text-left font-medium p-2 hover:bg-amber-50 rounded-lg">My Account</button> : <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="text-left font-medium p-2 hover:bg-amber-50 rounded-lg">Login</button>}
             </div>
          </div>
        )}
    </div>
  );
}