import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart.js';
import { useAuth } from '../hooks/useAuth.js';
import { toast } from 'react-hot-toast';

export const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-white/60 bg-white/40 shadow-soft backdrop-blur-md p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      
      {/* Product Image Wrapper */}
      <Link to={`/product/${product._id}`} className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-lux-50">
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.discountedPrice > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-white">
            Sale
          </span>
        )}
      </Link>

      {/* Product Info Section */}
      <div className="mt-4 px-1 pb-2 space-y-1.5 flex-1 flex flex-col justify-between">
        <div>
          <span className="text-[9px] font-bold uppercase tracking-widest text-lux-dark/45">
            {product.category?.name || 'Unassigned'}
          </span>
          <Link to={`/product/${product._id}`} className="block">
            <h3 className="text-xs font-extrabold uppercase tracking-wide text-lux-dark truncate hover:text-lux-primary transition-colors">
              {product.title}
            </h3>
          </Link>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="flex items-center justify-between pt-2 border-t border-lux-100/30">
          <div className="flex flex-col">
            {product.discountedPrice > 0 ? (
              <>
                <span className="text-xs font-extrabold text-emerald-600">₹{product.discountedPrice.toFixed(2)}</span>
                <span className="text-[9px] font-bold text-lux-dark/35 line-through">₹{product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-xs font-extrabold text-lux-dark">₹{product.price.toFixed(2)}</span>
            )}
          </div>
          <button
            onClick={async (e) => {
              e.preventDefault();
              if (!isAuthenticated) {
                toast.error('Please log in to add items to your cart.');
                return;
              }
              const res = await addToCart(product._id, 1);
              if (res.success) {
                toast.success('Added to bag!');
              } else {
                toast.error(res.error || 'Failed to add to bag.');
              }
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-lux-dark text-white hover:bg-lux-dark-hover transition-colors cursor-pointer"
            title="Add to Bag"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      
    </div>
  );
};
