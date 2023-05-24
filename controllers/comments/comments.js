const Post = require("../../model/post/Post");
const User = require("../../model/user/User");
const Comment = require("../../model/comment/Comment");
const appErr = require("../../utils/appErr");

const createCommentCtrl = async (req, res, next) => {
  const { message } = req.body;
  try {
    //find the post
    const post = await Post.findById(req.params.id);
    //create the comment
    const comment = await Comment.create({
      user: req.user.id,
      message,
    });

    // push the comment to post
    post.comments.push(comment._id);

    // find the user
    const user = await User.findById(req.user.id);

    // push the comment into user
    user.comments.push(comment._id);

    // disable validation
    // save
    await post.save({ validateBeforeSave: false });
    await user.save({ validateBeforeSave: false });

    res.json({
      status: "success",
      data: comment,
    });
  } catch (error) {
    res.json(error);
    next(appErr(error.message));
  }
};

const updateCommentCtrl = async (req, res, next) => {
  const { message } = req.body;

  if (!message) {
    return next(appErr("Please add a Comment", 400));
  }
  try {
    // find the comment
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return next(appErr("Comment posted by user not found", 404));
    }

    // check if the comment belongs to the user
    if (comment.user.toString() !== req.user.id.toString()) {
      return next(appErr("You are not allowed to update this comment", 403));
    }

    //update
    const commentUpdated = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        message,
      },
      {
        new: true,
      }
    );

    res.json({
      status: "success",
      data: commentUpdated,
    });
  } catch (error) {
    // res.json(error);
    return next(appErr(error.message));
  }
};

const deleteCommentCtrl = async (req, res, next) => {
  try {
    // find the comment
    const comment = await Comment.findById(req.params.id);

    // check if the comment belongs to the user
    if (comment.user.toString() !== req.user.id.toString()) {
      return next(appErr("You are not allowed to delete this comment", 403));
    }

    //delete comment
    await Comment.findByIdAndDelete(req.params.id);

    res.json({
      status: "success",
      data: "Comment has been deleted successfully ",
    });
  } catch (error) {
    // res.json(error);
    next(appErr(error.message));
  }
};

module.exports = {
  createCommentCtrl,
  updateCommentCtrl,
  deleteCommentCtrl,
};
