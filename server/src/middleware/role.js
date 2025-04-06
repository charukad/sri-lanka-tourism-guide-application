/**
 * Role-based access control middleware
 * @param {string|Array} roles - Role or array of roles allowed to access the resource
 * @returns {Function} - Express middleware function
 */
const roleMiddleware = (roles) => {
  // Convert single role to array
  if (!Array.isArray(roles)) {
    roles = [roles];
  }

  return (req, res, next) => {
    // Check if user exists (should be set by auth middleware)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    // Check if user has required role
    if (!roles.includes(req.user.user_type)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

module.exports = roleMiddleware;
