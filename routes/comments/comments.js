const express = require("express");
const commentRouter = express.Router();
const {
  createCommentCtrl,
  updateCommentCtrl,
  deleteCommentCtrl,
} = require("../../controllers/comments/comments");

const isLogin = require("../../middlewares/isLogin");

//POST
commentRouter.post("/:id", isLogin, createCommentCtrl);

//PUT/:id
commentRouter.put("/:id", isLogin, updateCommentCtrl);

//DELETE/:id
commentRouter.delete("/:id", isLogin, deleteCommentCtrl);

module.exports = commentRouter;
