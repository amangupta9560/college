import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken } from '../utils/generateTokens.js';
import { sendOTPEmail, sendResetPasswordEmail } from '../utils/sendEmail.js';

// Cookie options helper
const getCookieOptions = (maxAgeMs, isSecure = false) => ({
  httpOnly: true,
  secure: isSecure || process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: maxAgeMs
});

export const register = async (req, res, next) => {
  try {
    const { 
      email, password, firstName, lastName, college, degree, branch, year, 
      skills, interests, githubURL, linkedinURL, portfolioURL 
    } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 12);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      passwordHash,
      firstName,
      lastName,
      college,
      degree,
      branch,
      year,
      skills: skills || [],
      interests: interests || [],
      githubURL: githubURL || '',
      linkedinURL: linkedinURL || '',
      portfolioURL: portfolioURL || '',
      emailOTP: hashedOtp,
      emailOTPExpiry: otpExpiry,
      isEmailVerified: false
    });

    await newUser.save();

    // Send verification email
    try {
      console.log(`[DEV ONLY] Registration OTP for ${email}: ${otp}`);
      await sendOTPEmail(email, otp);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the registration if email fails (for dev, log it)
    }

    // Don't return passwordHash
    const userResponse = newUser.toObject();
    delete userResponse.passwordHash;
    delete userResponse.emailOTP;
    delete userResponse.emailOTPExpiry;

    return res.status(201).json({
      success: true,
      message: 'OTP sent to email.',
      data: { user: userResponse }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: 'Email is already verified.' });
    }

    if (!user.emailOTP || !user.emailOTPExpiry || user.emailOTPExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    const isMatch = await bcrypt.compare(otp, user.emailOTP);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // Verify user
    user.isEmailVerified = true;
    user.emailOTP = null;
    user.emailOTPExpiry = null;

    // Issue tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Add to user's refresh tokens (limit to max 5)
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift(); // Evict oldest
    }

    await user.save();

    // Set cookies
    res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    delete userResponse.refreshTokens;

    return res.status(200).json({
      success: true,
      message: 'Email verified successfully.',
      data: { user: userResponse, accessToken }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    if (!user.isEmailVerified) {
      // Re-send registration OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.emailOTP = await bcrypt.hash(otp, 12);
      user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      
      try {
        await sendOTPEmail(email, otp);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
      }

      return res.status(403).json({
        success: false,
        message: 'Email is not verified. A new OTP has been sent to your email.',
        unverified: true
      });
    }

    // Issue tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Manage refresh tokens array
    user.refreshTokens.push(refreshToken);
    if (user.refreshTokens.length > 5) {
      user.refreshTokens.shift();
    }
    
    user.lastSeen = new Date();
    await user.save();

    // Set cookies
    res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    const userResponse = user.toObject();
    delete userResponse.passwordHash;
    delete userResponse.refreshTokens;

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { user: userResponse, accessToken }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = req.user;
    
    // Get refresh token from cookie
    let token = null;
    if (req.headers.cookie) {
      const cookies = req.headers.cookie.split(';').reduce((acc, curr) => {
        const [k, v] = curr.split('=').map(c => c.trim());
        acc[k] = v;
        return acc;
      }, {});
      token = cookies.refreshToken;
    }

    if (token) {
      // Remove this refresh token from user's list
      user.refreshTokens = user.refreshTokens.filter(t => t !== token);
      await user.save();
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    const user = req.user;
    const oldRefreshToken = req.refreshToken;

    // Issue new tokens (Token Rotation)
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Replace old refresh token with new one
    user.refreshTokens = user.refreshTokens.filter(t => t !== oldRefreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    // Set cookies
    res.cookie('accessToken', newAccessToken, getCookieOptions(15 * 60 * 1000));
    res.cookie('refreshToken', newRefreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

    return res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken }
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Email address not found.' });
    }

    // Generate password reset OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.emailOTP = await bcrypt.hash(otp, 12);
    user.emailOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await user.save();

    try {
      console.log(`[DEV ONLY] Reset OTP for ${email}: ${otp}`);
      await sendResetPasswordEmail(email, otp);
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
    }

    return res.status(200).json({ success: true, message: 'OTP sent for password reset.' });
  } catch (error) {
    next(error);
  }
};

export const verifyResetOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (!user.emailOTP || !user.emailOTPExpiry || user.emailOTPExpiry < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP has expired.' });
    }

    const isMatch = await bcrypt.compare(otp, user.emailOTP);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid OTP.' });
    }

    // Generate short-lived reset token (JWT, valid for 5 mins)
    const resetToken = jwt.sign(
      { id: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '5m' }
    );

    user.emailOTP = null;
    user.emailOTPExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'OTP verified. Reset token issued.',
      data: { resetToken }
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({ success: false, message: 'Invalid reset token.' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Update password
    const salt = await bcrypt.genSalt(12);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    
    // Invalidate all refresh tokens (logout from all devices)
    user.refreshTokens = [];
    
    await user.save();

    return res.status(200).json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ success: false, message: 'Reset token has expired.' });
    }
    next(error);
  }
};
