import { User } from "../models/user.model.js";

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
  }
};

const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;
    if (
      [fullName, username, email, password].some(
        (field) => field?.trim() === ""
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
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    if (!(email || username)) {
      res.json({
        status: 400,
        message: "Email or Username must required",
      });
      return;
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (!existingUser) {
      res.json({ status: 404, message: "User not found" });
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
    };

    return res.status(200).cookie("accessToken", accessToken, options).json({
      status: 200,
      message: "User successfully logged in.",
      data: loggedInUser,
    });
  } catch (error) {
    console.log("User Login ERROR: ", error);
  }
};

const logoutUser = async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res.status(200).clearCookie("accessToken", options).json({status: 200, message: "User logout successfully."});
};

export { registerUser, loginUser, logoutUser };
