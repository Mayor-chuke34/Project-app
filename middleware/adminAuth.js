const adminAuth = (req, res, next) => {
  // Check if user exists and is admin
  if (!req.user) {
    return res.status(401).json({ message: 'Access denied. User not authenticated.' });
  }
  
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  
  next();
};

module.exports = adminAuth;