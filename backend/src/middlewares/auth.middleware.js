const { ApiError } = require("../utils/apiError");
const { verifyAccessToken } = require("../utils/jwt");

function authenticate(req, _res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return next(new ApiError(401, "Missing or invalid Authorization header"));
  }

  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (e) {
    next(new ApiError(401, "Invalid or expired token"));
  }
}

module.exports = { authenticate };
