const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const venderSchema = mongoose.Schema({
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  email: {
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
  phoneNumber: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  countryCode: {
    type: String,
    default: "91",
  },
  profileStatus:{
    type: String,
    default: "incompleted",
    required: true,
      enum: ["incompleted", "completed"],
  },
});

venderSchema.plugin(timestamps);
module.exports = mongoose.model("Vender", venderSchema);
