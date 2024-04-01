const User = require("../models/users.models");
const jwt = require("jsonwebtoken");
const { asyncHandler } = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const authMiddlware = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new ApiError("Unauthorized request", 400);
    const { _id } = jwt.verify(token, process.env.ACCESS_TOKEN);
    const user = await User.findById(_id).select("-password -refreshToken");
    if (!user) throw new ApiError("Invalid Access token", 400);
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    throw new ApiError(error?.message, 400);
  }
});
module.exports = authMiddlware;
