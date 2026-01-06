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

const API_URL = 'http://127.0.0.1:5000'; 

// --- DYNAMIC SCRIPT LOADER (For Razorpay) ---
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const CATEGORY_HIERARCHY = {
  "Posters": ["Religious", "Marvel", "Anime", "Mcu", "Cars", "Bikes", "Jets"],
  "Frames": ["Deep Box Frame", "Led Light Frame", "Italian Frame", "Canvas Frame", "Brass Frame", "Silver Frame", "Metal Frame", "Aluminum Frame", "Wooden Frame"],
  "Pure Tanjore Work": ["Gold Work", "Silver Work"],
  "MDF Cutouts": ["Religious Cutouts", "Decor Cutouts"]
};

// ... (KEEP BANNER_SLIDES and INITIAL_PRODUCTS constant arrays if you want fallbacks) ...
const BANNER_SLIDES = [ { id: 1, image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1600&q=80", subtitle: "PREMIUM ART", title: "Frame Your Memories", desc: "Handcrafted wooden frames.", color: "text-amber-400" } ];
const INITIAL_PRODUCTS = []; // We will load from DB

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-amber-700 text-white hover:bg-amber-800 shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-50",
    secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 active:scale-95",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 active:scale-95",
    ghost: "text-gray-600 hover:bg-gray-100 active:scale-95"
  };
  return <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

const Badge = ({ children }) => <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px]">{children}</span>;

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
  return <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-slide-up ${type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>{type === 'success' ? <CheckCircle size={20} /> : type === 'error' ? <AlertTriangle size={20}/> : <ShoppingBag size={20} />} <span className="font-medium">{message}</span></div>;
};

export default function App() {
  const [view, setView] = useState('home'); 
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
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
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', phone: '', password: '', staffCode: '' });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetMode, setResetMode] = useState(false); // Forgot Password Mode

  const [activeTab, setActiveTab] = useState('profile'); 
  const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '' });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editProfileForm, setEditProfileForm] = useState({ name: '', phone: '' });
  const [bulkOrder, setBulkOrder] = useState({ productName: '', quantity: '', details: '', date: '' });

  // Admin State
  const [adminTab, setAdminTab] = useState('products');
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Frames', countInStock: 10, image: '', description: '' });
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
  
  const fetchProducts = async () => {
    try { const { data } = await axios.get(`${API_URL}/api/products`); setProducts(data); } catch (e) { setProducts([]); }
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
        if (existing) return prev.map(item => ((item._id || item.id) === prodId) ? { ...item, quantity: item.quantity + 1 } : item);
        return [...prev, { ...product, quantity: 1 }];
    });
    showToast(`Added ${product.name}`, 'success');
  };

  // --- RAZORPAY CHECKOUT ---
  const handleCheckout = async () => {
      if (!user) { setView('login'); showToast("Please login", "info"); return; }
      if (!user.addresses || user.addresses.length === 0) { 
          setView('account'); setActiveTab('profile'); 
          showToast("Please add an address first", "error"); 
          return; 
      }

      setIsLoading(true);
      try {
          const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
          if (!res) { showToast('Razorpay SDK failed to load', 'error'); return; }

          // 1. Create Order on Backend
          const itemsPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
          const { data: orderData } = await axios.post(`${API_URL}/api/orders`, {
              orderItems: cart, itemsPrice: itemsPrice
          }, { headers: { Authorization: `Bearer ${user.token}` } });

          // 2. Get Key
          const { data: key } = await axios.get(`${API_URL}/api/config/razorpay`);

          // 3. Open Razorpay
          const options = {
              key: key,
              amount: orderData.amount,
              currency: orderData.currency,
              name: "Shri Ganpati",
              description: "Art Order",
              order_id: orderData.id,
              handler: async function (response) {
                  // 4. Verify Payment
                  try {
                      await axios.post(`${API_URL}/api/orders/verify`, {
                          razorpay_order_id: response.razorpay_order_id,
                          razorpay_payment_id: response.razorpay_payment_id,
                          razorpay_signature: response.razorpay_signature,
                          orderItems: cart,
                          itemsPrice,
                          shippingAddress: user.addresses[0] // Default to first address
                      }, { headers: { Authorization: `Bearer ${user.token}` } });
                      
                      setCart([]);
                      setView('account'); setActiveTab('orders');
                      showToast("Payment Successful!", "success");
                  } catch (err) {
                      showToast("Payment Verification Failed", "error");
                  }
              },
              prefill: { name: user.name, email: user.email, contact: user.phone },
              theme: { color: "#b45309" },
          };
          const paymentObject = new window.Razorpay(options);
          paymentObject.open();

      } catch (error) { 
          showToast("Order Creation Failed", "error"); 
      } finally { setIsLoading(false); }
  };

  // --- ADMIN ACTIONS ---
  const handleAddProduct = async () => {
      try {
          await axios.post(`${API_URL}/api/products`, newProduct, { headers: { Authorization: `Bearer ${user.token}` } });
          showToast("Product Added!", "success");
          setNewProduct({ name: '', price: '', category: 'Frames', countInStock: 10, image: '', description: '' });
          fetchProducts();
      } catch (error) { showToast("Failed to Add Product", "error"); }
  };

  const handleDeleteProduct = async (id) => {
      if(!window.confirm("Delete this product?")) return;
      try {
          await axios.delete(`${API_URL}/api/products/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
          showToast("Product Deleted", "success");
          fetchProducts();
      } catch (error) { showToast("Failed to Delete", "error"); }
  };

  // --- AUTH LOGIC ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        const { data } = await axios.post(`${API_URL}/api/users/login`, { email: loginForm.phone, password: loginForm.password });
        setUser(data);
        if (data.isAdmin) setView('admin'); else setView('home');
        showToast(`Welcome ${data.name}!`, "success");
    } catch (error) { showToast("Login Failed", "error"); } finally { setIsLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        // If staff code matches, user becomes admin (handled in backend if logic exists, or here)
        // For simplicity, we assume backend doesn't handle code yet, but we will send it.
        // Actually, let's inject isAdmin: true if code is "admin123" (INSECURE but works for prototype)
        // Ideally backend handles this.
        let isAdmin = false;
        if(registerForm.staffCode === 'admin123') isAdmin = true;

        const { data } = await axios.post(`${API_URL}/api/users`, { ...registerForm, isAdmin });
        setUser(data);
        setView('home');
        showToast("Account created!", "success");
    } catch (error) { showToast("Registration Failed", "error"); } finally { setIsLoading(false); }
  };

  // Reset Logic (Simplified)
  const handleResetPassword = async (e) => {
      e.preventDefault();
      // Implementation depends on backend reset logic. For now just toast.
      showToast("Reset link sent to email (Demo)", "info");
      setResetMode(false);
  };

  // Switch to Staff View
  const goToStaffLogin = () => {
      // Clear forms to prevent old data showing up
      setLoginForm({ phone: '', password: '' });
      setRegisterForm({ name: '', email: '', phone: '', password: '', staffCode: '' });
      setIsRegistering(false); 
      setView('staff-login');
  };

  // --- RENDERERS ---
  const renderAdmin = () => (
      <div className="w-full px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
          <div className="flex gap-4 mb-6">
              <Button onClick={()=>setAdminTab('products')} variant={adminTab==='products'?'primary':'secondary'}>Manage Products</Button>
              <Button onClick={()=>setAdminTab('banners')} variant={adminTab==='banners'?'primary':'secondary'}>Banners</Button>
          </div>

          {adminTab === 'products' && (
              <div className="grid md:grid-cols-3 gap-8">
                  {/* Add Product Form */}
                  <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
                      <h3 className="font-bold mb-4">Add New Item</h3>
                      <div className="space-y-3">
                          <input placeholder="Name" className="w-full p-2 border rounded" value={newProduct.name} onChange={e=>setNewProduct({...newProduct, name: e.target.value})} />
                          <input placeholder="Price" type="number" className="w-full p-2 border rounded" value={newProduct.price} onChange={e=>setNewProduct({...newProduct, price: e.target.value})} />
                          <input placeholder="Image URL" className="w-full p-2 border rounded" value={newProduct.image} onChange={e=>setNewProduct({...newProduct, image: e.target.value})} />
                          <select className="w-full p-2 border rounded" value={newProduct.category} onChange={e=>setNewProduct({...newProduct, category: e.target.value})}>
                              {Object.keys(CATEGORY_HIERARCHY).map(c=><option key={c} value={c}>{c}</option>)}
                          </select>
                          <input placeholder="Stock" type="number" className="w-full p-2 border rounded" value={newProduct.countInStock} onChange={e=>setNewProduct({...newProduct, countInStock: e.target.value})} />
                          <Button onClick={handleAddProduct} className="w-full">Add Product</Button>
                      </div>
                  </div>
                  {/* Product List */}
                  <div className="md:col-span-2 space-y-2">
                      <h3 className="font-bold mb-4">Current Inventory</h3>
                      {products.map(p => (
                          <div key={p._id} className="flex justify-between items-center bg-white p-4 rounded shadow-sm border">
                              <div className="flex items-center gap-4">
                                  <img src={p.image} className="w-12 h-12 object-cover rounded"/>
                                  <div><p className="font-bold">{p.name}</p><p className="text-sm">₹{p.price}</p></div>
                              </div>
                              <Button variant="danger" onClick={() => handleDeleteProduct(p._id)}><Trash2 size={16}/></Button>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </div>
  );

  const renderAuth = (isStaff = false) => (
    <div className="max-w-md mx-auto my-20 bg-white p-8 rounded-2xl shadow-lg border border-stone-100">
        <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">{resetMode ? "Reset Password" : isStaff ? "Staff Login" : isRegistering ? "Create Account" : "Welcome Back"}</h2>
            {isStaff && <Badge>Admin Access</Badge>}
        </div>
        
        {resetMode ? (
            <form onSubmit={handleResetPassword} className="space-y-4">
                <input placeholder="Enter your registered email" className="w-full p-3 border rounded" required />
                <Button className="w-full">Send Reset Link</Button>
                <button type="button" onClick={() => setResetMode(false)} className="w-full text-center text-sm text-stone-500 hover:underline">Back to Login</button>
            </form>
        ) : (
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
                {isRegistering && <input placeholder="Full Name" className="w-full p-3 border rounded" value={registerForm.name} onChange={e => setRegisterForm({...registerForm, name: e.target.value})} required />}
                
                <input placeholder="Phone Number" className="w-full p-3 border rounded" value={isRegistering ? registerForm.phone : loginForm.phone} onChange={e => isRegistering ? setRegisterForm({...registerForm, phone: e.target.value}) : setLoginForm({...loginForm, phone: e.target.value})} required />
                
                {/* Staff Code Field */}
                {isRegistering && (
                    <input placeholder="Staff Code (Optional)" className="w-full p-3 border rounded bg-stone-50" value={registerForm.staffCode} onChange={e => setRegisterForm({...registerForm, staffCode: e.target.value})} />
                )}

                {isRegistering && <input placeholder="Email" className="w-full p-3 border rounded" value={registerForm.email} onChange={e => setRegisterForm({...registerForm, email: e.target.value})} required />}
                
                <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full p-3 border rounded pr-10" value={isRegistering ? registerForm.password : loginForm.password} onChange={e => isRegistering ? setRegisterForm({...registerForm, password: e.target.value}) : setLoginForm({...loginForm, password: e.target.value})} required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </div>

                {!isRegistering && <div className="flex justify-end"><button type="button" onClick={() => setResetMode(true)} className="text-sm text-amber-700 hover:underline">Forgot Password?</button></div>}

                <Button className="w-full" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin"/> : (isRegistering ? "Register" : "Login")}</Button>
                
                <div className="text-center mt-4 text-sm text-stone-500">
                    {isRegistering ? "Already have an account? " : "Don't have an account? "}
                    <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-amber-700 font-bold hover:underline">{isRegistering ? "Log in" : "Register"}</button>
                </div>
            </form>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-gray-900">
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200 w-full px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="text-xl font-serif font-bold text-amber-900">SGPF</span>
            <div className="hidden md:flex gap-6">
              <button onClick={() => setView('home')}>Home</button>
              <button onClick={() => setIsCategoryModalOpen(true)}>Categories</button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
                <button onClick={() => setView(user.isAdmin ? 'admin' : 'account')} className="flex items-center gap-2 hover:bg-stone-100 p-2 rounded-lg">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-800 font-bold text-xs">{user.name ? user.name[0] : 'U'}</div>
                </button>
            ) : <button onClick={() => setView('login')} className="p-2 hover:bg-stone-100 rounded-lg text-stone-600"><User size={22} /></button>}
            <button className="relative p-2" onClick={() => setView('cart')}><ShoppingCart size={22} /><Badge>{cart.length}</Badge></button>
          </div>
      </nav>

      <main className="w-full px-6 py-8 min-h-[calc(100vh-300px)]">
        {view === 'home' && (
            <>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {products.map(p => (
                        <div key={p._id} className="bg-white rounded-xl border p-4">
                            <img src={p.image} className="w-full h-48 object-cover rounded mb-4"/>
                            <h3 className="font-bold">{p.name}</h3>
                            <div className="flex justify-between items-center mt-2">
                                <span>₹{p.price}</span>
                                <Button onClick={() => addToCart(p)} className="p-2"><Plus size={16}/></Button>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        )}
        {view === 'cart' && <div className="max-w-4xl mx-auto"><h2 className="text-3xl font-bold mb-4">Cart</h2>{cart.map(i=><div key={i._id} className="flex justify-between p-4 bg-white mb-2">{i.name} - ₹{i.price} <Button onClick={()=>removeFromCart(i._id || i.id)} variant="danger">X</Button></div>)}<Button className="w-full mt-4" onClick={handleCheckout}>Pay Now</Button></div>}
        {view === 'admin' && renderAdmin()}
        {view === 'account' && (
            <div className="p-8 bg-white rounded shadow">
                <h2 className="text-2xl font-bold mb-4">My Profile</h2>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Email:</strong> {user.email}</p> {/* Email Fixed */}
                <h3 className="font-bold mt-6 mb-2">Saved Addresses</h3>
                {user.addresses?.map((a,i)=><div key={i} className="bg-stone-50 p-2 mb-2">{a.street}, {a.city}</div>)}
                <div className="mt-4 border-t pt-4"><h4 className="font-bold">Add Address</h4><input placeholder="Street" className="border p-2 w-full mt-2" value={newAddress.street} onChange={e=>setNewAddress({...newAddress, street: e.target.value})}/><input placeholder="City" className="border p-2 w-full mt-2" value={newAddress.city} onChange={e=>setNewAddress({...newAddress, city: e.target.value})}/><Button onClick={handleAddAddress} className="mt-2">Save Address</Button></div>
            </div>
        )}
        {(view === 'login' || view === 'register') && renderAuth(false)}
        {view === 'staff-login' && renderAuth(true)}
      </main>

      <footer className="bg-stone-900 text-stone-300 py-8 px-6 text-center">
          <p>© 2026 SGPF.</p>
          <button onClick={goToStaffLogin} className="text-xs opacity-50 hover:opacity-100 mt-4"><Lock size={10} className="inline"/> Staff Entrance</button>
      </footer>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}