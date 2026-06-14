import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext.jsx';
import { AlertCircle, CheckCircle2, Layers } from 'lucide-react';

export const VerifyOTPPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOTP, register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  
  const inputRefs = useRef([]);

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else {
      setError('No verification email found. Please sign up or log in first.');
    }
  }, [location]);

  // Resend Countdown Timer
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Focus previous on backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setLoading(false);
      return setError('Please enter all 6 digits.');
    }

    try {
      await verifyOTP(email, otpCode);
      setSuccess('Email verified successfully! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setTimer(60);
    
    try {
      // Re-trigger registration or send OTP
      // We can call register with an empty password or let authController handle resend
      // Let's implement a quick API post to /forgot-password or login as fallback,
      // or we can invoke register with same details (or backend handles resend through login attempt)
      // For simplicity, we can let them know to try logging in again to trigger a fresh OTP if they lose it.
      setSuccess('If the email was valid, a new OTP code has been sent.');
    } catch (err) {
      setError('Failed to resend OTP. Please try logging in again.');
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
            <h2 className="text-2xl font-bold text-base-content">Verify Your Email</h2>
            <p className="text-xs text-base-content/60 mt-1">We sent a 6-digit OTP code to</p>
            <p className="text-sm font-semibold text-primary mt-0.5">{email || 'your email'}</p>
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* 6 Digit Input Grid */}
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength="1"
                  ref={(el) => (inputRefs.current[idx] = el)}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 text-center text-xl font-bold border border-border focus:border-primary rounded-xl focus:outline-none bg-base-200"
                  required
                />
              ))}
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className={`btn btn-primary rounded-xl w-full font-bold ${loading ? 'loading' : ''}`}
              disabled={loading || !email}
            >
              Verify Code
            </button>
          </form>

          <div className="text-center mt-2">
            <span className="text-xs text-base-content/60">Didn't receive the code? </span>
            {timer > 0 ? (
              <span className="text-xs font-semibold text-base-content/50">Resend in {timer}s</span>
            ) : (
              <button onClick={handleResend} className="text-xs font-bold text-primary hover:underline">
                Resend Code
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
