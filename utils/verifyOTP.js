const OtpVerification = require("../model/OtpVerification");
const bcrypt = require("bcryptjs");
const appErr = require("./appErr");

const verifyOTP = async (id, recievedOTP) => {
  const userId = id;
  try {
    const otpUser = await OtpVerification.findOne({ userId });

    // If OTP of corresponding user is not found
    if (!otpUser) {
      return appErr("OTP Expired", 404);
    }

    // If OTP of corresponding user is found
    const decrytpedOTP = await bcrypt.compare(recievedOTP, otpUser.otp);

    // If OTP of corresponding user is not matched
    if (!decrytpedOTP) {
      return appErr("Please Check OTP Entered", 404);
    } else {
      // After otp is matched delete the otp from database
      await OtpVerification.deleteOne({ userId });
      return "Successful";
    }
  } catch (error) {
    return error;
  }
};

module.exports = verifyOTP;
