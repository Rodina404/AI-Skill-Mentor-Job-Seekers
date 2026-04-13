const { ApiError } = require("../utils/apiError");

function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next(new ApiError(401, "Not authenticated"));
    if (!roles.includes(req.user.role)) return next(new ApiError(403, "Forbidden"));
    next();
  };
}

module.exports = { requireRole };
