const User = require("../../model/user/User");
const bcrypt = require("bcryptjs");
const appErr = require("../../utils/appErr");
const jwt = require("jsonwebtoken");

const registerCtrl = async (req, res, next) => {
  const { fullname, email, password, mobile } = req.body;
  if (!fullname || !email || !password) {
    return next(appErr("All fields are required", 404));
  }
  try {
    // check if the user exist(email)
    const userFound = await User.findOne({ email });
    if (userFound) {
      return next(appErr("User already Exist"));
    }

    // if user does not exist
    else {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHashed = await bcrypt.hash(password, salt);

      // register user
      const user = await User.create({
        fullname,
        email,
        password: passwordHashed,
        mobile,
      });
      res.json({
        status: "User Registered successfully",
        data: user,
      });
    }
  } catch (error) {
    res.json(error.message);
  }
};

const loginCtrl = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(appErr("Email and password fields are required", 404));
  }
  try {
    // check if email exist
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return next(appErr("Invaild login credentials", 404));
    }
    // verify password
    const isPasswordVaild = await bcrypt.compare(password, userFound.password);

    if (!isPasswordVaild) {
      return next(appErr("Invaild login credentials", 404));
    }

    //* create the JSON Web Token using userid
    const generateToken = (id) => {
      // Sign JWT
      return jwt.sign({ id }, "secretKey", { expiresIn: "24h" });
    };
    // Generate JWT
    const Token = generateToken(userFound._id);

    res.json({
      status: "success",
      token: Token,
    });
  } catch (error) {
    res.json(error.message);
  }
};

const userPostsCtrl = async (req, res) => {
  try {
    //get userId from session
    const userId = req.user.id;

    //find the user
    const user = await User.findById(userId).populate("posts");

    const posts = user.posts;

    res.json({
      status: "success",
      data: posts,
    });
  } catch (error) {
    res.json(error);
  }
};

const profileCtrl = async (req, res) => {
  try {
    // get the login user id from JSON WEB TOKEN
    const userId = req.user.id;
    // Find the user
    const user = await User.findById(userId);

    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.json(error);
  }
};

const updateUserCtrl = async (req, res, next) => {
  const { mobile, username, about, gender } = req.body;

  try {
    //get userId from session
    const userId = req.user.id;
    const user = await User.findById(userId);

    // To check if username updated by user is whether already taken
    const usernameTaken = await User.findOne({ username });

    // If the user is already taken it sends a error
    if (usernameTaken._id.toString() !== user._id.toString()) {
      return next(appErr("Username already taken", 400));
    }

    // update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profileImage: req.file.path, mobile, username, about, gender },
      { new: true }
    );

    res.json({
      status: "Profile Updated Successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

const logoutCtrl = async (req, res) => {
  try {
    req.session.destroy();
    res.json({
      status: "Logout Successful",
    });
  } catch (error) {
    res.json(error);
  }
};

module.exports = {
  registerCtrl,
  loginCtrl,
  userPostsCtrl,
  profileCtrl,
  updateUserCtrl,
  logoutCtrl,
};
