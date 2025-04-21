const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const academyBatchBookingSchema = mongoose.Schema({
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
  academyBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcedemyBatch",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

academyBatchBookingSchema.plugin(timestamps);
module.exports = mongoose.model("AcademyBatchBooking", academyBatchBookingSchema);
