const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const batchBookingSchema = mongoose.Schema({
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
  batchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Batch",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

batchBookingSchema.plugin(timestamps);
module.exports = mongoose.model("BatchBooking", batchBookingSchema);
