import asyncHandler from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import jwt from "jsonwebtoken";
import { User } from "../models/users.model";

//Flow:
//Register -> Login (Generate access and Refresh Token) -> Refresh Token (Generate new access token) -> Logout

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.log("Error generating tokens", error);
    throw new ApiError(500, "Error generating refresh and access tokens");
  }
};

//!-----------------------Register User--------------------------
const registerUser = asyncHandler(async (req, res) => {
  //Extract data from the request body
  //Validate required fields
  //Check if user with email,username already exists
  //Create a new User document using the mongoose model created earlier in users.model.js
  //Remove password and refreshToken from response
  //Return response if user is created successfully else throw an error

  const { fullName, userName, email, password } = req.body;

  if (
    fullName === undefined ||
    email === undefined ||
    userName === undefined ||
    password === undefined
  ) {
    throw new ApiError(400, "Please fill all the fields");
  }
  if (
    [fullName, email, userName, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "Please fill all the fields");
  }

  User.findOne({ $or: [{ email }, { userName }] }).then((existedUser) => {
    if (existedUser) {
      throw new ApiError(409, "User with email and username already exists");
    }
  });

  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Error in registering the user");
  }

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

//!-----------------------Login User--------------------------
const loginUser = asyncHandler(async (req, res) => {
  //Extract data from the request body
  //Validate required fields
  //Find that user in db
  //Check if password is correct
  //Generate access and refresh token
  //Remove password and refreshToken from response
  //Return response with access token

  const { email, userName, password } = req.body;

  if (!email && !userName) {
    throw new ApiError(400, "Email or Username is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const user = await User.findOne({ $or: [{ email }, { userName }] });
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User Logged In Successfully"
      )
    );
});

//!-----------------------Log Out User--------------------------
const logOutUser = asyncHandler(async (req, res) => {
  //Clear Cookies
  //Clear RefreshToken from db
  //Return response

  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out Successfully"));
});

//!-----------------------Generate New access Token from refresh token--------------------------
const refreshAccessToken = asyncHandler(async (req, res) => {
  //Extract refresh token from request cookie or body (Web or Mobile)
  //Verify if refresh token is valid
  //Check if the incoming refresh token that user is sending is same as the refresh Token stored in db
  //Generate new access token
  //Return response with new access token

  const { incomingRefreshToken } =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized");
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(404, "User not found");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token is expired or used");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed Successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh Token");
  }
});

//!----------------------Change Current Password--------------------------
const changeCurrentPassword = asyncHandler(async (req, res) => {
  //---------------------K k Chaiyo user le password change garda--------------------------
  // 1.Get Current Password, New Password, Confirm Password from frontend
  // 2.Check if Current Password is correct
  // 3.Check if New Password and Confirm Password match
  // 4.Update Password
  // 5.Send Response

  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);
  const isPasswordCorrect = user.isPasswordCorrect(oldPassword);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid old passoword");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password Changed Successfully"));
});

//!-----------------Update Account Details-----------
const updateAccountDetails = asyncHandler(async (req, res) => {
  //---------------------K k Chaiyo user le account details update garda--------------------------
  // 1.Get Updated Details from frontend
  // 2.Update User Details
  // 3.Send Response

  const { fullName, email, userName } = req.body;

  if ([fullName, email, userName].some((field) => field.trim() === "")) {
    throw new ApiError(400, "Please fill all the fields");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullName: fullName,
        email: email,
        userName: userName,
      },
    },
    {
      new: true,
    }
  ).select("-password -refreshToken");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User Details Updated Successfully"));
});

//!---------------------Get Current User----------------------------
const getCurrentUser = asyncHandler(async (req, res) => {
  //---------------------K k Chaiyo user le password change garda--------------------------
  // 1.Get Current User from req.user
  // 2.Send Response

  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current User Fetched Successfully"));
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  getCurrentUser,
};
