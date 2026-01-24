import React from 'react';
import { Loader2 } from 'lucide-react';

const FullPageLoader = ({ text }) => {
    return (
        <div className="fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="w-12 h-12 text-amber-600 animate-spin mb-4" />
            <h2 className="text-xl font-serif font-bold text-stone-800 animate-pulse">{text}</h2>
        </div>
    );
};

export default FullPageLoader;
