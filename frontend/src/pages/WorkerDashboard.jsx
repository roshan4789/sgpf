import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, BarChart3, CheckCircle, Truck, Clock, Search, LogOut, AlertTriangle, Box } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';

const WorkerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [stockUpdates, setStockUpdates] = useState({});

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

    useEffect(() => {
        if (!user || (!user.isWorker && !user.isAdmin)) {
            navigate('/');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const ordRes = await axios.get(`${API_URL}/api/orders/worker/pending`, config);
            setOrders(ordRes.data);

            // Fetch all products for stock management
            const prodRes = await axios.get(`${API_URL}/api/products?pageNumber=1`, config);
            setProducts(prodRes.data.products || []);
        } catch (e) {
            console.error('Failed to load data:', e);
            setToast({ message: "Failed to load data", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateOrderStatus = async (id, status) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/api/orders/${id}/status`, { status }, config);
            fetchData();
            setToast({ message: "Order Updated", type: "success" });
        } catch (e) {
            console.error('Update failed:', e);
            setToast({ message: "Update Failed", type: "error" });
        }
    };

    const handleUpdateStock = async (productId) => {
        const newStock = stockUpdates[productId];
        if (newStock === undefined || newStock === '') return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`${API_URL}/api/products/${productId}/stock`, { countInStock: Number(newStock) }, config);
            setToast({ message: "Stock Updated", type: "success" });
            setStockUpdates({ ...stockUpdates, [productId]: '' });
            fetchData();
        } catch (e) {
            console.error('Stock update failed:', e);
            setToast({ message: "Stock Update Failed", type: "error" });
        }
    };

    const getStockColor = (stock) => {
        if (stock === 0) return 'text-red-600 bg-red-50';
        if (stock < 5) return 'text-red-600 bg-red-50';
        if (stock < 20) return 'text-amber-600 bg-amber-50';
        return 'text-green-600 bg-green-50';
    };

    const lowStockCount = products.filter(p => p.countInStock < 5).length;

    return (
        <div className="min-h-screen bg-stone-50">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <header className="bg-stone-900 text-white p-4 flex justify-between items-center shadow-md">
                <div className="flex items-center gap-3">
                    <div className="bg-amber-700 p-2 rounded-lg"><Package size={20} /></div>
                    <h1 className="font-bold text-xl">SGPF Worker Panel</h1>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-stone-300">Welcome, {user.name}</p>
                    <button onClick={() => { logout(); navigate('/'); }} className="bg-stone-800 hover:bg-red-900 px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2">
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 md:p-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
                        <div>
                            <p className="text-stone-500 text-sm font-bold uppercase">Pending Orders</p>
                            <p className="text-3xl font-bold text-amber-600">{orders.filter(o => !o.isDelivered).length}</p>
                        </div>
                        <div className="bg-amber-50 p-3 rounded-xl text-amber-600"><Clock size={24} /></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
                        <div>
                            <p className="text-stone-500 text-sm font-bold uppercase">Completed</p>
                            <p className="text-3xl font-bold text-green-600">{orders.filter(o => o.isDelivered).length}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl text-green-600"><CheckCircle size={24} /></div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
                        <div>
                            <p className="text-stone-500 text-sm font-bold uppercase">Low Stock Items</p>
                            <p className="text-3xl font-bold text-red-600">{lowStockCount}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-xl text-red-600"><AlertTriangle size={24} /></div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'orders' ? 'bg-amber-700 text-white shadow-lg' : 'bg-white text-stone-600 border border-stone-200'}`}
                    >
                        <Package size={18} className="inline mr-2" />Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'stock' ? 'bg-amber-700 text-white shadow-lg' : 'bg-white text-stone-600 border border-stone-200'}`}
                    >
                        <Box size={18} className="inline mr-2" />Stock Management
                    </button>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div>
                        <h2 className="text-2xl font-bold text-stone-900 mb-6">Recent Orders</h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-stone-50 text-stone-500 text-sm uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Order ID</th>
                                            <th className="px-6 py-4">Customer</th>
                                            <th className="px-6 py-4">Items</th>
                                            <th className="px-6 py-4">Total</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {orders.map(order => (
                                            <tr key={order._id} className="hover:bg-stone-50">
                                                <td className="px-6 py-4 font-mono text-xs">{order._id}</td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-stone-900">{order.user?.name || 'Guest'}</p>
                                                    <p className="text-xs text-stone-500">{order.shippingAddress?.city}</p>
                                                </td>
                                                <td className="px-6 py-4 text-xs max-w-xs truncate">
                                                    {order.orderItems.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                                                </td>
                                                <td className="px-6 py-4 font-bold">₹{order.totalPrice}</td>
                                                <td className="px-6 py-4">
                                                    {order.isDelivered ? (
                                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><CheckCircle size={12} /> Delivered</span>
                                                    ) : (
                                                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Clock size={12} /> Pending</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {!order.isDelivered && (
                                                        <Button onClick={() => handleUpdateOrderStatus(order._id, 'delivered')} className="text-xs py-1.5 px-3">
                                                            Mark Delivered
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stock Tab */}
                {activeTab === 'stock' && (
                    <div>
                        <h2 className="text-2xl font-bold text-stone-900 mb-6">Product Stock Management</h2>
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-stone-50 text-stone-500 text-sm uppercase">
                                        <tr>
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4">Price</th>
                                            <th className="px-6 py-4">Current Stock</th>
                                            <th className="px-6 py-4">Update Stock</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {products.map(product => (
                                            <tr key={product._id} className="hover:bg-stone-50">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
                                                        <div>
                                                            <p className="font-bold text-stone-900">{product.name}</p>
                                                            <p className="text-xs text-stone-500">{product.mainCategory}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm">{product.category}</td>
                                                <td className="px-6 py-4 font-bold">₹{product.price}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStockColor(product.countInStock)}`}>
                                                        {product.countInStock} units
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder={product.countInStock}
                                                            value={stockUpdates[product._id] || ''}
                                                            onChange={(e) => setStockUpdates({ ...stockUpdates, [product._id]: e.target.value })}
                                                            className="w-24 px-3 py-2 border border-stone-300 rounded-lg text-sm"
                                                        />
                                                        <Button
                                                            onClick={() => handleUpdateStock(product._id)}
                                                            className="text-xs py-2 px-3"
                                                            disabled={!stockUpdates[product._id]}
                                                        >
                                                            Update
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default WorkerDashboard;
