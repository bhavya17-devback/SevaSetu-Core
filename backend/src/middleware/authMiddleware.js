const User = require('../models/User');
const { verifyToken } = require('../utils/token');

const BLOCKED_MESSAGES = {
  blocked: 'Your account has been suspended. Please contact the admin.',
  rejected: 'Your account was not approved. Please contact the admin.',
  pending: 'Your account is waiting for admin approval.',
};

// Protect routes - verifies the JWT and that the account is still allowed in
const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';

  if (!header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = verifyToken(header.split(' ')[1]);

    // Attach user object to request (excluding password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found or deleted' });
    }

    // A suspended user's existing token stops working immediately.
    if (user.status && user.status !== 'active') {
      return res.status(403).json({
        message: BLOCKED_MESSAGES[user.status] || 'Your account is not active.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Role Authorization Middleware (legacy, exact match)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Case-insensitive role check: requireRole("ngo"), requireRole("donor", "ngo")
// Existing accounts may have "NGO" or "ngo", so compare lower-cased.
const requireRole = (...roles) => {
  const allowed = roles.map((role) => role.toLowerCase());

  return (req, res, next) => {
    const role = req.user ? String(req.user.role).toLowerCase() : '';

    if (!allowed.includes(role)) {
      return res.status(403).json({
        success: false,
        message: `This action is only available to ${roles.join(' / ')} accounts`,
      });
    }
    next();
  };
};

// Shortcut for admin-only routes
const adminOnly = requireRole('admin');

module.exports = { protect, authorize, requireRole, adminOnly };
