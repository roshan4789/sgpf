import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/logo.jpeg';

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
                                <img 
                                    src={logo} 
                                    alt="Shri Ganpati" 
                                    className="w-12 h-12 object-contain rounded-lg"
                                />
                                <span>Shri Ganpati</span>
                            </div>
                            <p className="text-stone-400 leading-relaxed text-sm">Premium photo frames, religious wall art, and custom framing solutions.</p>
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
                                <li><Link to="/returns" className="hover:text-amber-500 transition-colors font-medium">Returns & Exchange</Link></li>
                                <li><Link to="/contact" className="hover:text-amber-500 transition-colors font-medium">Contact Us</Link></li>
                            </ul>
                        </div>

                        {/* Newsletter */}
                        <div>
                            <h4 className="font-bold text-white mb-6">Stay Updated</h4>
                            <p className="text-stone-400 leading-relaxed text-sm mb-4">Subscribe to get exclusive offers and new product updates.</p>
                            <div className="flex gap-2">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="flex-1 px-4 py-2 rounded-lg border border-stone-700 bg-stone-800 text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <button className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors">
                                    Subscribe
                                </button>
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
