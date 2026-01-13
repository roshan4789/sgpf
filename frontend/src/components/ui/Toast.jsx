import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Package } from 'lucide-react';

const Toast = ({ message, type, onClose }) => {
    useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); }, [onClose]);
    return <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-slide-up ${type === 'success' ? 'bg-green-600 text-white' : type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>{type === 'success' ? <CheckCircle size={20} /> : type === 'error' ? <AlertTriangle size={20} /> : <Package size={20} />} <span className="font-medium">{message}</span></div>;
};

export default Toast;
