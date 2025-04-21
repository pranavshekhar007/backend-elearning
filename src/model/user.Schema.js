const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  countryCode: {
    type: String,
    default: "91",
  },
  isPhoneNumberVerified: {
    type: Boolean,
    default: false,
  },
  profileImg: {
    type: String,
  },
  password: {
    type: String,
  },
  otp: {
    type: String,
  },
  token: {
    type: String,
  },
});

userSchema.plugin(timestamps);
module.exports = mongoose.model("User", userSchema);
