import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      res.json({
        status: 403,
        message: "Unauthorized Access.",
      });
      return;
    }

    const decodedToken = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken._id).select("-password");

    if (!user) {
      res.json({
        status: 401,
        message: "Invalid Access Token",
      });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.json({
      status: 401,
      message: error?.message || "Invalid Access Token",
    });
    return;
  }
};
