import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { User, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart.js';

export const Navbar = () => {
  const { user, isAuthenticated, logoutUser } = useAuth();
  const { cartItemsCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/70 border-b border-lux-100/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="text-sm font-extrabold uppercase tracking-widest text-lux-dark">
          Lux <span className="text-lux-dark/45 font-normal">Spaces</span>
        </Link>

        {/* Store Navigation Links */}
        <nav className="flex items-center gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-[10px] font-bold uppercase tracking-wider transition-colors ${
                isActive ? 'text-lux-dark' : 'text-lux-dark/50 hover:text-lux-dark'
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/shop"
            className={({ isActive }) =>
              `text-[10px] font-bold uppercase tracking-wider transition-colors ${
                isActive ? 'text-lux-dark' : 'text-lux-dark/50 hover:text-lux-dark'
              }`
            }
          >
            Shop
          </NavLink>
        </nav>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          
          {/* Cart Icon Link with counter badge */}
          <Link
            to="/cart"
            className="relative p-2 rounded-xl text-lux-dark/65 hover:text-lux-dark hover:bg-lux-50/50 transition-all duration-300 flex items-center justify-center"
            title="Shopping Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {cartItemsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[8px] font-extrabold text-white shadow-sm animate-pulse">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {user?.role === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wide text-lux-dark/70 hover:text-lux-dark border border-lux-200 px-3 py-1.5 rounded-full transition-all"
                >
                  <LayoutDashboard className="h-3 w-3" />
                  Dashboard
                </Link>
              )}
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-lux-100 flex items-center justify-center text-lux-dark">
                  <User className="h-3.5 w-3.5" />
                </div>
                <span className="hidden sm:inline text-[10px] font-bold text-lux-dark/80">{user.name}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-[9px] font-bold uppercase tracking-wide text-red-500 hover:text-red-600 transition-colors flex items-center gap-1"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60 hover:text-lux-dark transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-[10px] font-bold uppercase tracking-wider bg-lux-dark text-white hover:bg-lux-dark-hover px-4 py-2 rounded-xl transition-all shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
