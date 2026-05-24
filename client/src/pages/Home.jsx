import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts.js';
import { useCategories } from '../hooks/useCategories.js';
import { ArrowRight, Star, ShoppingBag, Compass } from 'lucide-react';
import { ProductCard } from '../components/ProductCard.jsx';

export const Home = () => {
  const { products, loading, fetchProducts } = useProducts();
  const { categories, fetchCategories } = useCategories();

  useEffect(() => {
    fetchProducts({ page: 1, limit: 4 });
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  return (
    <div className="space-y-16 pb-16">
      
      {/* Hero Presentation Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-lux-dark text-white px-8 py-16 md:py-24 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
        <div className="space-y-6 max-w-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 bg-white/10 px-3.5 py-1.5 rounded-full">
            New Collection 2026
          </span>
          <h1 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tight leading-tight">
            Redefine <span className="text-white/40">Your</span> Luxury Space.
          </h1>
          <p className="text-sm text-white/70 font-sans leading-relaxed">
            Discover a curated collection of modern, sophisticated, and handcrafted essentials designed to bring comfort and elegance into your everyday life.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              to="/shop"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-lux-dark hover:bg-white/90 shadow-lg transition-all duration-300"
            >
              Shop Collection
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
        <div className="relative w-full max-w-sm md:max-w-md aspect-square rounded-2xl overflow-hidden border-2 border-white/10 shadow-soft">
          <div className="absolute inset-0 bg-gradient-to-tr from-lux-dark via-transparent to-transparent z-10" />
          <div className="absolute inset-0 flex items-center justify-center bg-white/5 text-white/40">
            <Compass className="h-24 w-24 animate-spin-slow" />
          </div>
        </div>
      </section>

      {/* Featured Categories list */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold uppercase tracking-wider text-lux-dark">Shop by Category</h2>
          <p className="text-xs text-lux-dark/50">Explore handcrafted items sorted by spaces.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat) => (
            <Link
              key={cat._id}
              to={`/shop?category=${cat._id}`}
              className="group relative h-40 overflow-hidden rounded-2xl border border-white/60 bg-white/40 shadow-soft backdrop-blur-md flex flex-col justify-end p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="z-10 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-lux-dark/40">Explore</span>
                <h3 className="text-xs font-extrabold uppercase tracking-wide text-lux-dark group-hover:text-lux-primary transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Catalog Products grid */}
      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wider text-lux-dark">Featured Products</h2>
            <p className="text-xs text-lux-dark/50">Curated, premium picks for you this week.</p>
          </div>
          <Link
            to="/shop"
            className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60 hover:text-lux-dark flex items-center gap-1 transition-colors"
          >
            View All
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 bg-lux-100 rounded-3xl border border-white" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-lux-200 bg-white/20 p-12 text-center">
            <p className="font-sans text-xs text-lux-dark/50">No featured products cataloged yet.</p>
          </div>
        )}
      </section>

    </div>
  );
};
