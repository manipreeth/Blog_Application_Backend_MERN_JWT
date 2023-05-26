const nodemailer = require("nodemailer");
const appErr = require("../utils/appErr");

const mailOTP = async (otp, userEmail, fullname) => {
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
    subject: "Account Verification - One-Time Password (OTP)",
    text: `
    Dear ${fullname}
    
    Thank you for choosing our blog application. We value your presence and are committed to providing you with an exceptional experience. 
    To ensure the security of your account, we have implemented a two-step verification process. OTP is valid only for 10 Minutes.

    
    OTP:${otp}


    Keep the OTP confidential and do not share it with anyone.
    If you encounter any issues or have any questions, please feel free to contact at manipreethbolusani@gmail.com

    Thank you for your cooperation in completing the verification process. We are excited to have you as a valued member of our blog community. 
    Start sharing your thoughts, ideas, and experiences with our growing audience!

    Best Regards,
    BlogoSphere
    
    `,
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
