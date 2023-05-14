const User = require("../../model/user/User"); // User model
const Post = require("../../model/post/Post"); // Post model
const appErr = require("../../utils/appErr");

const createPostCtrl = async (req, res, next) => {
  const { title, description, category } = await req.body;
  try {
    if (!title || !description || !category || !req.file) {
      return next(appErr("All fields are required", 404));
    }
    // //* 1. Find the user by using JWT
    const userId = await req.user.id;
    const userFound = await User.findById(userId);

    // create the post
    const postCreated = await Post.create({
      title,
      description,
      category,
      image: req.file.path,
      user: userFound._id,
    });

    //* push the post created into the array of user's posts
    userFound.posts.push(postCreated._id);

    //*  Re-save User model
    await userFound.save();

    res.json({
      status: "Posted successfully",
      data: postCreated,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// We can acess all the posts in database
const fetchPostsCtrl = async (req, res, next) => {
  try {
    const posts = await Post.find().populate("comments").populate("user");

    res.json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// We can acess the post with specify id of post in database
const fetchPostCtrl = async (req, res, next) => {
  try {
    // get the id from params
    const id = req.params.id;
    // find the post
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
      })
      .populate("user");

    res.json({
      status: "success",
      data: post,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

const deletePostCtrl = async (req, res, next) => {
  try {
    // find the post
    const post = await Post.findById(req.params.id);

    // check if the post belongs to the user
    if (post.user.toString() !== req.user.id.toString()) {
      return next(appErr("You are not allowed to delete this post", 403));
    }

    //delete post
    await Post.findByIdAndDelete(req.params.id);

    res.json({
      status: "success",
      data: "Post has been deleted successfully",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

module.exports = {
  createPostCtrl,
  fetchPostsCtrl,
  fetchPostCtrl,
  deletePostCtrl,
};
