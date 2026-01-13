import React from 'react';
import { X, Layers, Filter } from 'lucide-react';
import Button from '../ui/Button';
import { CATEGORY_HIERARCHY } from '../../config/constants';

const FilterSidebar = ({ isOpen, onClose, filters, onFilterChange, onApply }) => {
    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-0 lg:shadow-none lg:bg-transparent ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-full overflow-y-auto p-6 lg:p-0">
                <div className="flex justify-between items-center lg:hidden mb-6">
                    <h3 className="text-xl font-bold text-stone-900">Filters</h3>
                    <button onClick={onClose}><X /></button>
                </div>

                {/* Categories */}
                <div className="mb-8">
                    <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2"><Layers size={18} /> Categories</h4>
                    <div className="space-y-2">
                        <button onClick={() => onFilterChange('category', 'All')} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === 'All' ? 'bg-amber-100 text-amber-800 font-bold' : 'text-stone-600 hover:bg-stone-100'}`}>
                            All Categories
                        </button>
                        {Object.keys(CATEGORY_HIERARCHY).map(cat => (
                            <button key={cat} onClick={() => onFilterChange('category', cat)} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filters.category === cat ? 'bg-amber-100 text-amber-800 font-bold' : 'text-stone-600 hover:bg-stone-100'}`}>
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Price Filter */}
                <div className="mb-8">
                    <h4 className="font-bold text-stone-900 mb-4 flex items-center gap-2"><Filter size={18} /> Price Range</h4>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                        <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" value={filters.minPrice} onChange={e => onFilterChange('minPrice', e.target.value)} />
                        <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm" value={filters.maxPrice} onChange={e => onFilterChange('maxPrice', e.target.value)} />
                    </div>
                    <Button onClick={onApply} className="w-full text-sm py-2">Apply</Button>
                </div>
            </div>
        </aside>
    );
};

export default FilterSidebar;
