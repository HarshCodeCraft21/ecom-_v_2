import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields.');
      return;
    }

    setLoading(true);
    const result = await registerUser(name, email, password, 'user');
    setLoading(false);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/');
    } else {
      toast.error(result.error || 'Registration failed.');
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md transform overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-8 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95">
        <div className="text-center space-y-2 mb-8">
          <h2 className="text-2xl font-extrabold uppercase tracking-widest text-lux-dark">Create Account</h2>
          <p className="text-xs text-lux-dark/50">Join us to discover and catalog your dream spaces.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-lux-200 bg-white px-3.5 py-2.5 font-sans text-xs focus:outline-none focus:border-lux-primary"
              placeholder="John Doe"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-lux-dark/60">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-lux-200 bg-white px-3.5 py-2.5 font-sans text-xs focus:outline-none focus:border-lux-primary"
              placeholder="john@example.com"
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-lux-dark/50">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-lux-dark hover:underline">
            Login Here
          </Link>
        </p>
      </div>
    </div>
  );
};
