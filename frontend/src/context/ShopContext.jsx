import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

    const [products, setProducts] = useState([]);
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);

    // Pagination & Filters (Managed here or locally in pages? 
    // Usually locally in pages is better so different pages can show different things, 
    // but simple app can share it. Let's provide the fetcher.)

    const fetchProducts = async (pageNumber = 1, filters = {}) => {
        setLoading(true);
        try {
            const { category, subcategory, minPrice, maxPrice, sort, search } = filters;
            let query = `?pageNumber=${pageNumber}&sort=${sort || 'newest'}`;

            if (category && category !== 'All') query += `&category=${category}`;
            if (subcategory && subcategory !== 'All') query += `&subcategory=${subcategory}`;
            if (minPrice) query += `&minPrice=${minPrice}`;
            if (maxPrice) query += `&maxPrice=${maxPrice}`;
            if (search) query += `&keyword=${search}`;

            const { data } = await axios.get(`${API_URL}/api/products${query}`);
            const newProducts = Array.isArray(data) ? data : (data.products || []);
            // Return data to caller for handling (like appending vs replacing)
            return { products: newProducts, pages: data.pages || 1 };
        } catch (e) {
            console.error("Error fetching products", e);
            throw e;
        } finally {
            setLoading(false);
        }
    };

    const fetchBanners = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/banners`);
            if (data && data.length > 0) {
                setBanners(data);
            }
        } catch (e) {
            console.error("Offline banners or error", e);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    // Also helper to get related products
    const fetchRelatedProducts = async (id) => {
        try {
            const { data } = await axios.get(`${API_URL}/api/products/${id}/related`);
            return data;
        } catch (error) {
            return [];
        }
    };

    return (
        <ShopContext.Provider value={{ products, setProducts, banners, setBanners, fetchProducts, fetchRelatedProducts, loading }}>
            {children}
        </ShopContext.Provider>
    );
};
