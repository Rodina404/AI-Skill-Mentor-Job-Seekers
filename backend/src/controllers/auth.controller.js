const bcrypt = require("bcryptjs");
const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
const { signAccessToken } = require("../utils/jwt");
const { env } = require("../config/env");
const SALT_WORK_FACTOR = env.bcryptSaltRounds;
// ✅ adjust to your actual model path
const User = require("../models/users/user.model.js");

const register = asyncHandler(async (req, res) => {
  const { email, password, role, fullName } = req.body;

  const exists = await User.findOne({ email }).lean();
  if (exists) throw new ApiError(409, "Email already registered");

  const passwordHash = await bcrypt.hash(password, SALT_WORK_FACTOR);

  const user = await User.create({
    email,
    password,
    role,
    fullName,
    isActive: true,
    isEmailVerified: false,
  });

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role });

  res.status(201).json({
    success: true,
    data: {
      accessToken,
      user: { id: user._id, email: user.email, role: user.role, fullName: user.fullName },
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email");
  if (user.isActive === false) throw new ApiError(403, "Account disabled");

  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError(401, "Invalid or password");

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role });

  res.json({
    success: true,
    data: {
      accessToken,
      user: { id: user._id, email: user.email, role: user.role },
    },
  });
});


const me = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const user = await User.findById(req.user.id).select("email role fullName isActive isEmailVerified").lean();
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: user });
});

// Placeholders for later email/token implementation
const forgotPassword = asyncHandler(async (_req, res) => {
  res.json({ success: true, message: "If that email exists, a reset link was sent." });
});

const resetPassword = asyncHandler(async (_req, res) => {
  res.json({ success: true, message: "Password reset successful." });
});

module.exports = { register, login, me, forgotPassword, resetPassword };
