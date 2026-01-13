import React from 'react';

const Badge = ({ children }) => <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center justify-center min-w-[18px]">{children}</span>;

export default Badge;
