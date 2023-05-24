const express = require("express");
const userRoutes = express.Router();
const multer = require("multer");
const storage = require("../../config/cloudinary");

const {
  registerCtrl,
  verifyEmailCtrl,
  loginCtrl,
  verifyOtpCtrl,
  userPostsCtrl,
  profileCtrl,
  updateUserCtrl,
  logoutCtrl,
} = require("../../controllers/users/users");

const isLogin = require("../../middlewares/isLogin");

// Instance of multer
const upload = multer({ storage });

//POST/register
userRoutes.post("/register", registerCtrl);

//POST/verifyEmail
userRoutes.post("/verifyEmail/:id", verifyEmailCtrl);

//POST/login
userRoutes.post("/login", loginCtrl);

//POST/verifyotp
userRoutes.post("/verifyotp", isLogin, verifyOtpCtrl);

//GET/profile
userRoutes.get("/profile", isLogin, profileCtrl);

//PUT/update user details
userRoutes.put(
  "/update",
  upload.single("profileImage"),
  isLogin,
  updateUserCtrl
);

//GET/posts
userRoutes.get("/posts", isLogin, userPostsCtrl);

//GET/logout
userRoutes.get("/logout", logoutCtrl);

module.exports = userRoutes;
