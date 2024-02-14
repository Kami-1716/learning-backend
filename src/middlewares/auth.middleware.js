import ApiError from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

const verifyJwt = asyncHandler( async (req, res, next) => {
  try {
    // get access token from cookies
    const accessToken = req.cookies?.accessToken || req.headers("Authorization").replace("Bearer ", "");
  
    if(!accessToken){
      throw new ApiError(401, "Access token not found");
    }
  
    // verify access token
    const decodedToken = jwt.varify(accessToken, process.env.REFRESH_TOKEN_SECRET);
  
    if(!decodedToken){
      throw new ApiError(401, "Invalid access token");
    }
  
    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
  
    if(!user){
      throw new ApiError(401, "Invalid access token");
    }
  
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Invalid access token");
  }

})

export { verifyJwt };