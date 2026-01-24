import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import FullPageLoader from '../components/ui/FullPageLoader';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('ganpatiToken'));
    const [activeAuthAction, setActiveAuthAction] = useState(null);



    useEffect(() => {
        const loadUser = () => {
            try {
                const savedUser = localStorage.getItem('ganpatiUser');
                if (savedUser) {
                    const u = JSON.parse(savedUser);
                    if (u && u.token) {
                        setUser(u);
                        setToken(u.token);
                    }
                }
            } catch (error) {
                console.error("Failed to load user", error);
                localStorage.clear();
            } finally {
                setLoading(false);
            }
        };
        loadUser();
    }, []);

    // Token Expiry Interceptor
    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                // If 401 and NOT login endpoint, then logout
                if (error.response && error.response.status === 401 && !error.config.url.includes('/login')) {
                    logout();
                }
                return Promise.reject(error);
            }
        );
        return () => api.interceptors.response.eject(interceptor);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await api.post(`/users/login`, { email, password });

            // Start Loader
            setActiveAuthAction({ type: 'LOGIN', text: 'Logging in...' });

            // Delay slightly to show loader, then reload
            setTimeout(() => {
                setUser(data);
                setToken(data.token);
                localStorage.setItem('ganpatiUser', JSON.stringify(data));
                window.location.reload();
            }, 1500);

            return data;
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const { data } = await api.post(`/users`, { ...userData, isAdmin: false });

            // Start Loader
            setActiveAuthAction({ type: 'REGISTER', text: 'Creating Account...' });

            setTimeout(() => {
                setUser(data);
                setToken(data.token);
                localStorage.setItem('ganpatiUser', JSON.stringify(data));
                window.location.reload();
            }, 1500);

            return data;
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setActiveAuthAction({ type: 'LOGOUT', text: 'Logging out...' });
        setTimeout(() => {
            setUser(null);
            setToken(null);
            localStorage.removeItem('ganpatiUser');
            localStorage.removeItem('ganpatiCart');
            window.location.href = '/';
        }, 1500);
    };

    const updateProfile = async (updates) => {
        if (!user || !user.token) return;
        const { data } = await api.put(`/users/profile`, updates, {
            headers: { Authorization: `Bearer ${user.token}` }
        });
        setUser(data);
        localStorage.setItem('ganpatiUser', JSON.stringify(data));
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, updateProfile, loading }}>
            {activeAuthAction && <FullPageLoader text={activeAuthAction.text} />}
            {children}
        </AuthContext.Provider>
    );
};
