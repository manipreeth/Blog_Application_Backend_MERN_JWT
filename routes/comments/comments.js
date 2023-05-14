const express = require("express");
const commentRouter = express.Router();
const { createCommentCtrl } = require("../../controllers/comments/comments");
const isLogin = require("../../middlewares/isLogin");

//POST
commentRouter.post("/:id", isLogin, createCommentCtrl);

module.exports = commentRouter;
