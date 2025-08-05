const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../services/emailService");
const { generateOTP } = require("../services/otpService");
const jwt = require("jsonwebtoken");

exports.register = async (req, res, next) => {
  const { name, email, phone, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const otp = generateOTP();
    await Otp.create({ email, otp });

    await sendEmail({
      email,
      subject: "Krishna Lighting - OTP Verification",
      message: `Your OTP for account verification is ${otp}. It will expire in 10 minutes.`,
    });

    const user = await User.create({
      name,
      email,
      phone,
      password,
      isVerified: false,
    });

    res.status(201).json({
      success: true,
      message: "OTP sent to your email",
      data: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email, otp });
    if (!otpRecord) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP or expired" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    );

    await Otp.deleteOne({ _id: otpRecord._id });
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Account verified successfully",
      token,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(401).json({
        success: false,
        message: "Account not verified. Please verify your email first.",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      data: user,
    });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // Create JWT token for password reset (expires in 1 hour)
    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Create reset URL
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: "Krishna Lighting - Password Reset",
      message: `You are receiving this email because you (or someone else) has requested to reset your password. Please click on the following link to reset your password: \n\n ${resetUrl}`,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    // Set new password
    user.password = password;
    await user.save();

    // Generate new auth token for immediate login
    const authToken = generateToken(user._id);

    res.status(200).json({
      success: true,
      token: authToken,
      message: "Password reset successful",
    });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Password reset link has expired",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Invalid token",
      });
    }
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, email, phone, address } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email and phone are required",
      });
    }

    // Check if email is valid
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email",
      });
    }

    // Check if phone is valid (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid 10-digit phone number",
      });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name,
        email,
        phone,
        address,
      },
      { new: true, runValidators: true }
    ).select("-password -cart");

    res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -cart -__v"
    );

    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password  -__v");
    res.status(200).json({
      success: true,
      users,
    });
  } catch (err) {
    next(err);
  }
};