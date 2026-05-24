import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/product.service.js';
import { Loader2, ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js';

export const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await getProductById(id);
        if (response && response.success) {
          setProduct(response.data);
        }
      } catch (err) {
        toast.error('Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-lux-dark/45" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-lux-dark/50 text-sm">Product details could not be found.</p>
        <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-lux-dark underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      <Link
        to="/shop"
        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-lux-dark/50 hover:text-lux-dark transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Shop
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Product Image */}
        <div className="rounded-3xl border border-white/60 bg-white/40 p-4 shadow-soft backdrop-blur-md">
          <img
            src={product.image}
            alt={product.title}
            className="w-full aspect-square object-cover rounded-2xl shadow-sm"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-lux-dark/45">
              {product.category?.name || 'Unassigned'}
            </span>
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-lux-dark leading-tight">
              {product.title}
            </h1>
          </div>

          <div className="flex items-baseline gap-3">
            {product.discountedPrice > 0 ? (
              <>
                <span className="text-2xl font-extrabold text-emerald-600">₹{product.discountedPrice.toFixed(2)}</span>
                <span className="text-sm font-bold text-lux-dark/35 line-through">₹{product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-2xl font-extrabold text-lux-dark">₹{product.price.toFixed(2)}</span>
            )}
          </div>

          <div className="h-px bg-lux-100/50" />

          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/40">Description</h3>
            <p className="text-xs text-lux-dark/70 font-sans leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          <div className="h-px bg-lux-100/50" />

          {/* Checkout/Order Actions placeholder */}
          <button
            onClick={async () => {
              if (!isAuthenticated) {
                toast.error('Please log in to add items to your cart.');
                return;
              }
              const res = await addToCart(product._id, 1);
              if (res.success) {
                toast.success('Product added to bag!');
              } else {
                toast.error(res.error || 'Failed to add to bag.');
              }
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lux-dark py-3.5 font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-lux-dark-hover transition-colors shadow-lg shadow-lux-dark/20"
          >
            Add to Bag
          </button>

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/40 p-4 shadow-soft">
              <Shield className="h-5 w-5 text-lux-dark/45" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-lux-dark">1 Year Warranty</p>
                <p className="text-[8px] text-lux-dark/40">Fully assured protection</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/40 p-4 shadow-soft">
              <Sparkles className="h-5 w-5 text-lux-dark/45" />
              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-lux-dark">Premium Quality</p>
                <p className="text-[8px] text-lux-dark/40">Handpicked materials</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
