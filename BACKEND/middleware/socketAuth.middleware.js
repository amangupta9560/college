import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateSocket = async (socket, next) => {
  try {
    // Check token from auth payload or authorization header
    let token = socket.handshake.auth?.token;

    if (!token && socket.handshake.headers?.authorization) {
      const parts = socket.handshake.headers.authorization.split(' ');
      if (parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user and check if active
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return next(new Error('Authentication error: User inactive or not found'));
    }

    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket Auth Error:', error.message);
    return next(new Error('Authentication error: Invalid or expired token'));
  }
};
