import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2, Layers } from 'lucide-react';
import { api } from '../Context/AuthContext.jsx';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess('If the account exists, a password reset OTP has been sent.');
      setTimeout(() => {
        navigate('/reset-password', { state: { email } });
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 relative">
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full filter blur-3xl opacity-10"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-400 rounded-full filter blur-3xl opacity-10"></div>

      <div className="card w-full max-w-md bg-base-100 border border-border shadow-xl rounded-2xl relative z-10">
        <div className="card-body p-8 sm:p-10 gap-6">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white mb-4">
              <Layers size={20} />
            </div>
            <h2 className="text-2xl font-bold text-base-content">Forgot Password</h2>
            <p className="text-xs text-base-content/60 mt-1">Enter your email to receive a password reset OTP code</p>
          </div>

          {error && (
            <div className="alert alert-error rounded-xl py-3 px-4 flex items-center gap-2">
              <AlertCircle size={18} className="shrink-0" />
              <span className="text-xs font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success rounded-xl py-3 px-4 flex items-center gap-2">
              <CheckCircle2 size={18} className="shrink-0" />
              <span className="text-xs font-medium">{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold text-xs">Email Address</span>
              </label>
              <div className="input input-bordered flex items-center gap-2 rounded-xl">
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

            <button 
              type="submit" 
              className={`btn btn-primary rounded-xl w-full font-bold mt-2 ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              Send Reset Code <ArrowRight size={16} className="ml-1" />
            </button>
          </form>

          <div className="flex items-center justify-center mt-2">
            <Link to="/login" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
