import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Login = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await loginUser(email, password);
    setLoading(false);

    if (result.success) {
      toast.success('Logged in successfully!');
      if (result.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      toast.error(result.error || 'Authentication failed.');
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md transform overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-extrabold uppercase tracking-widest text-lux-dark">Sign In</h2>
          <p className="text-xs text-lux-dark/50">Welcome back! Sign in to access your space catalog.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-lux-200 bg-white px-3.5 py-2.5 font-sans text-xs focus:outline-none focus:border-lux-primary"
              placeholder="admin@lux.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-lux-200 bg-white px-3.5 py-2.5 font-sans text-xs focus:outline-none focus:border-lux-primary"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lux-dark py-3 font-sans text-xs font-bold uppercase tracking-wider text-white hover:bg-lux-dark-hover transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log In'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-lux-dark/50">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-lux-dark hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};
