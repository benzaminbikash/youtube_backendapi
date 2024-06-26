const ApiError = require("../utils/ApiError");
const User = require("../models/users.models");
const { asyncHandler } = require("../utils/asyncHandler");
const uploadOnCloudinary = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");
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
      // $set: {
      //   refreshToken: null,
      // },
      $unset: {
        refreshToken: 1, // this will help to remove refreshToken field from document
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

const refreshTokenHandler = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingToken) throw new ApiError("Not authorized", 400);
  try {
    const check = jwt.verify(incomingToken, process.env.REFRESH_TOKEN);
    const user = await User.findById(check?._id);
    if (!user) throw new Error("Invalid refresh token", 401);
    if (incomingToken != user?.refreshToken)
      throw new Error("Refresh token is expired", 401);
    const option = {
      httpOnly: true,
      secure: true,
    };
    const { accesstoken, refreshtoken } = await generateAccessandRefreshToken(
      user._id
    );
    res
      .status(200)
      .cookie("accessToken", accesstoken, option)
      .cookie("refreshToken", refreshtoken, option)
      .json(
        new ApiResponse(
          200,
          { accesstoken, refreshtoken },
          "Access token refresh"
        )
      );
  } catch (error) {
    throw new ApiError(error?.message, 400);
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword, confirmationPassword } = req.body;
  if (!oldPassword || !newPassword || !confirmationPassword)
    throw new Error("All fields are required.");
  const _id = req.user._id;
  const user = await User.findById(_id);
  if (!user) throw new Error("User is not authenticated.", 401);
  const checkoldPassword = await user.isPasswordMatch(oldPassword);
  if (!checkoldPassword) throw new Error("Old password is not correct!");
  if (newPassword != confirmationPassword)
    throw new Error("New Password and Confirmation Password are not match.");
  user.password = newPassword;
  user.save();
  res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Change Successfully!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user?._id).select(
    "-password -refreshToken"
  );
  if (!currentUser) throw new Error("No token available", 400);
  res
    .status(200)
    .json(new ApiResponse(200, { currentUser }, "Current User Information"));
});

const updateUserDetails = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id);
  if (req.files) {
    let avatarPath;
    if (Array.isArray(req.files.avatar) && req.files.avatar.length > 0) {
      avatarPath = req.files?.avatar[0].path;
    }

    const coverPath = req.files?.coverimage[0].path;

    const a = await uploadOnCloudinary(avatarPath);
    const c = await uploadOnCloudinary(coverPath);

    const updateInfo = await User.findByIdAndUpdate(
      _id,
      {
        ...req.body,
        avatar: a?.url || user?.avatar,
        coverimage: c?.url || user?.coverimage,
      },
      {
        new: true,
      }
    ).select("-password");
    res
      .status(200)
      .json(
        new ApiResponse(200, { updateInfo }, "Update User Detail Successfully")
      );
  }
  const updateInfo = await User.findByIdAndUpdate(_id, req.body, {
    new: true,
  }).select("-password");
  res
    .status(200)
    .json(
      new ApiResponse(200, { updateInfo }, "Update User Detail Successfully")
    );
});

module.exports = {
  registrationUser,
  loginUser,
  LogoutUser,
  refreshTokenHandler,
  changePassword,
  getCurrentUser,
  updateUserDetails,
};
