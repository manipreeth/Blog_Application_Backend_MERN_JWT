const express = require("express");
const postRouter = express.Router();
const {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  deletePostCtrl,
} = require("../../controllers/posts/posts");

const multer = require("multer");
const storage = require("../../config/cloudinary");
const isLogin = require("../../middlewares/isLogin");

//* Instance of multer
const upload = multer({ storage });

//POST
postRouter.post("/", isLogin, upload.single("postImage"), createPostCtrl);

//GET
postRouter.get("/", fetchPostsCtrl);

//GET/:id
postRouter.get("/:id", fetchPostCtrl);

//DELETE/:id
postRouter.delete("/:id", isLogin, deletePostCtrl);

module.exports = postRouter;
