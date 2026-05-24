import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Tags, 
  Ticket,
  LogOut, 
  User, 
  Menu, 
  X 
} from 'lucide-react';

export const AdminLayout = () => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const navLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products', icon: ShoppingBag },
    { to: '/admin/categories', label: 'Categories', icon: Tags },
    { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  ];

  return (
    <div className="flex h-screen bg-lux-50/30 text-lux-dark font-sans overflow-hidden">
      
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-lux-100 shadow-soft">
        {/* Brand / Logo */}
        <div className="h-16 flex items-center px-6 border-b border-lux-100/60">
          <span className="text-sm font-extrabold uppercase tracking-widest text-lux-dark">
            Lux <span className="text-lux-dark/45 font-normal">Admin</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive
                      ? 'bg-lux-dark text-white shadow-md'
                      : 'text-lux-dark/50 hover:bg-lux-50 hover:text-lux-dark'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout (Bottom) */}
        <div className="p-4 border-t border-lux-100/60 bg-lux-50/20">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lux-100 text-lux-dark">
              <User className="h-4 w-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-lux-dark">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] text-lux-dark/40 truncate">{user?.email || 'admin@lux.com'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50/50 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white/70 border-b border-lux-100/50 backdrop-blur-md z-10">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl text-lux-dark/65 hover:bg-lux-50 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Page title placeholder */}
          <div className="hidden md:block">
            <span className="text-[10px] font-bold uppercase tracking-widest text-lux-dark/35">
              Control Panel
            </span>
          </div>

          <div className="flex items-center gap-4">
            <NavLink
              to="/"
              className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/50 hover:text-lux-dark transition-colors px-3 py-1.5 rounded-full border border-lux-200"
            >
              View Shop
            </NavLink>
            <div className="h-8 w-px bg-lux-100" />
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-lux-dark/55">
                Live Server
              </span>
            </div>
          </div>
        </header>

        {/* Nested Route Pages Content */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-tr from-lux-50/40 via-white/50 to-lux-100/20 p-6 md:p-8">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Sidebar - Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-lux-dark/30 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Drawer Panel */}
          <aside className="relative flex flex-col w-72 max-w-xs h-full bg-white shadow-2xl transition-all duration-300 animate-in slide-in-from-left">
            <div className="h-16 flex items-center justify-between px-6 border-b border-lux-100">
              <span className="text-sm font-extrabold uppercase tracking-widest text-lux-dark">
                Lux <span className="text-lux-dark/45 font-normal">Admin</span>
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-xl hover:bg-lux-50 text-lux-dark/50 hover:text-lux-dark transition-all"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${
                        isActive
                          ? 'bg-lux-dark text-white shadow-md'
                          : 'text-lux-dark/50 hover:bg-lux-50 hover:text-lux-dark'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </NavLink>
                );
              })}
            </nav>

            <div className="p-4 border-t border-lux-100 bg-lux-50/20">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lux-100 text-lux-dark">
                  <User className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-lux-dark">{user?.name || 'Admin User'}</p>
                  <p className="text-[10px] text-lux-dark/40 truncate">{user?.email || 'admin@lux.com'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50/50 py-2.5 text-xs font-bold uppercase tracking-wider text-red-500 hover:bg-red-500 hover:text-white transition-all"
              >
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
};
