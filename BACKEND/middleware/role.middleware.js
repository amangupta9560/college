export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied. Insufficient permissions.' });
    }
    
    next();
  };
};

export const requireOwner = (ownerField = 'owner') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    // This middleware expects req.resource to be populated by a previous middleware
    const resource = req.resource;
    if (!resource) {
      return res.status(500).json({ success: false, message: 'Resource not loaded for ownership check.' });
    }

    const ownerId = resource[ownerField]?._id || resource[ownerField];
    
    if (req.user.role === 'admin') {
      return next();
    }

    if (ownerId && ownerId.toString() === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({ success: false, message: 'Access denied. You do not own this resource.' });
  };
};
