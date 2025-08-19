const express = require("express");
const router = express.Router();
const {
  register,
  verifyOtp,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  getAllUsers,
  resendOtp
} = require("../controllers/user.controller");

const { protect } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);
router.get("/users", getAllUsers);
router.get("/resend-otp", resendOtp);

module.exports = router;
