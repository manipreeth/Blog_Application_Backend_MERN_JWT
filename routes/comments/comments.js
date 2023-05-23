const express = require("express");
const commentRouter = express.Router();
const {
  createCommentCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
} = require("../../controllers/comments/comments");

const isLogin = require("../../middlewares/isLogin");

//POST
commentRouter.post("/:id", isLogin, createCommentCtrl);

//DELETE/:id
commentRouter.delete("/:id", isLogin, deleteCommentCtrl);

//PUT/:id
commentRouter.put("/:id", isLogin, updateCommentCtrl);

module.exports = commentRouter;
