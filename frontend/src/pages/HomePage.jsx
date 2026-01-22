import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Package, ChevronDown } from 'lucide-react';
import { SectionLoader, Spinner } from '../components/ui/Loader';
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
    const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

    // Initial Filters from URL
    const initialFilters = {
        category: searchParams.get('category') || 'All',
        subcategory: searchParams.get('subcategory') || '',
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
            if (key === 'category') {
                prev.delete('subcategory');
            }
            return prev;
        });
    };

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
        <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
            <main className="w-full px-4 sm:px-6 md:px-12 py-6 md:py-8 min-h-[calc(100vh-300px)]">
                {/* Hero Banner */}
                {!initialFilters.keyword && <HeroCarousel scrollToProducts={scrollToProducts} />}

                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Sidebar */}
                    <FilterSidebar
                        isOpen={isFilterOpen}
                        onClose={() => setIsFilterOpen(false)}
                        filters={initialFilters}
                        onFilterChange={handleFilterChange}
                        onApply={() => {
                            if (window.innerWidth < 1024) setIsFilterOpen(false);
                        }}
                    />

                    {/* Main Content */}
                    <div className="flex-1" ref={productsSectionRef}>
                        {/* Subcategory Pills */}
                        {currentSubCategories.length > 0 && (
                            <div className="mb-6 overflow-x-auto pb-2 scrollbar-hide">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleFilterChange('subcategory', 'All')}
                                        className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 ${!initialFilters.subcategory || initialFilters.subcategory === 'All'
                                            ? 'bg-gradient-to-r from-stone-900 to-stone-800 text-white shadow-lg shadow-stone-900/20'
                                            : 'bg-white border-2 border-stone-200 text-stone-700 hover:border-stone-900 hover:shadow-md'
                                            }`}
                                    >
                                        All {initialFilters.category}
                                    </button>
                                    {currentSubCategories.map(sub => (
                                        <button
                                            key={sub}
                                            onClick={() => handleFilterChange('subcategory', sub)}
                                            className={`px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 ${initialFilters.subcategory === sub
                                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30'
                                                : 'bg-white border-2 border-stone-200 text-stone-700 hover:border-amber-500 hover:text-amber-600 hover:shadow-md'
                                                }`}
                                        >
                                            {sub}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}


                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setIsFilterOpen(true)}
                            className="lg:hidden mb-6 flex items-center justify-center gap-2 px-5 py-3 border-2 border-stone-200 rounded-xl bg-white text-stone-700 font-semibold hover:bg-stone-50 hover:border-stone-900 transition-all duration-200 w-full"
                        >
                            <Filter size={18} />
                            Show Filters
                        </button>


                        {/* Product Grid */}
                        {initLoading ? (
                            <SectionLoader message="Loading Products..." />
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 bg-gradient-to-br from-stone-50 to-white rounded-2xl border-2 border-dashed border-stone-300">
                                <Package size={64} className="mx-auto text-stone-300 mb-4" />
                                <h3 className="text-2xl font-bold text-stone-700 mb-2">No Products Found</h3>
                                <p className="text-stone-500 mb-6">Try adjusting your filters or check back later for new arrivals.</p>
                                <button
                                    onClick={() => setSearchParams({})}
                                    className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-amber-600/30 hover:shadow-xl hover:scale-105"
                                >
                                    Clear All Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                {/* Product Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
                                    {products.map(p => (
                                        <ProductCard key={p._id || p.id} product={p} />
                                    ))}
                                </div>

                                {/* Load More Button */}
                                {page < totalPages && (
                                    <div className="mt-12 text-center">
                                        <Button
                                            variant="secondary"
                                            onClick={handleLoadMore}
                                            disabled={loading}
                                            className="px-8 py-4 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200"
                                        >
                                            {loading ? (
                                                <div className="flex items-center gap-2">
                                                    <Spinner />
                                                    <span>Loading...</span>
                                                </div>
                                            ) : (
                                                `Load More Products (${totalPages - page} pages left)`
                                            )}
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
