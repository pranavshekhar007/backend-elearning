const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const courseBookingSchema = mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  signature: {
    type: String,
    default: true,
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
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

courseBookingSchema.plugin(timestamps);
module.exports = mongoose.model("CourseBooking", courseBookingSchema);
