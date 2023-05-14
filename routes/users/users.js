const express = require("express");
const userRoutes = express.Router();
const multer = require("multer");
const storage = require("../../config/cloudinary");

const {
  registerCtrl,
  loginCtrl,
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

//POST/login
userRoutes.post("/login", loginCtrl);

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
