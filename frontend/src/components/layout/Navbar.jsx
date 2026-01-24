import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, ShoppingCart, User, LogOut, Lock, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import Badge from '../ui/Badge';
import { CATEGORY_HIERARCHY } from '../../config/constants';
import logo from '../../assets/logo.jpeg';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const navigate = useNavigate();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClick = () => {
            // implemented with onBlur/focus or simpler click handlers usually.
            // For now relies on explicit states.
        };
        // Keeping it simple: clicking links usually closes menus.
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/?keyword=${searchQuery}`);
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <>
            <nav className="sticky top-0 z-40 bg-white border-b border-stone-200 w-full px-4 md:px-8 h-16 flex items-center shadow-sm">
                {/* LEFT SECTION - LOGO */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-200">
                        <img
                            src={logo}
                            alt="SGPF"
                            className="w-12 h-12 object-contain rounded-lg"
                        />
                        <span className="text-xl font-bold text-stone-900 tracking-tight">SGPF</span>
                    </Link>
                </div>

                {/* SPACER */}
                <div className="flex-1"></div>

                {/* RIGHT SECTION - SEARCH & ACTIONS */}
                <div className="flex items-center gap-3">
                    {/* SEARCH */}
                    <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-lg border border-stone-200 focus-within:border-stone-400 focus-within:bg-white transition-all w-64">
                        <Search size={16} className="text-stone-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none outline-none text-sm flex-1 text-stone-900 placeholder-stone-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>

                    {/* User Menu */}
                    {user ? (
                        <div className="relative group">
                            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center hover:opacity-90 transition-opacity">
                                <div className="w-9 h-9 bg-gradient-to-br from-stone-700 to-stone-900 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {(user?.name || 'U').charAt(0).toUpperCase()}
                                </div>
                            </button>

                            {isProfileMenuOpen && (
                                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 overflow-hidden z-50">
                                    <div className="p-4 border-b border-stone-100 bg-stone-50">
                                        <p className="font-bold text-stone-900 text-sm">{user.name}</p>
                                        <p className="text-xs text-stone-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1">
                                        {user.isAdmin && (
                                            <Link to="/admin" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-sm transition-colors">
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        {!user.isAdmin && !user.isWorker && (
                                            <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-sm transition-colors">
                                                My Account
                                            </Link>
                                        )}
                                        {!user.isAdmin && !user.isWorker && (
                                            <Link to="/cart" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-sm transition-colors">
                                                My Cart
                                            </Link>
                                        )}
                                        {user.isWorker && (
                                            <Link to="/worker" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2.5 hover:bg-stone-50 text-stone-700 text-sm transition-colors">
                                                Worker Panel
                                            </Link>
                                        )}
                                        <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm transition-colors border-t border-stone-100">Sign Out</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="p-2 hover:bg-stone-100 rounded-lg text-stone-600 hover:text-stone-900 transition-colors"><User size={20} /></Link>
                    )}

                    {/* Cart Icon */}
                    {!user?.isAdmin && !user?.isWorker && (
                        <Link to="/cart" className="relative p-2 hover:bg-stone-100 rounded-lg transition-colors text-stone-700 hover:text-stone-900">
                            <ShoppingCart size={20} />
                            {cart.length > 0 && <Badge>{cart.length}</Badge>}
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden p-2 hover:bg-stone-100 rounded-lg transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </nav>

            {/* Category Modal (Simple Version) */}
            {isCategoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsCategoryModalOpen(false)}>
                    <div className="bg-white p-6 rounded-2xl max-w-lg w-full m-4 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Shop by Category</h3>
                            <button onClick={() => setIsCategoryModalOpen(false)}><X /></button>
                        </div>
                        <div className="grid gap-2">
                            <Link to="/?category=All" onClick={() => setIsCategoryModalOpen(false)} className="p-3 bg-amber-50 rounded-lg font-bold text-amber-800">All Categories</Link>
                            {Object.keys(CATEGORY_HIERARCHY).map(cat => (
                                <Link key={cat} to={`/?category=${cat}`} onClick={() => setIsCategoryModalOpen(false)} className="p-3 hover:bg-stone-50 rounded-lg flex justify-between">
                                    <span>{cat}</span>
                                    <ChevronRight size={16} className="text-stone-400" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
