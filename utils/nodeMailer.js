const nodemailer = require("nodemailer");
const appErr = require("../utils/appErr");

const mailOTP = async (otp, userEmail) => {
  // If otp is not recieved.
  if (!otp) {
    return appErr("OTP Not Found", 500);
  }

  // create the nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  // Configure the details of nodemailer
  const mailConfig = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: "OTP Verification",
    text: "Verify by entering this otp: " + otp,
  };

  // Send the otp to user
  try {
    // Send the otp to user
    const info = await transporter.sendMail(mailConfig);
    return "Mail sent";
  } catch (error) {
    return appErr("An error has occurred while sending mail", 500);
  }
};

module.exports = mailOTP;
