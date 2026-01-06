import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  ShoppingCart, Search, Menu, X, Star, Trash2, CreditCard, CheckCircle, 
  ArrowRight, Plus, Minus, ShoppingBag, Heart, Filter, MapPin, ShieldCheck, 
  Truck, Image as ImageIcon, Frame, ChevronDown, Wand2, User, Lock, 
  LayoutDashboard, LogOut, PlusCircle, Home, Layers, PenTool, Upload,
  Phone, Bell, Gift, Package, Clock, HelpCircle, Edit3, ChevronLeft, ChevronRight,
  PackagePlus, FileText, Loader2, LogOut as LogoutIcon, Mail, Save, AlertTriangle, Eye, EyeOff
} from 'lucide-react';

// --- CONFIGURATION ---
const API_URL = 'http://127.0.0.1:5000'; 

const CATEGORY_HIERARCHY = {
  "Posters": ["Religious", "Marvel", "Anime", "Mcu", "Cars", "Bikes", "Jets"],
  "Frames": ["Deep Box Frame", "Led Light Frame", "Italian Frame", "Canvas Frame", "Brass Frame", "Silver Frame", "Metal Frame", "Aluminum Frame", "Wooden Frame"],
  "Pure Tanjore Work": ["Gold Work", "Silver Work"],
  "MDF Cutouts": ["Religious Cutouts", "Decor Cutouts"]
};

// Fallback Data
const INITIAL_PRODUCTS = [
  { id: 1, name: "Lord Ganesha Golden Art Frame", price: 3499, originalPrice: 4999, countInStock: 5, mainCategory: "Pure Tanjore Work", category: "Gold Work", rating: 5.0, image: "https://images.unsplash.com/photo-1567601672322-83561a357ea1?w=800&q=80", description: "A premium gold-finish Tanjore art piece." },
  { id: 2, name: "Classic Mahogany Wooden Frame", price: 1299, originalPrice: 1999, countInStock: 12, mainCategory: "Frames", category: "Wooden Frame", rating: 4.8, image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=800&q=80", description: "Hand-polished mahogany finish." },
  { id: 3, name: "Naruto: Sage Mode Print", price: 499, originalPrice: 999, countInStock: 0, mainCategory: "Posters", category: "Anime", rating: 4.9, image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80", description: "High-quality matte finish poster." },
  { id: 6, name: "Modern LED Light Frame", price: 4500, originalPrice: 6000, countInStock: 3, mainCategory: "Frames", category: "Led Light Frame", rating: 5.0, image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", description: "Backlit LED frame for modern homes." },
];

const BANNER_SLIDES = [
  { id: 1, image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&q=80", subtitle: "PREMIUM ART & FRAMING", title: "Frame Your Precious Moments & Divine Memories", desc: "From handcrafted wooden frames to exquisite religious posters, we help you preserve what matters most.", color: "text-amber-400" },
  { id: 2, image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?w=1600&q=80", subtitle: "HANDCRAFTED ELEGANCE", title: "Turn Your Walls Into A Masterpiece", desc: "Explore our new collection of Italian and Mahogany finished frames.", color: "text-amber-400" },
  { id: 3, image: "https://images.unsplash.com/photo-1628191011993-4350f92696b0?w=1600&q=80", subtitle: "DIVINE COLLECTION", title: "Authentic Tanjore Art & Gold Work", desc: "Bring home the blessings with our certified Gold and Silver foil Tanjore artworks.", color: "text-amber-400" }
];

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-amber-700 text-white hover:bg-amber-800 shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-50",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 active:scale-95",
    ghost: "text-gray-600 hover:bg-gray-100 active:scale-95"
  };
  return <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Badge = ({ children }) => <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px]">{children}</span>;

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-slide-up ${type === 'success' ? 'bg-green-600 text-white' : type === 'info' ? 'bg-amber-700 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>{type === 'success' ? <CheckCircle size={20} /> : type==='error'? <AlertTriangle size={20}/> : <ShoppingBag size={20} />} <span className="font-medium">{message}</span></div>;
};

export default function App() {
  const [view, setView] = useState('home'); 
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [banners, setBanners] = useState(BANNER_SLIDES);
  const [searchQuery, setSearchQuery] = useState('');
  
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
  const [showPassword, setShowPassword] = useState(false); // NEW: Toggle Password

  const [activeTab, setActiveTab] = useState('profile'); 
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '' });
  const [bulkOrder, setBulkOrder] = useState({ productName: '', quantity: '', details: '', date: '' });

  const [adminTab, setAdminTab] = useState('products');
  const [bannerForm, setBannerForm] = useState(BANNER_SLIDES);

  useEffect(() => {
    const savedCart = localStorage.getItem('ganpatiCart');
    const savedUser = localStorage.getItem('ganpatiUser');
    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedUser) {
        const u = JSON.parse(savedUser);
        setUser(u);
        setEditProfileForm({ name: u.name, phone: u.phone });
    }
    fetchProducts();
    fetchBanners();
  }, []);

  useEffect(() => { localStorage.setItem('ganpatiCart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { if(user) localStorage.setItem('ganpatiUser', JSON.stringify(user)); else localStorage.removeItem('ganpatiUser'); }, [user]);
  useEffect(() => { const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % banners.length), 5000); return () => clearInterval(timer); }, [banners]);

  const fetchProducts = async () => {
    try { const { data } = await axios.get(`${API_URL}/api/products`); if(data.length > 0) setProducts(data); else setProducts(INITIAL_PRODUCTS); } catch (e) { setProducts(INITIAL_PRODUCTS); }
  };

  const fetchBanners = async () => {
    try { const { data } = await axios.get(`${API_URL}/api/banners`); if(data.length > 0) { setBanners(data); setBannerForm(data); } } catch (e) { setBanners(BANNER_SLIDES); }
  };

  const showToast = (message, type = 'default') => { setToast({ message, type }); };

  const addToCart = (product) => {
    if (product.countInStock === 0) { showToast("Item sold out.", "info"); return; }
    setCart(prev => {
        const prodId = product._id || product.id;
        const existing = prev.find(item => (item._id || item.id) === prodId);
        if (existing) {
            return prev.map(item => ((item._id || item.id) === prodId) ? { ...item, quantity: item.quantity + 1 } : item);
        }
        return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added ${product.name} to cart`, 'success');
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      const itemId = item._id || item.id;
      if (itemId === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id) => { 
      setCart(prev => prev.filter(item => {
          const itemId = item._id || item.id;
          return itemId !== id;
      })); 
  };

  const handleNotifyMe = async (product) => {
      if(!user) { showToast("Please login to get notified", "info"); return; }
      try {
          await axios.post(`${API_URL}/api/products/notify`, { userId: user._id, productId: product._id });
          showToast("Request sent!", "success");
      } catch (error) { showToast("Connection Error", "error"); }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const { data } = await axios.post(`${API_URL}/api/users/login`, { email: loginForm.phone, password: loginForm.password });
        setUser(data);
        setEditProfileForm({ name: data.name, phone: data.phone });
        if (data.isAdmin) setView('admin');
        else setView('home');
        showToast(`Welcome back, ${data.name}!`, "success");
    } catch (error) { 
        // STRICT ERROR HANDLING
        const errorMsg = error.response && error.response.data && error.response.data.message 
                         ? error.response.data.message 
                         : "Connection Failed. Check Server.";
        showToast(errorMsg, "error"); 
    } finally { setIsLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const payload = {
            name: registerForm.name,
            email: registerForm.email,
            phone: registerForm.phone,
            password: registerForm.password
        };
        const { data } = await axios.post(`${API_URL}/api/users`, payload);
        setUser(data);
        setEditProfileForm({ name: data.name, phone: data.phone });
        setView('home');
        showToast("Account created!", "success");
    } catch (error) { 
        // STRICT ERROR HANDLING
        const errorMsg = error.response && error.response.data && error.response.data.message 
                         ? error.response.data.message 
                         : "Registration Failed.";
        showToast(errorMsg, "error"); 
    } finally { setIsLoading(false); }
  };

  const handleStaffEntrance = () => { 
      if (user && user.isAdmin) {
          setView('admin'); 
      } else if (user && !user.isAdmin) {
          if(window.confirm("You are logged in as a Client. Logout to access Staff Panel?")) {
              handleLogout();
              setView('login');
          }
      } else { 
          setView('login'); 
          showToast("Staff Access Only. Login as Admin.", "info"); 
      } 
  };

  const handleLogout = () => { setUser(null); setView('home'); setCart([]); showToast('Signed out'); };

  const handleAddAddress = async (e) => {
      e.preventDefault();
      try {
          const { data } = await axios.put(`${API_URL}/api/users/profile`, { address: newAddress }, { headers: { Authorization: `Bearer ${user.token}` } });
          setUser(data);
          setNewAddress({ street: '', city: '', state: '', zip: '' });
          showToast("Address Saved!", "success");
      } catch (error) { showToast("Failed to save address", "error"); }
  };

  const handleSaveBanners = async () => {
      try {
          await axios.post(`${API_URL}/api/banners`, bannerForm, { headers: { Authorization: `Bearer ${user.token}` } });
          setBanners(bannerForm);
          showToast("Banners Updated!", "success");
      } catch (error) { showToast("Update failed", "error"); }
  };

  const handleUpdateProfile = async () => {
      try {
          const { data } = await axios.put(`${API_URL}/api/users/profile`, editProfileForm, { headers: { Authorization: `Bearer ${user.token}` } });
          setUser(data);
          setIsEditingProfile(false);
          showToast("Profile Updated!", "success");
      } catch (error) { showToast("Update failed", "error"); }
  };

  const handleCheckout = async () => {
      if (!user) { setView('login'); showToast("Please login", "info"); return; }
      setIsLoading(true);
      try {
          const orderData = { orderItems: cart, itemsPrice: cart.reduce((acc, item) => acc + item.price * item.quantity, 0), user: user };
          await axios.post(`${API_URL}/api/orders`, orderData, { headers: { Authorization: `Bearer ${user.token}` } }); 
          setCart([]); setView('account'); setActiveTab('orders'); showToast("Order Placed!", "success");
      } catch (error) { showToast("Order Failed", "error"); } 
      finally { setIsLoading(false); }
  };

  const handleBulkSubmit = async (e) => {
      e.preventDefault();
      setIsLoading(true);
      try {
          await axios.post(`${API_URL}/api/orders/bulk`, { ...bulkOrder, user }, { headers: { Authorization: `Bearer ${user.token}` } });
          showToast("Request Sent!", "success");
          setBulkOrder({ productName: '', quantity: '', details: '', date: '' });
      } catch (error) { showToast("Failed to send request", "error"); } finally { setIsLoading(false); }
  };

  const handleMainCategorySelect = (mainCat) => { setActiveMainCategory(mainCat); setActiveSubCategory('All'); setIsCategoryModalOpen(false); setView('home'); window.scrollTo({ top: 500, behavior: 'smooth' }); };
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      let matchesCategory = true;
      if (activeMainCategory) {
          matchesCategory = p.mainCategory === activeMainCategory || p.category === activeMainCategory;
          if (activeSubCategory !== 'All') matchesCategory = matchesCategory && p.category === activeSubCategory;
      } else { if (activeSubCategory !== 'All') matchesCategory = p.category === activeSubCategory; }
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeMainCategory, activeSubCategory, products]);

  // --- RENDERERS ---
  const renderAdmin = () => (
      <div className="w-full px-6 md:px-12 py-8">
          <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-stone-800 flex items-center gap-2"><LayoutDashboard className="text-amber-700"/> Admin Dashboard</h1>
              <Button variant="secondary" onClick={() => setView('home')}>Exit Admin</Button>
          </div>
          <div className="flex gap-4 mb-6">
              <button onClick={()=>setAdminTab('products')} className={`px-4 py-2 rounded-lg font-bold ${adminTab==='products'?'bg-amber-700 text-white':'bg-stone-200'}`}>Products</button>
              <button onClick={()=>setAdminTab('banners')} className={`px-4 py-2 rounded-lg font-bold ${adminTab==='banners'?'bg-amber-700 text-white':'bg-stone-200'}`}>Wallpapers</button>
          </div>
          {adminTab === 'products' && (
              <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
                  <div className="p-4 border-b"><Button onClick={()=>alert("Use backend routes to add")}>Add New Product</Button></div>
                  <table className="w-full text-left">
                      <thead className="bg-stone-50 border-b"><tr><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Stock</th></tr></thead>
                      <tbody>
                          {products.map(p => (
                              <tr key={p._id || p.id} className="border-b hover:bg-stone-50">
                                  <td className="p-4 flex items-center gap-3"><img src={p.image} className="w-10 h-10 rounded object-cover" /><span className="font-medium">{p.name}</span></td>
                                  <td className="p-4">₹{p.price}</td>
                                  <td className="p-4">{p.countInStock}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          )}
          {adminTab === 'banners' && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
                  <h3 className="font-bold text-lg mb-4">Edit Homepage Wallpapers</h3>
                  {bannerForm.map((b, i) => (
                      <div key={i} className="mb-6 border p-4 rounded-lg bg-stone-50">
                          <h4 className="font-bold text-sm mb-2 text-stone-500">Slide {i+1}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input placeholder="Image URL" className="p-2 border rounded" value={b.image} onChange={(e) => {const newB = [...bannerForm]; newB[i].image = e.target.value; setBannerForm(newB)}} />
                              <input placeholder="Title" className="p-2 border rounded" value={b.title} onChange={(e) => {const newB = [...bannerForm]; newB[i].title = e.target.value; setBannerForm(newB)}} />
                              <input placeholder="Subtitle" className="p-2 border rounded" value={b.subtitle} onChange={(e) => {const newB = [...bannerForm]; newB[i].subtitle = e.target.value; setBannerForm(newB)}} />
                              <input placeholder="Description" className="p-2 border rounded" value={b.desc} onChange={(e) => {const newB = [...bannerForm]; newB[i].desc = e.target.value; setBannerForm(newB)}} />
                          </div>
                      </div>
                  ))}
                  <Button onClick={handleSaveBanners}>Save All Banners</Button>
              </div>
          )}
      </div>
  );

  const renderAccount = () => (
      <div className="max-w-6xl mx-auto my-10 px-4">
          <h1 className="text-3xl font-serif font-bold text-stone-800 mb-8">My Account</h1>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="md:col-span-1">
                  <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden p-6 text-center">
                      <div className="w-20 h-20 bg-amber-100 rounded-full mx-auto flex items-center justify-center text-2xl font-bold text-amber-800 mb-3">{user.name ? user.name[0] : 'U'}</div>
                      <h3 className="font-bold">{user.name}</h3>
                      <p className="text-sm text-stone-500">{user.phone}</p>
                      <nav className="mt-6 text-left space-y-2">
                          <button onClick={() => setActiveTab('profile')} className="w-full p-2 hover:bg-stone-50 rounded flex gap-2"><User size={18}/> Profile</button>
                          <button onClick={() => setActiveTab('orders')} className="w-full p-2 hover:bg-stone-50 rounded flex gap-2"><Package size={18}/> Orders</button>
                          <button onClick={() => setActiveTab('bulk')} className="w-full p-2 hover:bg-stone-50 rounded flex gap-2"><PackagePlus size={18}/> Bulk Orders</button>
                          <button onClick={handleLogout} className="w-full p-2 text-red-600 hover:bg-red-50 rounded flex gap-2"><LogoutIcon size={18}/> Sign Out</button>
                      </nav>
                  </div>
              </div>
              <div className="md:col-span-3">
                  {activeTab === 'profile' && (
                      <div className="bg-white p-8 rounded-xl border border-stone-100 shadow-sm">
                          <div className="flex justify-between items-center mb-6">
                              <h2 className="text-xl font-bold">Personal Information</h2>
                              <button onClick={() => { if(isEditingProfile) handleUpdateProfile(); else setIsEditingProfile(true); }} className="text-amber-700 font-bold hover:underline">{isEditingProfile ? 'Save' : 'Edit'}</button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                              <div><label className="text-sm font-medium">Name</label><input disabled={!isEditingProfile} value={editProfileForm.name} onChange={e=>setEditProfileForm({...editProfileForm, name: e.target.value})} className={`w-full p-2 border rounded ${!isEditingProfile ? 'bg-stone-50' : 'bg-white'}`} /></div>
                              <div><label className="text-sm font-medium">Phone</label><input disabled={!isEditingProfile} value={editProfileForm.phone} onChange={e=>setEditProfileForm({...editProfileForm, phone: e.target.value})} className={`w-full p-2 border rounded ${!isEditingProfile ? 'bg-stone-50' : 'bg-white'}`} /></div>
                          </div>
                          <h3 className="font-bold mb-4 mt-8 flex items-center gap-2"><MapPin size={18}/> Saved Addresses</h3>
                          {user.addresses && user.addresses.length > 0 ? user.addresses.map((addr, i) => (
                              <div key={i} className="border p-3 rounded mb-2 bg-stone-50 text-sm flex justify-between">
                                  <span>{addr.street}, {addr.city}, {addr.state} - {addr.zip}</span>
                              </div>
                          )) : <p className="text-stone-500 text-sm">No addresses saved.</p>}
                          
                          <form onSubmit={handleAddAddress} className="space-y-4 mt-4 border-t pt-4">
                              <span className="text-xs font-bold text-stone-400 uppercase">Add New Address</span>
                              <input placeholder="Street Address" className="w-full p-2 border rounded" value={newAddress.street} onChange={e=>setNewAddress({...newAddress, street: e.target.value})} required/>
                              <div className="grid grid-cols-3 gap-4">
                                  <input placeholder="City" className="w-full p-2 border rounded" value={newAddress.city} onChange={e=>setNewAddress({...newAddress, city: e.target.value})} required/>
                                  <input placeholder="State" className="w-full p-2 border rounded" value={newAddress.state} onChange={e=>setNewAddress({...newAddress, state: e.target.value})} required/>
                                  <input placeholder="Zip Code" className="w-full p-2 border rounded" value={newAddress.zip} onChange={e=>setNewAddress({...newAddress, zip: e.target.value})} required/>
                              </div>
                              <Button variant="secondary" className="w-full">Save New Address</Button>
                          </form>
                      </div>
                  )}
                  {activeTab === 'bulk' && <div className="bg-white p-8 rounded-xl border border-stone-100 shadow-sm"><h2 className="text-xl font-bold mb-2 flex items-center gap-2"><PackagePlus size={20} className="text-amber-700"/> Bulk & Private Orders</h2><p className="text-stone-500 mb-6 text-sm">Need a large quantity? Fill out this form for a private quote.</p><form className="space-y-6" onSubmit={handleBulkSubmit}><div><label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label><input type="text" className="w-full p-3 border rounded-lg outline-none" value={bulkOrder.productName} onChange={e => setBulkOrder({...bulkOrder, productName: e.target.value})} required/></div><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-stone-700 mb-1">Quantity</label><input type="number" className="w-full p-3 border rounded-lg outline-none" value={bulkOrder.quantity} onChange={e => setBulkOrder({...bulkOrder, quantity: e.target.value})} required/></div><div><label className="block text-sm font-medium text-stone-700 mb-1">Target Date</label><input type="date" className="w-full p-3 border rounded-lg outline-none" value={bulkOrder.date} onChange={e => setBulkOrder({...bulkOrder, date: e.target.value})} required/></div></div><div><label className="block text-sm font-medium text-stone-700 mb-1">Details</label><textarea rows="4" className="w-full p-3 border rounded-lg outline-none" value={bulkOrder.details} onChange={e => setBulkOrder({...bulkOrder, details: e.target.value})}></textarea></div><Button className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin"/> : "Submit Request"}</Button></form></div>}
                  {activeTab === 'orders' && <div className="text-center p-10 text-stone-500">No orders found.</div>}
              </div>
          </div>
      </div>
  );

  const renderHome = () => (
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
                    <div className="animate-slide-up" style={{animationDelay: '0.3s'}}><Button onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}>Explore Collection <ArrowRight size={20} /></Button></div>
                </div>
            </div>
        ))}
        <button onClick={prevSlide} className="absolute left-4 z-30 p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100"><ChevronLeft size={32}/></button>
        <button onClick={nextSlide} className="absolute right-4 z-30 p-2 bg-white/10 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all opacity-0 group-hover:opacity-100"><ChevronRight size={32}/></button>
      </div>
      <div className="sticky top-20 bg-white/95 backdrop-blur-md p-4 rounded-xl z-20 shadow-sm border border-stone-100 w-full mb-8 flex flex-col md:flex-row justify-between gap-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
             <button onClick={() => setActiveSubCategory('All')} className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium border ${activeSubCategory === 'All' ? 'bg-stone-800 text-white' : 'bg-stone-50'}`}>All Items</button>
             {(activeMainCategory ? CATEGORY_HIERARCHY[activeMainCategory] : ["Gods", "Wooden Frame", "Gold Work"]).map(cat => (
                <button key={cat} onClick={() => setActiveSubCategory(cat)} className="px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-medium border bg-stone-50 hover:bg-stone-100">{cat}</button>
             ))}
          </div>
          <div className="relative w-full md:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} /><input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg outline-none" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 w-full">
        {filteredProducts.map(product => {
          const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
          const isSoldOut = product.countInStock === 0;
          return (
            <div key={product._id || product.id} className="group bg-white rounded-xl border border-stone-100 overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col relative">
                {discount > 0 && !isSoldOut && <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md z-10">{discount}% OFF</div>}
                {isSoldOut && <div className="absolute top-0 left-0 w-full h-full bg-white/60 z-10 flex items-center justify-center"><div className="bg-stone-800 text-white font-bold px-4 py-2 rounded-lg">SOLD OUT</div></div>}
              <div className="relative h-72 overflow-hidden bg-stone-100 p-4 flex items-center justify-center"><img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" /></div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2"><span className="text-xs font-bold text-amber-700 uppercase bg-amber-50 px-2 py-1 rounded-md">{product.category}</span><div className="flex items-center gap-1 text-amber-500"><Star size={14} fill="currentColor" /><span className="text-xs font-semibold text-gray-600">{product.rating || 5.0}</span></div></div>
                <h3 className="font-serif font-bold text-lg text-gray-900 mb-2 truncate">{product.name}</h3>
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <div><span className="text-xl font-bold text-gray-900">₹{product.price}</span> {product.originalPrice > product.price && <span className="text-sm text-gray-400 line-through">₹{product.originalPrice}</span>}</div>
                    {isSoldOut ? <button onClick={() => handleNotifyMe(product)} className="text-stone-500 p-2 hover:bg-stone-100 rounded-lg"><Bell size={20} /></button> : <button onClick={() => addToCart(product)} className="bg-stone-900 text-white p-2.5 rounded-lg hover:bg-amber-700 active:scale-95"><Plus size={20} /></button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-900">
      <style>{` .no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } .animate-slide-up { animation: slide-up 0.5s ease-out forwards; opacity: 0; transform: translateY(20px); } @keyframes slide-up { to { opacity: 1; transform: translateY(0); } } `}</style>

      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 w-full">
        <div className="w-full px-6 md:px-12 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8 md:gap-12">
            <button onClick={() => { setView('home'); handleMainCategorySelect(null); window.scrollTo({top:0,behavior:'smooth'}); }} className="text-xl md:text-2xl font-serif font-bold text-amber-900 tracking-tight flex items-center gap-2 hover:opacity-80 transition-opacity">
              <img src="/sgpf-logo.png" alt="SGPF" className="w-12 h-12 object-contain" onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='flex'}} />
              <span className="hidden sm:inline">SGPF</span>
            </button>
            <div className="hidden md:flex gap-6 items-center">
              <button onClick={() => { setView('home'); handleMainCategorySelect(null); window.scrollTo({top:0,behavior:'smooth'}); }} className="text-sm font-medium text-stone-600 hover:text-amber-700 transition-colors flex items-center gap-1"><Home size={16}/> Home</button>
              <button onClick={() => setIsCategoryModalOpen(true)} className="text-sm font-medium text-stone-600 hover:text-amber-700 transition-colors flex items-center gap-1"><Layers size={16}/> Categories <ChevronDown size={14}/></button>
              <button onClick={() => handleMainCategorySelect(null)} className="text-sm font-medium text-stone-600 hover:text-amber-700 transition-colors">New Arrivals</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-lg focus-within:bg-white transition-all border border-transparent focus-within:border-amber-200"><Search size={18} className="text-stone-400" /><input type="text" placeholder="Search" className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            {user ? (
                <button onClick={() => setView(user.isAdmin ? 'admin' : 'account')} className="flex items-center gap-2 hover:bg-stone-100 p-2 rounded-lg">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 font-bold text-xs">{user.name ? user.name[0] : 'U'}</div>
                </button>
            ) : <button onClick={() => setView('login')} className="p-2 hover:bg-stone-100 rounded-lg text-stone-600"><User size={22} /></button>}
            <button className="relative p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-700" onClick={() => setView('cart')}><ShoppingCart size={22} />{cartItemCount > 0 && <Badge>{cartItemCount}</Badge>}</button>
            <button className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-700" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-stone-100 p-4 shadow-xl">
             <div className="flex flex-col gap-4">
               <button onClick={() => { setView('home'); setIsMobileMenuOpen(false); }} className="text-left font-medium p-2 hover:bg-amber-50 rounded-lg">Home</button>
               <button onClick={() => { setIsCategoryModalOpen(true); setIsMobileMenuOpen(false); }} className="text-left font-medium p-2 hover:bg-amber-50 rounded-lg">Categories</button>
               {user ? <button onClick={() => { setView('account'); setIsMobileMenuOpen(false); }} className="text-left font-medium p-2 hover:bg-amber-50 rounded-lg">My Account</button> : <button onClick={() => { setView('login'); setIsMobileMenuOpen(false); }} className="text-left font-medium p-2 hover:bg-amber-50 rounded-lg">Login</button>}
             </div>
          </div>
        )}
      </nav>

      <main className="w-full px-6 md:px-12 py-8 min-h-[calc(100vh-300px)]">
        {view === 'home' && renderHome()}
        {view === 'cart' && (
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-serif font-bold mb-8">Your Cart ({cartItemCount})</h2>
                {cart.length === 0 ? <p className="text-center text-stone-500 py-10">Your cart is empty.</p> : (
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item._id || item.id} className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm border border-stone-100">
                                <div className="flex items-center gap-4">
                                    <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg bg-stone-100" />
                                    <div>
                                        <h3 className="font-bold text-stone-900">{item.name}</h3>
                                        <p className="text-amber-700 font-semibold">₹{item.price}</p>
                                    </div>
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
                            <span className="text-xl font-bold">Total: ₹{cartTotal}</span>
                            <Button onClick={handleCheckout} disabled={cart.length===0 || isLoading} className="bg-white text-stone-900 hover:bg-stone-200">{isLoading ? <Loader2 className="animate-spin"/> : "Checkout Now"}</Button>
                        </div>
                    </div>
                )}
            </div>
        )}
        {view === 'admin' && renderAdmin()}
        {view === 'account' && renderAccount()}
        {(view === 'login' || view === 'register') && (
            <div className="max-w-md mx-auto my-20 bg-white p-8 rounded-2xl shadow-lg border border-stone-100">
                <div className="text-center mb-8"><h2 className="text-2xl font-bold">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2></div>
                <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                    {isRegistering && <input placeholder="Full Name" className="w-full p-3 border rounded" value={registerForm.name} onChange={e => setRegisterForm({...registerForm, name: e.target.value})} required />}
                    <input placeholder="Phone Number" className="w-full p-3 border rounded" value={isRegistering ? registerForm.phone : loginForm.phone} onChange={e => isRegistering ? setRegisterForm({...registerForm, phone: e.target.value}) : setLoginForm({...loginForm, phone: e.target.value})} required />
                    {isRegistering && <input placeholder="Email" className="w-full p-3 border rounded" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} required />}
                    
                    <div className="relative">
                        <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded" value={isRegistering ? registerForm.password : loginForm.password} onChange={e => isRegistering ? setRegisterForm({...registerForm, password: e.target.value}) : setLoginForm({...loginForm, password: e.target.value})} required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-amber-700">
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    {!isRegistering && (
                        <div className="flex justify-end">
                            <button type="button" onClick={() => showToast("Feature coming soon! Contact support to reset.", "info")} className="text-sm text-amber-700 hover:underline">Forgot Password?</button>
                        </div>
                    )}

                    <Button className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin"/> : (isRegistering ? "Register" : "Login")}</Button>
                    <div className="text-center mt-4 text-sm text-stone-500">
                        {isRegistering ? "Already have an account? " : "Don't have an account? "}
                        <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-amber-700 font-bold hover:underline">{isRegistering ? "Log in" : "Register"}</button>
                    </div>
                </form>
            </div>
        )}
      </main>
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsCategoryModalOpen(false)}>
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl animate-slide-up" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold">Categories</h3><button onClick={() => setIsCategoryModalOpen(false)}><X size={20}/></button></div>
                <div className="grid grid-cols-1 gap-2">{Object.keys(CATEGORY_HIERARCHY).map(cat => (<button key={cat} onClick={() => {setActiveMainCategory(cat); setIsCategoryModalOpen(false);}} className="flex justify-between w-full p-4 hover:bg-stone-50 rounded-lg text-left"><span className="font-semibold">{cat}</span><ChevronRight size={16}/></button>))}</div>
            </div>
        </div>
      )}
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
          <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500"><p>© 2026 Shri Ganpati Photo Frame. All rights reserved.</p><div className="flex items-center gap-4"><button onClick={() => {if(user && user.isAdmin) setView('admin'); else handleStaffEntrance()}} className="flex items-center gap-1 opacity-20 hover:opacity-100 transition-opacity"><Lock size={12} /> Staff Entrance</button></div></div>
        </div>
      </footer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}