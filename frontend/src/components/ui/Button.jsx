import React from 'react';

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2";
    const variants = {
        primary: "bg-amber-700 text-white hover:bg-amber-800 shadow-lg shadow-amber-200 active:scale-95 disabled:opacity-50",
        secondary: "bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 active:scale-95",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 active:scale-95",
        ghost: "text-gray-600 hover:bg-gray-100 active:scale-95",
        staff: "bg-stone-800 text-white hover:bg-black shadow-lg"
    };
    return <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>{children}</button>;
};

export default Button;
