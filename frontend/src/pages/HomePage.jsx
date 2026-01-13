import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Package, Loader2, ChevronDown } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import HeroCarousel from '../components/home/HeroCarousel';
import FilterSidebar from '../components/products/FilterSidebar';
import ProductCard from '../components/products/ProductCard';
import Button from '../components/ui/Button';

const HomePage = () => {
    const { fetchProducts, loading } = useShop();
    const [searchParams, setSearchParams] = useSearchParams();

    // Local state for products to support "Load More"
    const [products, setProducts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const productsSectionRef = useRef(null);
    const [initLoading, setInitLoading] = useState(false);

    // Categories State
    const [categories, setCategories] = useState([]);
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'; // Need API_URL for direct fetch

    // Initial Filters from URL
    const initialFilters = {
        category: searchParams.get('category') || 'All',
        subcategory: searchParams.get('subcategory') || '', // Added subcategory
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'newest',
        keyword: searchParams.get('keyword') || ''
    };

    const scrollToProducts = () => {
        productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // Fetch Categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // We could put this in ShopContext but local is fine for now
                const response = await fetch(`${API_URL}/api/products/categories`);
                const data = await response.json();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch products on Mount or Filter Change
    useEffect(() => {
        const load = async () => {
            setInitLoading(true);
            try {
                const data = await fetchProducts(1, initialFilters);
                setProducts(data.products);
                setTotalPages(data.pages);
                setPage(1);
            } catch (e) {
                // handle error
            } finally {
                setInitLoading(false);
            }
        };
        load();
    }, [searchParams]);

    const handleLoadMore = async () => {
        if (page >= totalPages) return;
        try {
            const nextPage = page + 1;
            const data = await fetchProducts(nextPage, initialFilters);
            setProducts(prev => [...prev, ...data.products]);
            setPage(nextPage);
        } catch (e) {
            console.error("Failed to load more", e);
        }
    };

    const handleFilterChange = (key, value) => {
        setSearchParams(prev => {
            if (value === '' || value === 'All') {
                prev.delete(key);
            } else {
                prev.set(key, value);
            }
            // If changing main category, reset subcategory
            if (key === 'category') {
                prev.delete('subcategory');
            }
            return prev;
        });
    };

    // Sort Handler
    const handleSortChange = (e) => {
        handleFilterChange('sort', e.target.value);
    };

    // Get current subcategories based on selected main category
    const currentSubCategories = (() => {
        if (initialFilters.category === 'All' || !initialFilters.category) return [];
        const cat = categories.find(c => c.mainCategory === initialFilters.category);
        return cat ? cat.subCategories : [];
    })();

    return (
        <div className="min-h-screen bg-gradient-to-b from-stone-50 to-white font-sans text-gray-900 pb-20">
            {/* Navbar is in App Layout */}

            <main className="w-full px-6 md:px-12 py-8 min-h-[calc(100vh-300px)]">
                {/* Only show Hero if no search/category active? Or always? App.jsx always showed it on 'home' view but filtered list below. */}
                {/* Usually Hero is only on clean Home, but let's keep it for now unless searching? */}
                {!initialFilters.keyword && <HeroCarousel scrollToProducts={scrollToProducts} />}

                <div className="flex flex-col lg:flex-row gap-8">
                    <FilterSidebar
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                        filters={initialFilters}
                        onFilterChange={handleFilterChange}
                        onApply={() => {
                            // Changes already applied via state -> URL, 
                            // but maybe we want a manual "Apply" for mobile to close sidebar?
                            // URL update triggers fetch.
                            if (window.innerWidth < 1024) setIsFilterOpen(false);
                        }}
                    />

                    <div className="flex-1" ref={productsSectionRef}>
                        {/* Horizontal Sub-Category List */}
                        {currentSubCategories.length > 0 && (
                            <div className="mb-8 overflow-x-auto pb-4 scrollbar-hide">
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handleFilterChange('subcategory', 'All')}
                                        className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${!initialFilters.subcategory || initialFilters.subcategory === 'All'
                                                ? 'bg-stone-900 text-white'
                                                : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-900'
                                            }`}
                                    >
                                        All {initialFilters.category}
                                    </button>
                                    {currentSubCategories.map(sub => (
                                        <button
                                            key={sub}
                                            onClick={() => handleFilterChange('subcategory', sub)}
                                            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${initialFilters.subcategory === sub
                                                    ? 'bg-amber-600 text-white'
                                                    : 'bg-white border border-stone-200 text-stone-600 hover:border-amber-600 hover:text-amber-600'
                                                }`}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Header & Sort */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-stone-100 pb-6">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-2 relative inline-block">
                                    Explore Collection
                                    <span className="absolute -bottom-2 left-0 w-1/3 h-1 bg-amber-500 rounded-full"></span>
                                </h2>
                                <p className="text-stone-600 mt-3 font-medium">Found {products.length} premium items</p>
                            </div>

                            <div className="flex gap-3 w-full md:w-auto">
                                <button onClick={() => setIsFilterOpen(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 border border-stone-200 rounded-lg bg-white text-stone-700 font-medium hover:bg-stone-50">
                                    <Filter size={18} /> Filters
                                </button>

                                <div className="relative flex-1 md:flex-none">
                                    <select
                                        className="w-full md:w-48 appearance-none bg-white border border-stone-200 text-stone-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:border-amber-500"
                                        value={initialFilters.sort}
                                        onChange={handleSortChange}
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="price-asc">Price: Low to High</option>
                                        <option value="price-desc">Price: High to Low</option>
                                        <option value="rating">Top Rated</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-stone-700">
                                        <ChevronDown size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Grid */}
                        {initLoading ? (
                            <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-amber-700" size={32} /> <p className="mt-2">Loading Products...</p></div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-stone-300">
                                <Package size={48} className="mx-auto text-stone-300 mb-4" />
                                <h3 className="text-xl font-bold text-stone-500">No Products Found</h3>
                                <p className="text-stone-400">Try adjusting your filters or checking back later.</p>
                                <button
                                    onClick={() => setSearchParams({})}
                                    className="mt-4 text-amber-700 font-bold hover:underline"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                                    {products.map(p => (
                                        <ProductCard key={p._id || p.id} product={p} />
                                    ))}
                                </div>

                                {page < totalPages && (
                                    <div className="mt-12 text-center">
                                        <Button variant="secondary" onClick={handleLoadMore} disabled={loading}>
                                            {loading ? <Loader2 className="animate-spin" /> : "Load More Products"}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default HomePage;
