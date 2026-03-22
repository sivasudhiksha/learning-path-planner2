import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import { authService } from '../services/api';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await authService.login({ email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="glass-card p-10 w-full max-w-md animate-fade-in">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary mx-auto mb-4">
            <LogIn size={32} />
          </div>
          <h2 className="mb-2">Welcome Back</h2>
          <p className="text-text-muted">Sign in to continue your journey</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-text-muted" size={20} />
            <input
              type="email"
              placeholder="Email Address"
              className="pl-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-text-muted" size={20} />
            <input
              type="password"
              placeholder="Password"
              className="pl-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="w-full py-4 mt-2 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Sign In'}
          </button>
          
          {error && <p className="text-secondary text-sm mt-4 text-center">{error}</p>}
        </form>

        <p className="text-center mt-8 text-text-muted">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Register for free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;