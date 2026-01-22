import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, CheckCircle, Truck, Clock, LogOut } from 'lucide-react';
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
                <h2 className="text-2xl font-bold text-stone-900 mb-6">Order Management</h2>
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
            </main>
        </div>
    );
};

export default WorkerDashboard;
