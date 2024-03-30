const ApiError = require("../utils/ApiError");
const User = require("../models/users.models");
const { asyncHandler } = require("../utils/asyncHandler");
const uploadOnCloudinary = require("../utils/cloudinary");
const fs = require("fs");
const ApiResponse = require("../utils/ApiResponse");

const registrationUser = asyncHandler(async (req, res) => {
  const { username, email, fullName, password } = req.body;
  if (!username || !email || !fullName || !password) {
    throw new ApiError("All fields are required.", 400);
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) throw new ApiError("Email or Username already exits.", 409);

  const avatarLocalpath = req.files?.avatar[0]?.path;
  let coverImagelocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverimage) &&
    req.files.coverimage.length > 0
  ) {
    coverImagelocalPath = req.files?.coverimage[0]?.path;
  }
  if (!avatarLocalpath) throw new ApiError("Avatar file is required.", 400);

  const avatarC = await uploadOnCloudinary(avatarLocalpath);
  const coverC = await uploadOnCloudinary(coverImagelocalPath);

  if (!avatarC) throw new ApiError("Avatar file is required.", 400);

  const user = await User.create({
    username,
    fullName,
    email,
    password,
    avatar: avatarC.url,
    coverimage: coverC?.url || "",
  });
  const findUser = await User.findById({ _id: user._id });
  res
    .status(201)
    .json(new ApiResponse(200, findUser, "User registered successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new Error("Email and Password are required!", 400);
  const existUser = await User.findOne({ email });
  if (existUser && (await existUser.isPasswordMatch(password))) {
    res.status(200).json(new ApiResponse(''))
  }
});

module.exports = { registrationUser, loginUser };
