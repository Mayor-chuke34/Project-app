// middleware/admin.js - Create this new file
const adminMiddleware = (req, res, next) => {
  try {
    // Check if user exists and is admin
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Admin access required' 
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error in admin check',
      error: error.message 
    });
  }
};

module.exports = adminMiddleware;