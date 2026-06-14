import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const parseCookies = (cookieHeader) => {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    list[parts.shift().trim()] = decodeURI(parts.join('='));
  });
  return list;
};

export const verifyAccessToken = async (req, res, next) => {
  try {
    let token = null;

    // Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // Fallback to cookie
    else if (req.headers.cookie) {
      const cookies = parseCookies(req.headers.cookie);
      token = cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user and check if active
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User account is inactive or does not exist.' });
    }

    req.user = user; // Attach full user object
    next();
  } catch (error) {
    console.error('AccessToken Verification Error:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Access token expired.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid access token.' });
  }
};

export const verifyRefreshToken = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.cookie) {
      const cookies = parseCookies(req.headers.cookie);
      token = cookies.refreshToken;
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'Refresh token is required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User account is inactive or does not exist.' });
    }

    // Verify token exists in the user's refresh tokens list
    // Since we store hashed/unhashed refresh tokens, we can compare directly or check array.
    // The PRD says: "refreshTokens array limited to 5; oldest evicted on overflow (device logout)"
    const tokenExists = user.refreshTokens.includes(token);
    if (!tokenExists) {
      return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
    }

    req.user = user;
    req.refreshToken = token;
    next();
  } catch (error) {
    console.error('RefreshToken Verification Error:', error.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }
};
