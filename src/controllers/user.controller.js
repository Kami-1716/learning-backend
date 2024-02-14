import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { cloudinaryFileUpload } from "../utils/cloudinary.js";


const generateAccessRefreshTokens = async (userId) => {

    try {
      const user = await User.findById(userId);

      const accessToken = user.createAccessToken()
      const refreshToken = user.createRefreshToken()

      user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false})

      return {accessToken, refreshToken}

      
    } catch (error) {
      throw new ApiError(500, "Something went wrong while generating tokens");
    }

}

const registerUser = asyncHandler(async (req, res) => {
  // getting user data from request body
  const { username, email, fullName, password } = req.body;

  // validation for required fields
  if (
    [username, email, fullName, password].some(field => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // validation for email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new ApiError(400, "Invalid email format");
  }

  // validation for password length
  if (password.length < 8) {
    throw new ApiError(400, "Password must be at least 8 characters");
  }

  // check if user already exists
  const userExists = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (userExists) {
    throw new ApiError(400, "User already exists");
  }

  // check for files
  const avatarLocalPath = req.files?.avatar[0]?.path;
 // const coverImageFilePath = req.files?.coverImage[0]?.path;

 let coverImageFilePath;
 if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
    coverImageFilePath = req.files.coverImage[0].path;
 }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload files to cloudinary
  const avatar = await cloudinaryFileUpload(avatarLocalPath);
  const coverImage = await cloudinaryFileUpload(coverImageFilePath);

  if (!avatar) {
    throw new ApiError(500, "Something went wrong while uploading avatar");
  }

  // create user object
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const userCreated = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new ApiError(500, "Something went wrong while creating user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", userCreated));
});

const loginUser = asyncHandler(async (req, res) => {

  // getting user data from request body
  const {username, email, password} = req.body;

  // validation for required fields
  if (!(username || email)){
    throw new ApiError(400, "Username or email is required");
  }

  // find user by username or email
  const user = User.findOne({
    $or: [{username}, {email}]
  })

  if(!user){
    throw new ApiError(400, "User not found");
  }

  // check password
  const isPasswordValid = await user.isPasswordCorrect(password);

  if(!isPasswordValid){
    throw new ApiError(400, "Invalid password");
  }

  // create access token
  const {accessToken, refreshToken} = await generateAccessRefreshTokens(user._id);

  const loggedInUser = await User.findByIdAndUpdate(user._id, {refreshToken}).select("-password -refreshToken");

  // set cookies
  const options = {
    secure: true,
    httpOnly: true,
  }

  res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(new ApiResponse(200,
    {
      user: loggedInUser, accessToken, refreshToken
    }, "User logged in successfully", ));

})

const logoutUser = asyncHandler(async (req, res) => {

  const loggedOutUser = await User.findByIdAndUpdate(req.user._id, {
    $set: {
      refreshToken: undefined
    }
  })

  const options = {
    secure: true,
    httpOnly: true,
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged out successfully"));



})



export { registerUser, loginUser, logoutUser };
