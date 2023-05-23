const OtpVerification = require("../model/OtpVerification");
const bcrypt = require("bcryptjs");

const generateOTP = async (id) => {
  try {
    const otp = `${Math.floor(Math.random() * 9000 + 1000)}`;

    // Hash otp
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // Calculate expiration time (10 minutes from now)
    const expirationTime = new Date();
    expirationTime.setMinutes(expirationTime.getMinutes() + 10);

    // Check if OTP already exsist for corresponding user
    const otpExist = await OtpVerification.findOne({
      userId: id,
    });

    // if otp already exsist
    if (otpExist) {
      // Update otp
      const update = await OtpVerification.findOneAndUpdate(
        { userId: id },
        {
          otp: hashedOtp,
          expirationTime: expirationTime,
        },
        {
          new: true,
        }
      );
      return otp;
    } else {
      // save hashed otp into database
      await OtpVerification.create({
        userId: id,
        otp: hashedOtp,
        createdAt: new Date(),
        expiresAt: expirationTime,
      });
      // Retrun otp value for sending mail
      return otp;
    }
  } catch (error) {
    return error.message;
  }
};

module.exports = generateOTP;
