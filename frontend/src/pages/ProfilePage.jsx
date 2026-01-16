import React, { useState, useEffect } from 'react';
import { User, MapPin, Package, Heart, LogOut, Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../components/ui/Button';
import axios from 'axios';
import Toast from '../components/ui/Toast';

const ProfilePage = () => {
    const { user, logout, updateProfile } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
    const [orders, setOrders] = useState([]);
    const [wishlist, setWishlist] = useState([]);
    const [wishlistLoading, setWishlistLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [loading, setLoading] = useState(false);

    // Forms
    const [editForm, setEditForm] = useState({ name: '', phone: '' });
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '' });
    const [editingAddressIndex, setEditingAddressIndex] = useState(null);
    const [editAddressForm, setEditAddressForm] = useState({ street: '', city: '', state: '', zip: '' });

    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        setEditForm({ name: user.name || '', phone: user.phone || '' });
        fetchOrders();
        fetchWishlist();
    }, [user, navigate]);

    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab && ['profile', 'addresses', 'orders', 'wishlist'].includes(tab)) {
            setActiveTab(tab);
        }
    }, [searchParams]);

    useEffect(() => {
        if (activeTab === 'wishlist' && user) {
            fetchWishlist();
        }
    }, [activeTab, user]);

    useEffect(() => {
        const handleWishlistUpdate = () => {
            if (activeTab === 'wishlist') {
                fetchWishlist();
            }
        };

        window.addEventListener('wishlistUpdated', handleWishlistUpdate);
        return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdate);
    }, [activeTab]);

    const fetchOrders = async () => {
        if (!user) return;
        try {
            const { data } = await axios.get(`${API_URL}/api/orders/myorders`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setOrders(data);
        } catch (e) {
            console.error("Error fetching orders");
        }
    };

    const fetchWishlist = async () => {
        if (!user) {
            return;
        }
        setWishlistLoading(true);
        try {
            const response = await axios.get(`${API_URL}/api/users/wishlist`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setWishlist(response.data || []);
        } catch (e) {
            console.error("Error fetching wishlist:", e);
            setWishlist([]); // Set empty array on error
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            await updateProfile(editForm);
            setToast({ message: "Profile Updated Successfully", type: "success" });
        } catch (e) {
            setToast({ message: "Failed to update profile", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile({ address: newAddress });
            setToast({ message: "Address added!", type: "success" });
            setNewAddress({ street: '', city: '', state: '', zip: '' });
        } catch (e) {
            setToast({ message: "Failed to add address", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleEditAddress = (index) => {
        const address = user.addresses[index];
        setEditAddressForm(address);
        setEditingAddressIndex(index);
    };

    const handleUpdateAddress = async (index) => {
        setLoading(true);
        try {
            const updatedAddresses = [...user.addresses];
            updatedAddresses[index] = editAddressForm;
            await updateProfile({ addresses: updatedAddresses });
            setToast({ message: "Address updated!", type: "success" });
            setEditingAddressIndex(null);
        } catch (e) {
            setToast({ message: "Failed to update address", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAddress = async (index) => {
        if (!window.confirm("Are you sure you want to delete this address?")) return;
        setLoading(true);
        try {
            const updatedAddresses = user.addresses.filter((_, i) => i !== index);
            await updateProfile({ addresses: updatedAddresses });
            setToast({ message: "Address deleted!", type: "success" });
        } catch (e) {
            setToast({ message: "Failed to delete address", type: "error" });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 md:px-8">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2">My Account</h1>
            <p className="text-stone-500 mb-12">Manage your profile, addresses, and orders</p>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden sticky top-24">
                        <div className="h-24 bg-gradient-to-r from-amber-600 to-amber-700"></div>
                        <div className="p-6 -mt-12 relative z-10">
                            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg mx-auto mb-4">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <h3 className="font-bold text-lg text-stone-900 text-center">{user.name}</h3>
                            <p className="text-sm text-stone-500 text-center mb-6">{user.email}</p>

                            <Button variant="danger" onClick={() => { logout(); navigate('/'); }} className="w-full">
                                <LogOut size={16} /> Sign Out
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <div className="flex flex-wrap gap-2 mb-8">
                        {[
                            { id: 'profile', label: 'Profile', icon: User },
                            { id: 'addresses', label: 'Addresses', icon: MapPin },
                            { id: 'orders', label: 'Orders', icon: Package },
                            { id: 'wishlist', label: 'Wishlist', icon: Heart },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                                    ? 'bg-amber-700 text-white shadow-lg'
                                    : 'bg-white text-stone-600 border border-stone-200 hover:border-amber-300'
                                    }`}
                            >
                                <tab.icon size={16} /> {tab.label}
                            </button>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-stone-900">Edit Profile</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                                        <input className="w-full px-4 py-3 border border-stone-200 rounded-lg" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-2">Phone Number</label>
                                        <input className="w-full px-4 py-3 border border-stone-200 rounded-lg" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} placeholder="Enter phone number" />
                                    </div>
                                </div>
                                <Button onClick={handleUpdateProfile} disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xl font-bold text-stone-900 mb-4">Saved Addresses</h3>
                                    {user.addresses && user.addresses.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {user.addresses.map((addr, i) => (
                                                <div key={i} className="p-4 border border-stone-200 rounded-lg bg-stone-50">
                                                    {editingAddressIndex === i ? (
                                                        <div className="space-y-3">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                <input
                                                                    placeholder="Street Address"
                                                                    className="px-3 py-2 border border-stone-300 rounded-lg text-sm"
                                                                    value={editAddressForm.street}
                                                                    onChange={e => setEditAddressForm({ ...editAddressForm, street: e.target.value })}
                                                                />
                                                                <input
                                                                    placeholder="City"
                                                                    className="px-3 py-2 border border-stone-300 rounded-lg text-sm"
                                                                    value={editAddressForm.city}
                                                                    onChange={e => setEditAddressForm({ ...editAddressForm, city: e.target.value })}
                                                                />
                                                                <input
                                                                    placeholder="State"
                                                                    className="px-3 py-2 border border-stone-300 rounded-lg text-sm"
                                                                    value={editAddressForm.state}
                                                                    onChange={e => setEditAddressForm({ ...editAddressForm, state: e.target.value })}
                                                                />
                                                                <input
                                                                    placeholder="ZIP Code"
                                                                    className="px-3 py-2 border border-stone-300 rounded-lg text-sm"
                                                                    value={editAddressForm.zip}
                                                                    onChange={e => setEditAddressForm({ ...editAddressForm, zip: e.target.value })}
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateAddress(i)}
                                                                    disabled={loading}
                                                                    className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                                >
                                                                    <Check size={16} /> Save
                                                                </button>
                                                                <button
                                                                    onClick={() => setEditingAddressIndex(null)}
                                                                    className="flex items-center gap-1 px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-700 rounded-lg text-sm font-medium transition-colors"
                                                                >
                                                                    <X size={16} /> Cancel
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <p className="font-semibold text-stone-900">{addr.street}</p>
                                                                <p className="text-sm text-stone-600">{addr.city}, {addr.state} {addr.zip}</p>
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleEditAddress(i)}
                                                                    className="p-2 hover:bg-stone-200 rounded-lg transition-colors"
                                                                    title="Edit address"
                                                                >
                                                                    <Edit2 size={16} className="text-stone-600" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteAddress(i)}
                                                                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                                                                    title="Delete address"
                                                                >
                                                                    <Trash2 size={16} className="text-red-600" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-stone-500">No saved addresses yet.</p>
                                    )}
                                </div>

                                <div className="border-t pt-6">
                                    <h4 className="font-bold text-stone-900 mb-4">Add New Address</h4>
                                    <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input placeholder="Street Address" className="px-4 py-3 border border-stone-200 rounded-lg" value={newAddress.street} onChange={e => setNewAddress({ ...newAddress, street: e.target.value })} required />
                                        <input placeholder="City" className="px-4 py-3 border border-stone-200 rounded-lg" value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} required />
                                        <input placeholder="State" className="px-4 py-3 border border-stone-200 rounded-lg" value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} required />
                                        <input placeholder="ZIP Code" className="px-4 py-3 border border-stone-200 rounded-lg" value={newAddress.zip} onChange={e => setNewAddress({ ...newAddress, zip: e.target.value })} required />
                                        <div className="md:col-span-2">
                                            <Button disabled={loading}><Plus size={16} /> Save Address</Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h3 className="text-xl font-bold text-stone-900 mb-6">Your Orders</h3>
                                {orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map(order => (
                                            <div key={order._id} className="p-6 border border-stone-200 rounded-2xl hover:shadow-md transition-shadow">
                                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                                    <div>
                                                        <p className="text-xs text-stone-500 uppercase font-bold">Order ID</p>
                                                        <p className="font-mono text-sm text-stone-900">#{order._id}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-stone-500 uppercase font-bold">Total</p>
                                                        <p className="font-bold text-amber-700">₹{order.totalPrice}</p>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-800'}`}>
                                                        {order.isDelivered ? 'DELIVERED' : 'PROCESSING'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-stone-500 text-center py-12">No orders yet.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'wishlist' && (
                            <div>
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-stone-900">Your Wishlist</h3>
                                    <button 
                                        onClick={fetchWishlist}
                                        className="px-4 py-2 bg-amber-700 text-white rounded-lg text-sm hover:bg-amber-800"
                                    >
                                        Refresh Wishlist
                                    </button>
                                </div>
                                {wishlistLoading ? (
                                    <div className="flex justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
                                    </div>
                                ) : wishlist.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {wishlist.map(item => (
                                            <div key={item._id} className="bg-white rounded-xl border border-stone-200 overflow-hidden hover:shadow-lg transition-all duration-300">
                                                <Link to={`/product/${item._id}`} className="block">
                                                    <div className="aspect-square bg-stone-50 overflow-hidden">
                                                        <img
                                                            src={item.image}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                            onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
                                                        />
                                                    </div>
                                                    <div className="p-4">
                                                        <h4 className="font-semibold text-stone-900 mb-2 line-clamp-2">{item.name}</h4>
                                                        <div className="flex items-baseline gap-2">
                                                            <span className="text-lg font-bold text-stone-900">₹{item.price.toLocaleString()}</span>
                                                            {item.originalPrice && item.originalPrice > item.price && (
                                                                <span className="text-sm text-stone-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                                                            )}
                                                        </div>
                                                        {item.countInStock === 0 ? (
                                                            <div className="mt-2 text-red-600 text-sm font-medium">Out of Stock</div>
                                                        ) : item.countInStock < 5 ? (
                                                            <div className="mt-2 text-orange-600 text-sm font-medium">Low Stock</div>
                                                        ) : (
                                                            <div className="mt-2 text-green-600 text-sm font-medium">In Stock</div>
                                                        )}
                                                    </div>
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <Heart size={48} className="mx-auto text-stone-300 mb-4" />
                                        <p className="text-stone-500 mb-4">Your wishlist is empty</p>
                                        <Button onClick={() => navigate('/')}>Start Shopping</Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
