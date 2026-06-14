import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, Key, AlertCircle, CheckCircle2, ArrowLeft, ArrowRight, Layers } from 'lucide-react';
import { api } from '../Context/AuthContext.jsx';

export const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      setError('Please request a password reset first.');
    }
  }, [location]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/auth/verify-reset-otp', { email, otp });
      setResetToken(res.data.data.resetToken);
      setSuccess('OTP verified successfully. Please enter your new password.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }
    if (newPassword.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', { resetToken, newPassword });
      setSuccess('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
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
            <h2 className="text-2xl font-bold text-base-content">Reset Password</h2>
            <p className="text-xs text-base-content/60 mt-1">
              {!resetToken ? 'Enter the 6-digit OTP code sent to your email' : 'Choose a secure new password'}
            </p>
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

          {!resetToken ? (
            /* Part 1: Verify OTP */
            <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs">Verification OTP</span>
                </label>
                <div className="input input-bordered flex items-center gap-2 rounded-xl">
                  <Key size={16} className="text-base-content/40" />
                  <input 
                    type="text" 
                    className="grow text-sm font-semibold tracking-wide" 
                    placeholder="Enter 6-digit code" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary rounded-xl w-full font-bold mt-2 ${loading ? 'loading' : ''}`}
                disabled={loading || !email}
              >
                Verify Code <ArrowRight size={16} className="ml-1" />
              </button>
            </form>
          ) : (
            /* Part 2: Enter New Password */
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs">New Password</span>
                </label>
                <div className="input input-bordered flex items-center gap-2 rounded-xl">
                  <Lock size={16} className="text-base-content/40" />
                  <input 
                    type="password" 
                    className="grow text-sm" 
                    placeholder="Minimum 8 characters" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs">Confirm New Password</span>
                </label>
                <div className="input input-bordered flex items-center gap-2 rounded-xl">
                  <Lock size={16} className="text-base-content/40" />
                  <input 
                    type="password" 
                    className="grow text-sm" 
                    placeholder="Confirm new password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className={`btn btn-primary rounded-xl w-full font-bold mt-2 ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                Reset Password
              </button>
            </form>
          )}

          <div className="flex items-center justify-center mt-2 border-t border-border pt-4">
            <Link to="/login" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
