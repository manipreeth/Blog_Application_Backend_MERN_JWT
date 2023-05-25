const User = require("../../model/user/User");
const bcrypt = require("bcryptjs");
const appErr = require("../../utils/appErr");
const jwt = require("jsonwebtoken");

// Import fom utils
const generateOTP = require("../../utils/generateOTP");
const mailOTP = require("../../utils/nodeMailer");
const verifyOTP = require("../../utils/verifyOTP");
// OTP Model
const OtpVerification = require("../../model/OtpVerification");

// Controllers
const registerCtrl = async (req, res, next) => {
  const { fullname, email, password, mobile } = req.body;
  if (!fullname || !email || !password) {
    return next(appErr("All fields are required", 404));
  }

  const userFound = await User.findOne({ email });
  // check if user already exsist and account is not verified
  if (userFound && !userFound.isVerified) {
    const generatedOTP = await generateOTP(userFound._id);
    const otpSent = await mailOTP(generatedOTP, userFound.email);
    if (otpSent) {
      return next(appErr(`Verify your account ${userFound.id}`, 404));
    }
  }

  // check if the user exist(email)
  if (userFound) {
    return next(appErr("User already Exist"));
  }

  // if user does not exist
  else {
    try {
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

      const generatedOTP = await generateOTP(user._id);
      const otpSent = await mailOTP(generatedOTP, user.email);

      res.json({
        status: "User Registered successfully",
        data: user._id,
      });
    } catch (error) {
      return next(appErr(error.message));
    }
  }
};

const verifyEmailCtrl = async (req, res, next) => {
  const { otp } = req.body;
  const userId = req.params.id;

  // if Otp didn't available from frontend
  if (!otp) return next(appErr("Please enter otp", 404));

  // If Otp available from frontend
  try {
    const verified = await verifyOTP(userId, otp);
    if (verified === "Successful") {
      // Find user
      const user = await User.findById(userId);

      // If user not found
      if (!user) return next(appErr("User Not Found", 404));

      // if user found then update user isVerified value
      user.isVerified = true;
      await user.save();

      res.json({
        status: "User verified successfully",
      });
    } else {
      return next(verified);
    }
  } catch (error) {
    return next(appErr(error.message));
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

    // if user account is not verified
    if (!userFound.isVerified) {
      const otpGenerated = await generateOTP(userFound._id);
      const otpSent = await mailOTP(otpGenerated, userFound.email);
      return next(appErr(`Verify your account ${userFound.id}`, 404));
    }

    // if user account is verified
    // verify password
    const isPasswordVaild = await bcrypt.compare(password, userFound.password);

    if (!isPasswordVaild) {
      return next(appErr("Invaild login credentials", 404));
    }

    // if email and password is matched then Generate OTP by passing userid to generateOTP Function
    const otpGenerated = await generateOTP(userFound._id);

    // Pass generated Otp to mailOTP function to send it to user by nodemailer
    await mailOTP(otpGenerated, userFound.email);

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

const verifyOtpCtrl = async (req, res, next) => {
  const { otp } = req.body;

  //get userId from request object
  const userId = req.user.id;

  //* Save the user into session
  req.session.userAuth = userId;

  if (!otp) {
    return next(appErr("OTP is required", 404));
  }
  try {
    const verified = await verifyOTP(userId, otp);
    if (verified === "Successful") {
      return res.json({ data: verified });
    } else {
      return next(verified);
    }
  } catch (error) {
    return next(appErr(error));
  }
};

const userPostsCtrl = async (req, res) => {
  try {
    //get userId from user property of request object
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

    if (usernameTaken) {
      // If the user is already taken it sends a error
      if (usernameTaken._id.toString() !== userId.toString()) {
        return next(appErr("Username already taken", 400));
      }
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

const logoutCtrl = async (req, res, next) => {
  //get userId from session
  const userId = req.user.id;

  try {
    await OtpVerification.findOneAndDelete({
      userId,
    });

    // Destroy the current session
    await req.session.destroy();

    res.json({
      status: "Logout Successful",
    });
  } catch (error) {
    return next(appErr(error.message));
  }
};

module.exports = {
  registerCtrl,
  verifyEmailCtrl,
  loginCtrl,
  verifyOtpCtrl,
  userPostsCtrl,
  profileCtrl,
  updateUserCtrl,
  logoutCtrl,
};
