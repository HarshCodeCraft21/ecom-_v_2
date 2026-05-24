import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.js';
import { useCategories } from '../hooks/useCategories.js';
import { ProductCard } from '../components/ProductCard.jsx';
import { Search, ArrowUpDown } from 'lucide-react';

export const Shop = () => {
  const { products, pagination, loading, fetchProducts } = useProducts();
  const { categories, fetchCategories } = useCategories();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    fetchProducts({ page, limit: 8, search, category, sort });
    fetchCategories();
  }, [fetchProducts, fetchCategories, page, search, category, sort]);

  const updateFilters = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([key, val]) => {
      if (val) {
        updated.set(key, val);
      } else {
        updated.delete(key);
      }
    });
    if (!newParams.page) {
      updated.set('page', '1');
    }
    setSearchParams(updated);
  };

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl font-bold uppercase tracking-wider text-lux-dark">Store Catalog</h1>
        <p className="text-xs text-lux-dark/50">Browse and filter our exclusive inventory.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center rounded-2xl border border-white/60 bg-white/40 p-4 shadow-soft">
        
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="w-full rounded-full border border-lux-200 bg-white px-4 py-2.5 pl-10 font-sans text-xs text-lux-dark focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3 h-3.5 w-3.5 text-lux-dark/45" />
        </div>

        {/* Category select */}
        <div className="relative w-full md:w-56">
          <select
            value={category}
            onChange={(e) => updateFilters({ category: e.target.value })}
            className="w-full appearance-none rounded-full border border-lux-200 bg-white px-4 py-2.5 pr-10 font-sans text-xs text-lux-dark focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div className="relative w-full md:w-48">
          <select
            value={sort}
            onChange={(e) => updateFilters({ sort: e.target.value })}
            className="w-full appearance-none rounded-full border border-lux-200 bg-white px-4 py-2.5 pr-10 font-sans text-xs text-lux-dark focus:outline-none"
          >
            <option value="latest">Sort: Latest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="priceAsc">Sort: Price ↑</option>
            <option value="priceDesc">Sort: Price ↓</option>
          </select>
          <ArrowUpDown className="pointer-events-none absolute right-4 top-3 h-3.5 w-3.5 text-lux-dark/40" />
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 bg-lux-100 rounded-3xl border border-white" />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              {[...Array(pagination.totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateFilters({ page: (i + 1).toString() })}
                  className={`h-8 w-8 rounded-xl font-bold text-xs transition-all ${
                    pagination.currentPage === i + 1
                      ? 'bg-lux-dark text-white shadow-md'
                      : 'border border-lux-200 bg-white text-lux-dark/60 hover:bg-lux-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-lux-200 bg-white/20 p-12 text-center">
          <p className="font-sans text-xs text-lux-dark/50">No products found matching your filter selection.</p>
        </div>
      )}
    </div>
  );
};
