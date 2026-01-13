import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Footer = () => {
    const { user } = useAuth();
    const [isStaffMenuOpen, setIsStaffMenuOpen] = useState(false);

    return (
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
                        </div>

                        {/* Collections */}
                        <div>
                            <h4 className="font-bold text-white mb-6">Collections</h4>
                            <ul className="space-y-3 text-stone-400 text-sm">
                                <li><Link to="/?category=Posters" className="hover:text-amber-500 transition-colors font-medium">Posters</Link></li>
                                <li><Link to="/?category=Frames" className="hover:text-amber-500 transition-colors font-medium">Frames</Link></li>
                                <li><Link to="/?category=Pure%20Tanjore%20Work" className="hover:text-amber-500 transition-colors font-medium">Tanjore Art</Link></li>
                                <li><Link to="/?category=MDF%20Cutouts" className="hover:text-amber-500 transition-colors font-medium">MDF Cutouts</Link></li>
                            </ul>
                        </div>

                        {/* Support */}
                        <div>
                            <h4 className="font-bold text-white mb-6">Support</h4>
                            <ul className="space-y-3 text-stone-400 text-sm">
                                <li><Link to="/track-order" className="hover:text-amber-500 transition-colors font-medium">Track Order</Link></li>
                                <li><Link to="/shipping" className="hover:text-amber-500 transition-colors font-medium">Shipping Info</Link></li>
                                <li><Link to="/returns" className="hover:text-amber-500 transition-colors font-medium">Returns & Exchange</Link></li>
                                <li><Link to="/contact" className="hover:text-amber-500 transition-colors font-medium">Contact Us</Link></li>
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
                                <Link to="/privacy" className="text-stone-400 hover:text-amber-500 transition-colors">Privacy Policy</Link>
                                <Link to="/terms" className="text-stone-400 hover:text-amber-500 transition-colors">Terms of Service</Link>
                                {!user && (
                                    <div className="relative">
                                        <button
                                            onClick={() => setIsStaffMenuOpen(!isStaffMenuOpen)}
                                            className="text-stone-400 hover:text-amber-500 transition-colors flex items-center gap-1 opacity-50 hover:opacity-100"
                                        >
                                            <Lock size={14} /> Staff
                                        </button>
                                        {isStaffMenuOpen && (
                                            <div className="absolute bottom-full right-0 mb-2 w-40 bg-stone-800 border border-stone-700 rounded-lg shadow-xl z-50">
                                                <Link
                                                    to="/staff-login"
                                                    className="block w-full text-left px-4 py-3 hover:bg-stone-700 text-stone-300 hover:text-amber-500 transition-colors text-sm font-medium"
                                                >
                                                    🔐 Staff Login
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
