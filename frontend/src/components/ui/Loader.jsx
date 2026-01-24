import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Spinner - Small inline loader for buttons and inline elements
 * @param {number} size - Size in pixels (default: 16)
 * @param {string} className - Additional CSS classes
 */
export const Spinner = ({ size = 16, className = '' }) => (
    <Loader2 className={`animate-spin ${className}`} size={size} />
);

/**
 * LoadingButton - Button with loading state
 * @param {boolean} loading - Whether button is in loading state
 * @param {string} loadingText - Text to show when loading
 * @param {string} children - Button text when not loading
 */
export const LoadingButton = ({ loading, loadingText = 'Loading...', children, className = '', ...props }) => (
    <button
        disabled={loading}
        className={`flex items-center justify-center gap-2 ${className}`}
        {...props}
    >
        {loading && <Spinner size={18} />}
        {loading ? loadingText : children}
    </button>
);

/**
 * PageLoader - Full page centered loader
 * @param {string} message - Optional loading message
 */
export const PageLoader = ({ message = 'Loading...' }) => (
    <div className="flex flex-col h-screen items-center justify-center bg-stone-50">
        <Loader2 className="animate-spin text-amber-700 mb-4" size={48} />
        <p className="text-stone-600 font-medium">{message}</p>
    </div>
);

/**
 * SectionLoader - Loader for page sections
 * @param {string} message - Optional loading message
 */
export const SectionLoader = ({ message = 'Loading...' }) => (
    <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="animate-spin text-amber-700 mb-3" size={32} />
        <p className="text-stone-500">{message}</p>
    </div>
);

/**
 * InlineLoader - Small inline loader with optional text
 * @param {string} text - Optional text next to loader
 */
export const InlineLoader = ({ text }) => (
    <div className="flex items-center gap-2 text-stone-600">
        <Spinner size={16} className="text-amber-700" />
        {text && <span className="text-sm">{text}</span>}
    </div>
);

export default PageLoader;
