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

const generateAccessandRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accesstoken = user.generateAccessToken();
    const refreshtoken = user.generateRefreshToken();
    user.refreshToken = refreshtoken;
    await user.save();
    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new Error("Something went wrong during access and refresh token!");
  }
};
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new Error("Email and Password are required!", 400);
  const existUser = await User.findOne({ email });
  if (existUser && (await existUser.isPasswordMatch(password))) {
    const user = await User.findById(existUser._id).select(
      "-password -refreshToken"
    );
    const { accesstoken, refreshtoken } = await generateAccessandRefreshToken(
      user._id
    );
    const cookieOptions = {
      httpOnly: true,
      secure: true,
    };
    res
      .cookie("accessToken", accesstoken, cookieOptions)
      .cookie("refreshToken", refreshtoken, cookieOptions)
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            user,
            accesstoken,
            refreshtoken,
          },
          "Login Successfully"
        )
      );
  } else {
    throw new Error("Invalid Crediential!", 400);
  }
});

const LogoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    { new: true }
  );
  const cookieOptions = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logout User"));
});

module.exports = { registrationUser, loginUser, LogoutUser };
