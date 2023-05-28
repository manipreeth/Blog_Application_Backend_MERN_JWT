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
  const userId = req.user.id;

  try {
    const posts = await Post.find({ user: { $ne: userId } })
      .populate("comments")
      .populate("user");

    res.json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

// We can acess the post with specific id of post in database
const fetchPostCtrl = async (req, res, next) => {
  try {
    // get the id from params
    const id = req.params.id;

    // find the post with id
    const post = await Post.findById(id)
      .populate({
        path: "comments",
        populate: {
          path: "user",
        },
      })
      .populate("user");

    // get the login user id from JSON WEB TOKEN
    const userId = req.user.id;

    res.json({
      status: "success",
      data: post,
      userId: userId,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

// Delete post with specific id
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

// Update Post with specific id
const updatepostCtrl = async (req, res, next) => {
  const { title, description, category, image } = req.body;
  try {
    // find the post
    const post = await Post.findById(req.params.id).populate("comments");

    // check if the post belongs to the user
    if (post.user.toString() !== req.user.id.toString()) {
      return next(appErr("You are not allowed to update this post", 403));
    }

    //update
    const postUpdated = await Post.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        category,
        image: req.file.path,
      },
      {
        new: true,
      }
    );

    res.json({
      status: "success",
      data: postUpdated,
    });
  } catch (error) {
    res.json(error);
  }
};

// Like Post with specific id
const likepostCtrl = async (req, res, next) => {
  // get user id
  const userId = req.user.id;
  // get post id
  const postId = req.params.id;
  // get post
  const post = await Post.findById(postId);

  if (post) {
    // add the user to the likes array
    const postLiked = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          likes: userId,
        },
      },
      {
        new: true,
      }
    );
    // add post to array of posts liked by user
    const userPost = await User.findByIdAndUpdate(
      userId,
      {
        $push: { postsLiked: postId },
      },
      {
        new: true,
      }
    );

    res.json({
      status: "success Liked",
      data: postLiked,
      user: userPost,
    });
  } else {
    return next(appErr("Post not found", 404));
  }
};

// Unlike Post with specific id
const unlikepostCtrl = async (req, res, next) => {
  // get user id
  const userId = req.user.id;

  // get post id
  const postId = req.params.id;

  // get post
  const post = await Post.findById(postId);
  if (post) {
    // check if the post belongs to the user
    if (post.user.toString() === userId) {
      return next(appErr("You are not allowed to unlike this post", 403));
    }

    // remove like
    const postUnliked = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: {
          likes: userId,
        },
      },
      {
        new: true,
      }
    );

    // remove post from posts liked by user
    const userPost = await User.findByIdAndUpdate(
      userId,
      {
        $pull: {
          postsLiked: postId,
        },
      },
      {
        new: true,
      }
    );
    // return post
    return res.json({
      status: "success",
      data: postUnliked,
      user: userPost,
    });
  } else {
    return next(appErr("Post not found", 404));
  }
};

// viewpost of specific id when user share url
const viewPostCtrl = async (req, res, next) => {
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

    return res.json({
      status: "success",
      data: post,
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
  updatepostCtrl,
  likepostCtrl,
  unlikepostCtrl,
  viewPostCtrl,
};
