import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Film, Mail, Lock } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-surface p-8 rounded-2xl border border-white/10 shadow-2xl">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 text-primary font-black text-3xl tracking-tighter mb-4">
            <Film className="w-10 h-10 fill-primary" />
            <span>CINEVERSE</span>
          </Link>
          <h2 className="text-xl font-bold text-white">Sign in to your account</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-muted uppercase tracking-widest">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="email"
                required
                className="w-full bg-background border border-white/10 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-primary transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-muted uppercase tracking-widest">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="password"
                required
                className="w-full bg-background border border-white/10 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:border-primary transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-black py-4 rounded-lg font-black hover:bg-primary/90 transition-all transform hover:scale-[1.02]"
          >
            SIGN IN
          </button>
        </form>

        <p className="text-center mt-8 text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-white font-bold hover:text-primary transition-colors">
            Create one now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
