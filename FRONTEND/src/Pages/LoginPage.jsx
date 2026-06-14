import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import { Mail, Lock, AlertCircle, ArrowRight, Layers } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Login failed. Please verify credentials.';
      
      if (err.response?.data?.unverified) {
        // If unverified, redirect to OTP page
        navigate('/verify-otp', { state: { email } });
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      {/* Background circles */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-10"></div>

      <div className="card w-full max-w-md bg-base-100 border border-border shadow-xl rounded-2xl relative z-10">
        <div className="card-body p-8 sm:p-10 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white mb-4">
              <Layers size={20} />
            </div>
            <h2 className="text-2xl font-bold text-base-content">Welcome Back</h2>
            <p className="text-xs text-base-content/60 mt-1">Enter your credentials to access HackMatch</p>
          </div>

          {error && (
            <div className="alert alert-error rounded-xl py-3 px-4 flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Field */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs">Email Address</span>
              </label>
              <div className="input input-bordered flex items-center gap-2 rounded-xl focus-within:border-primary">
                <Mail size={16} className="text-base-content/40" />
                <input 
                  type="email" 
                  className="grow text-sm" 
                  placeholder="name@college.edu" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-control">
              <div className="flex justify-between items-center py-1">
                <label className="label p-0">
                  <span className="label-text font-semibold text-xs">Password</span>
                </label>
                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <div className="input input-bordered flex items-center gap-2 rounded-xl focus-within:border-primary">
                <Lock size={16} className="text-base-content/40" />
                <input 
                  type="password" 
                  className="grow text-sm" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`btn btn-primary rounded-xl mt-4 font-bold ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'} <ArrowRight size={16} className="ml-1" />
            </button>
          </form>

          <div className="text-center mt-2">
            <span className="text-xs text-base-content/60">New to HackMatch? </span>
            <Link to="/register" className="text-xs font-bold text-primary hover:underline">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
