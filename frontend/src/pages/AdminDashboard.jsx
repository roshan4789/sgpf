import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Users, BarChart3, Settings, Plus, Edit, Trash2, Search, X, Image as ImageIcon, CheckCircle, Upload, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('products');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState(null);

    // Data State
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [banners, setBanners] = useState([]);

    // Banner Form
    const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
    const [bannerForm, setBannerForm] = useState({ id: '', title: '', subtitle: '', desc: '', image: '' });

    // Forms
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [productForm, setProductForm] = useState({
        name: '', price: '', originalPrice: '', category: '', countInStock: '', description: '', image: '', mainCategory: ''
    });

    const [discount, setDiscount] = useState(0);

    // Auto-calculate discount when prices change
    useEffect(() => {
        if (productForm.originalPrice && productForm.price) {
            const orig = Number(productForm.originalPrice);
            const curr = Number(productForm.price);
            if (orig > 0 && curr <= orig) {
                setDiscount(Math.round(((orig - curr) / orig) * 100));
            } else {
                setDiscount(0);
            }
        }
    }, [productForm.price, productForm.originalPrice]);

    const handleDiscountChange = (e) => {
        const val = Number(e.target.value);
        setDiscount(val);
        if (productForm.originalPrice) {
            const orig = Number(productForm.originalPrice);
            const newPrice = Math.round(orig - (orig * val / 100));
            setProductForm(prev => ({ ...prev, price: newPrice }));
        }
    };

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

    useEffect(() => {
        if (!user || !user.isAdmin) {
            navigate('/');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const [prodRes, ordRes, banRes] = await Promise.all([
                axios.get(`${API_URL}/api/products?pageNumber=1`, config),
                axios.get(`${API_URL}/api/orders`, config),
                axios.get(`${API_URL}/api/banners`, config)
            ]);

            // Handle different product response structure
            setProducts(prodRes.data.products || prodRes.data);
            setOrders(ordRes.data);
            setBanners(banRes.data);
        } catch (e) {
            console.error("Dashboard Fetch Error", e);
            setToast({ message: "Failed to load dashboard data", type: "error" });
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        try {
            const { data } = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
            });
            setProductForm({ ...productForm, image: data.path });
        } catch (e) {
            setToast({ message: "Image upload failed", type: "error" });
        }
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = { ...productForm, discount };
            if (isEditingProduct) {
                // FIXED: Use PUT for editing
                await axios.put(`${API_URL}/api/products/${editingProductId}`, payload, config);
                setToast({ message: "Product Updated!", type: "success" });
            } else {
                await axios.post(`${API_URL}/api/products`, payload, config);
                setToast({ message: "Product Created!", type: "success" });
            }
            setIsProductModalOpen(false);
            fetchDashboardData(); // Refresh
        } catch (e) {
            setToast({ message: "Operation failed", type: "error" });
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await axios.delete(`${API_URL}/api/products/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
            setToast({ message: "Product Deleted", type: "success" });
            fetchDashboardData();
        } catch (e) {
            setToast({ message: "Delete failed", type: "error" });
        }
    };

    const openEditModal = (product) => {
        setProductForm({
            name: product.name,
            price: product.price,
            originalPrice: product.originalPrice || product.price,
            category: product.category,
            countInStock: product.countInStock,
            description: product.description,
            image: product.image,
            mainCategory: product.mainCategory
        });
        setDiscount(product.discount || 0);
        setEditingProductId(product._id || product.id);
        setIsEditingProduct(true);
        setIsProductModalOpen(true);
    };

    const openAddModal = () => {
        setProductForm({ name: '', price: '', originalPrice: '', category: '', countInStock: '', description: '', image: '', mainCategory: '' });
        setDiscount(0);
        setIsEditingProduct(false);
        setIsProductModalOpen(true);
    };

    const handleSaveBanner = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Since backend replaces all banners, we just update the local array and send it back
            // But wait, existing backend endpoint `POST /` accepts an ARRAY and replaces EVERYTHING.
            // So we need to manage the array locally and send the whole thing.

            let updatedBanners;
            if (bannerForm.id) {
                // Edit existing
                updatedBanners = banners.map(b => (b._id === bannerForm.id || b.id === bannerForm.id) ? { ...b, ...bannerForm } : b);
            } else {
                // Add new
                updatedBanners = [...banners, bannerForm];
            }

            // Clean up ID from form before sending? The backend might just ignore it or re-generate.
            // Actually, let's just send the array.

            await axios.post(`${API_URL}/api/banners`, updatedBanners, config);
            setToast({ message: "Banners Updated!", type: "success" });
            fetchDashboardData();
            setIsBannerModalOpen(false);
        } catch (e) {
            setToast({ message: "Failed to save banner", type: "error" });
        }
    };

    const handleDeleteBanner = async (index) => {
        if (!window.confirm("Delete this banner?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const updatedBanners = banners.filter((_, i) => i !== index);
            await axios.post(`${API_URL}/api/banners`, updatedBanners, config);
            setToast({ message: "Banner Deleted", type: "success" });
            fetchDashboardData();
        } catch (e) {
            setToast({ message: "Delete failed", type: "error" });
        }
    };

    const openBannerModal = (banner = null) => {
        if (banner) {
            setBannerForm({ ...banner, id: banner._id || banner.id });
        } else {
            setBannerForm({ id: '', title: '', subtitle: '', desc: '', image: '' });
        }
        setIsBannerModalOpen(true);
    };

    const handleBannerImageUpload = async (e) => {
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);
        try {
            const { data } = await axios.post(`${API_URL}/api/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
            });
            setBannerForm(prev => ({ ...prev, image: data.path }));
        } catch (e) {
            setToast({ message: "Image upload failed", type: "error" });
        }
    };


    return (
        <div className="flex h-screen bg-stone-50">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Sidebar */}
            <aside className="w-64 bg-stone-900 text-white hidden md:flex flex-col">
                <div className="p-6">
                    <h2 className="text-2xl font-serif font-bold">SGPF Admin</h2>
                </div>
                <nav className="flex-1 px-4 space-y-2">
                    {[
                        { id: 'products', label: 'Products', icon: Package },
                        { id: 'banners', label: 'Banners', icon: ImageIcon },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${activeTab === tab.id ? 'bg-amber-700 text-white' : 'text-stone-400 hover:bg-stone-800'}`}
                        >
                            <tab.icon size={20} /> {tab.label}
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-stone-800">
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-3 px-4 py-3 text-stone-400 hover:text-white transition-colors">
                        <LogOut size={20} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-8">
                {activeTab === 'products' && (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-stone-900">Products</h1>
                            <Button onClick={openAddModal}><Plus size={20} /> Add Product</Button>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-stone-50 text-stone-500 text-sm uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Stock</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {products.map(p => (
                                            <tr key={p._id || p.id} className="hover:bg-stone-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="" />
                                                        <span className="font-medium text-stone-900">{p.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-stone-600">{p.category}</td>
                                                <td className="px-6 py-4 font-bold text-stone-900">₹{p.price}</td>
                                                <td className="px-6 py-4">{p.countInStock}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => openEditModal(p)} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg mr-2"><Edit size={16} /></button>
                                                    <button onClick={() => handleDeleteProduct(p._id || p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'banners' && (
                    <div>
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-3xl font-bold text-stone-900">Banners</h1>
                            <Button onClick={() => openBannerModal()}><Plus size={20} /> Add Banner</Button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {banners.map((banner, index) => (
                                <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row border border-stone-200">
                                    <div className="w-full md:w-64 h-48 bg-stone-100 flex-shrink-0">
                                        <img src={banner.image} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">{banner.subtitle}</div>
                                            <h3 className="text-2xl font-bold text-stone-900 mb-2">{banner.title}</h3>
                                            <p className="text-stone-500">{banner.desc}</p>
                                        </div>
                                        <div className="mt-4 flex gap-3">
                                            <button onClick={() => openBannerModal(banner)} className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 font-medium transition-colors">Edit</button>
                                            <button onClick={() => handleDeleteBanner(index)} className="px-4 py-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 font-medium transition-colors">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {banners.length === 0 && <div className="text-center py-20 text-stone-400">No banners found. Add one!</div>}
                        </div>
                    </div>
                )}

                {/* Product Modal */}
                {isProductModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
                            <h2 className="text-2xl font-bold mb-6">{isEditingProduct ? 'Edit Product' : 'Add Product'}</h2>
                            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input placeholder="Name" className="px-4 py-3 border rounded-lg md:col-span-2" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />

                                <div className="space-y-1">
                                    <label className="text-xs text-stone-500 font-bold ml-1">Original Price</label>
                                    <input placeholder="Original Price" type="number" className="w-full px-4 py-3 border rounded-lg" value={productForm.originalPrice} onChange={e => setProductForm({ ...productForm, originalPrice: e.target.value })} />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-stone-500 font-bold ml-1">Discount %</label>
                                    <div className="flex items-center gap-2">
                                        <input type="range" min="0" max="100" className="flex-1" value={discount} onChange={handleDiscountChange} />
                                        <span className="w-12 text-center font-bold bg-amber-100 rounded px-1">{discount}%</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-stone-500 font-bold ml-1">Sale Price</label>
                                    <input placeholder="Sale Price (Final)" type="number" className="w-full px-4 py-3 border rounded-lg font-bold text-amber-700" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
                                </div>

                                <input placeholder="Category" className="px-4 py-3 border rounded-lg" value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} required />
                                <input placeholder="Main Category (e.g., Frames)" className="px-4 py-3 border rounded-lg" value={productForm.mainCategory} onChange={e => setProductForm({ ...productForm, mainCategory: e.target.value })} />
                                <input placeholder="Stock Count" type="number" className="px-4 py-3 border rounded-lg" value={productForm.countInStock} onChange={e => setProductForm({ ...productForm, countInStock: e.target.value })} required />
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Image</label>
                                    <div className="flex gap-4 items-center">
                                        <input type="text" placeholder="Image URL" className="flex-1 px-4 py-3 border rounded-lg" value={productForm.image} onChange={e => setProductForm({ ...productForm, image: e.target.value })} />
                                        <span>OR</span>
                                        <label className="cursor-pointer bg-stone-100 px-4 py-3 rounded-lg hover:bg-stone-200">
                                            <Upload size={16} /> <input type="file" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                </div>
                                <textarea placeholder="Description" className="md:col-span-2 px-4 py-3 border rounded-lg h-32" value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })}></textarea>

                                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                    <Button variant="secondary" onClick={() => setIsProductModalOpen(false)} type="button">Cancel</Button>
                                    <Button type="submit">Save Product</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Banner Modal */}
                {isBannerModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white rounded-2xl w-full max-w-lg p-6">
                            <h2 className="text-2xl font-bold mb-6">{bannerForm.id ? 'Edit Banner' : 'Add Banner'}</h2>
                            <form onSubmit={handleSaveBanner} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input className="w-full px-4 py-3 border rounded-lg" value={bannerForm.title} onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })} required placeholder="e.g., Summer Sale" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                                    <input className="w-full px-4 py-3 border rounded-lg" value={bannerForm.subtitle} onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })} required placeholder="e.g., Up to 50% Off" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea className="w-full px-4 py-3 border rounded-lg h-24" value={bannerForm.desc} onChange={e => setBannerForm({ ...bannerForm, desc: e.target.value })} required placeholder="Short description..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image</label>
                                    <div className="flex gap-4 items-center">
                                        <input type="text" placeholder="Image URL" className="flex-1 px-4 py-3 border rounded-lg" value={bannerForm.image} onChange={e => setBannerForm({ ...bannerForm, image: e.target.value })} />
                                        <span>OR</span>
                                        <label className="cursor-pointer bg-stone-100 px-4 py-3 rounded-lg hover:bg-stone-200">
                                            <Upload size={16} /> <input type="file" className="hidden" onChange={handleBannerImageUpload} />
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <Button variant="secondary" onClick={() => setIsBannerModalOpen(false)} type="button">Cancel</Button>
                                    <Button type="submit">Save Banner</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;
