const express = require("express");
const postRouter = express.Router();
const {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  deletePostCtrl,
  updatepostCtrl,
  likepostCtrl,
  unlikepostCtrl,
} = require("../../controllers/posts/posts");

const multer = require("multer");
const storage = require("../../config/cloudinary");
const isLogin = require("../../middlewares/isLogin");

//* Instance of multer
const upload = multer({ storage });

//POST
postRouter.post("/", isLogin, upload.single("postImage"), createPostCtrl);

//GET
postRouter.get("/", isLogin, fetchPostsCtrl);

//GET/:id
postRouter.get("/:id", fetchPostCtrl);

//DELETE/:id
postRouter.delete("/:id", isLogin, deletePostCtrl);

//PUT/:id
postRouter.put("/:id", isLogin, upload.single("postImage"), updatepostCtrl);

// Post/:id
// route to like post
postRouter.post("/like/:id", isLogin, likepostCtrl);

// Post/:id
// route to unlike post
postRouter.post("/unlike/:id", isLogin, unlikepostCtrl);

module.exports = postRouter;
