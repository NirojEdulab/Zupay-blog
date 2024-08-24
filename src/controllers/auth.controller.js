import mongoose from "mongoose";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";

const generateAccessTokenByUserId = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found!");
    }

    const accessToken = await user.generateAccessToken();

    await user.save({ validateBeforeSave: false });

    return { accessToken };
  } catch (error) {
    console.log("Something went wrong while generating the access token!!!");
    res.json({
      status: 500,
      message: "Server Error",
    });
  }
};

const verifyToken = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      status: 200,
      message: "Token is valid",
      user: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: error.message || "Server Error",
    });
  }
};

const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    if (
      [fullName, username, email, password].some(
        (field) => field?.trim() === "" || field === undefined
      )
    ) {
      res.json({
        status: 400,
        message: "All fields are required.",
      });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      res.json({
        status: 409,
        message: "Duplicate not allowed.",
      });
      return;
    }

    const user = await User.create({
      username: username.toLowerCase(),
      fullName,
      email,
      password,
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      res.json({
        status: 400,
        message: "Something Went Wrong!!! Please try later",
      });
      return;
    }

    res.json({
      status: 200,
      message: "User successfully registered.",
      data: createdUser,
    });
  } catch (error) {
    console.log("User register ERROR: ", error);
    res.json({
      status: 500,
      message: "Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername) {
      res.json({
        status: 400,
        message: "Email or Username must required",
      });
      return;
    }

    const existingUser = await User.findOne({
      $or: [{ username: emailOrUsername }, { email: emailOrUsername }],
    });

    if (!existingUser) {
      res.json({ status: 404, message: "Wrong Credentials!!! Please check" });
      return;
    }

    const isPasswordCorrect = await existingUser.isPasswordCorrect(password);

    if (!isPasswordCorrect) {
      res.json({ status: 400, message: "Wrong Credentials!!! Please check" });
      return;
    }

    const { accessToken } = await generateAccessTokenByUserId(existingUser._id);

    const loggedInUser = await User.findById(existingUser._id).select(
      "-password"
    );

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    };

    return res.status(200).cookie("accessToken", accessToken, options).json({
      status: 200,
      message: "User successfully logged in.",
      data: loggedInUser,
      token: accessToken,
    });
  } catch (error) {
    console.log("User Login ERROR: ", error);
    res.json({
      status: 500,
      message: "Server Error",
    });
  }
};

const logoutUser = async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .json({ status: 200, message: "User logout successfully." });
};

const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, fullName, email, password } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("req.file==>> ", req.files);

    // Handle profile picture update
    if (
      req.files &&
      req.files.profileImage &&
      req.files.profileImage.length > 0
    ) {
      // If user has an existing profile picture, delete it from Cloudinary
      if (user.profilePic) {
        const publicId = user.profilePic.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // Upload new profile picture to Cloudinary
      const uploadResult = await uploadOnCloudinary(
        req.files.profileImage[0].path
      );
      user.profilePic = uploadResult.secure_url;
    }

    // Handle cover image update
    if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
      if (user.coverImage) {
        // If user has an existing cover image, delete it from Cloudinary
        const publicId = user.coverImage.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }

      // Upload new cover image to Cloudinary
      const uploadResult = await uploadOnCloudinary(
        req.files.coverImage[0].path
      );
      user.coverImage = uploadResult.secure_url;
    }

    // Update user fields
    user.username = username || user.username;
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;

    // Update password if provided
    if (password) {
      user.password = password;
    }

    // Save the updated user
    const updatedUser = await user.save();
    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
      status: 200,
    });
  } catch (error) {
    res.json({
      status: 500,
      message: "Server Error",
    });
    console.log("User update ERROR: ", error);
  }
};

const getUserInfo = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        status: 400,
        message: "Invalid user ID",
      });
    }

    let userData = await User.findById(userId).select("-password");
    const userPosts = await Post.find({
      "author._id": userId,
    });

    if (!userData) {
      res.json({
        status: 404,
        message: "User not found!",
      });
      return;
    }

    userData = userData.toObject();
    userData.posts = userPosts;

    res.json({
      status: 200,
      message: "User found",
      data: userData,
    });
  } catch (error) {
    console.log("getUserInfo ERROR: ", error);
    res.json({
      status: 500,
      message: "Server Error",
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const allUsers = await User.find({}).select("-password").sort({
      fullName: 1,
    });

    res.json({
      status: 200,
      message: "All User Data",
      data: allUsers,
    });
  } catch (error) {
    console.log("getAllUsers ERROR: ", error);
    res.json({
      status: 500,
      message: "Server Error",
    });
  }
};

export {
  registerUser,
  loginUser,
  logoutUser,
  verifyToken,
  updateUser,
  getUserInfo,
  getAllUsers,
};
