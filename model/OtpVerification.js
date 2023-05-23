const mongoose = require("mongoose");

const OtpSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: Date,
  expiresAt: { type: Date, expires: "10m" },
});

const OtpVerification = mongoose.model("OtpVerification", OtpSchema);

module.exports = OtpVerification;
