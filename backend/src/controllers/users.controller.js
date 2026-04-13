const { asyncHandler } = require("../utils/asyncHandler");
const { ApiError } = require("../utils/apiError");
const User = require("../models/users/user.model.js");

const getMe = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const user = await User.findById(req.user.id).select("-passwordHash").lean();
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: user });
});

const updateMe = asyncHandler(async (req, res) => {
  if (!req.user) throw new ApiError(401, "Not authenticated");
  const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true })
    .select("-passwordHash")
    .lean();
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, data: user });
});

module.exports = { getMe, updateMe };
