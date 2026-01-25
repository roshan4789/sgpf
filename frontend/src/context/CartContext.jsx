import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { user } = useAuth();
    const [cart, setCart] = useState(() => {
        try {
            const saved = localStorage.getItem('ganpatiCart');
            return saved ? JSON.parse(saved) : [];
        } catch (e) { return []; }
    });



    // Sync to LocalStorage
    useEffect(() => {
        localStorage.setItem('ganpatiCart', JSON.stringify(cart));
    }, [cart]);

    // Sync to Backend when User changes
    useEffect(() => {
        if (user && user.token) {
            // If user logs in, we might want to merge or overwrite. 
            // Current logic in App.jsx was to sync current cart TO profile.
            // But usually we fetch user's saved cart.
            // App.jsx: 
            // if (data.cart && data.cart.length > 0) setCart(data.cart); // Restore Cart on Login

            // We'll let the Login page/AuthContext handle the initial fetch/set if needed, 
            // but here we just sync updates TO backend.
            api.put(`/users/profile`, { cart }, { headers: { Authorization: `Bearer ${user.token}` } })
                .catch(err => console.log("Sync error", err));
        }
    }, [cart, user]);

    // Also update cart if user object from AuthContext has a cart (e.g. on login)
    useEffect(() => {
        if (user && user.cart && user.cart.length > 0) {
            // Check if we should merge or replace. Authenticated source is usually truth.
            // For simplicity, if local cart is empty, take user cart.
            setCart(prev => {
                if (prev.length === 0) return user.cart;
                return prev; // Keep local cart if not empty? Or merge? 
                // App.jsx logic: if (data.cart && data.cart.length > 0) setCart(data.cart); 
                // This implies replacing local cart with server cart on login.
            });
        }
    }, [user]);

    const addToCart = (product) => {
        if (product.countInStock === 0) return;
        const prodId = product._id || product.id;

        setCart(prev => {
            const existing = prev.find(item => (item._id || item.id) === prodId);
            if (existing) {
                return prev.map(item => ((item._id || item.id) === prodId) ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => {
        setCart(prev => prev.filter(item => (item._id || item.id) !== id));
    };

    const updateQuantity = (id, delta) => {
        setCart(prev => prev.map(item => {
            const itemId = item._id || item.id;
            if (itemId === id) return { ...item, quantity: Math.max(1, item.quantity + delta) };
            return item;
        }));
    };

    const clearCart = () => {
        setCart([]);
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
