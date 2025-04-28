const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const academyCourseBookingSchema = mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    default: "",
  },
  paymentId: {
    type: String,
    required: true,
  },
  fee: {
    type: String,
    required: true,
  },
  convenienceFee: {
    type: String,
  },
  academyCourseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademyCourse",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

academyCourseBookingSchema.plugin(timestamps);
module.exports = mongoose.model("AcademyCourseBooking", academyCourseBookingSchema);
