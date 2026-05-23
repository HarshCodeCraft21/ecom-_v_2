import React, { useEffect, useState } from 'react';
import { getProducts } from '../../services/product.service.js';
import { getCategories } from '../../services/category.service.js';
import { Package, Tags, TrendingUp, DollarSign } from 'lucide-react';

/**
 * Admin Dashboard overview page with stats cards.
 */
export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalValue: 0,
    avgPrice: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          getProducts({ page: 1, limit: 1000 }),
          getCategories(),
        ]);
        const products = prodRes.data?.products || [];
        const categories = catRes.data || [];
        const totalValue = products.reduce((sum, p) => sum + (p.discountedPrice > 0 ? p.discountedPrice : p.price), 0);
        const avgPrice = products.length > 0 ? totalValue / products.length : 0;

        setStats({
          totalProducts: prodRes.data?.pagination?.totalProducts || products.length,
          totalCategories: categories.length,
          totalValue,
          avgPrice,
        });
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'bg-blue-50 text-blue-600' },
    { label: 'Categories', value: stats.totalCategories, icon: Tags, color: 'bg-purple-50 text-purple-600' },
    { label: 'Catalog Value', value: `$${stats.totalValue.toFixed(2)}`, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Avg. Price', value: `$${stats.avgPrice.toFixed(2)}`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold uppercase tracking-wider text-lux-dark">Dashboard Overview</h2>
        <p className="text-xs text-lux-dark/50">Quick glance at your store metrics.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className={`rounded-2xl border border-white/60 bg-white/50 p-5 shadow-soft backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-md ${
              loading ? 'animate-pulse' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/40">{label}</p>
                <p className="mt-1 text-2xl font-extrabold text-lux-dark">
                  {loading ? '—' : value}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
