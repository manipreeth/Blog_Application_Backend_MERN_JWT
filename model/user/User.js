const mongoose = require("mongoose");

// Schema
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    username: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    gender: {
      type: String,
    },
    about: {
      type: String,
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);

// Compile schema to form a model
const User = mongoose.model("User", userSchema);

module.exports = User;
