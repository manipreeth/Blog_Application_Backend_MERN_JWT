const mongoose = require("mongoose");

module.exports = mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Db Connected"))
  .catch((err) => console.log("Db connection Fail ---", err.message));
