const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const testSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
  image: {
    type: String,
    required: true,
  },
  type: {
    type: String,
  },
  price: {
    type: String,
  },
  discountedPrice: {
    type: String,
  },
  subTitle: {
    type: String,
  },
  rating: {
    type: String,
  },
  instructorName:{
    type: String,
  },
  description:{
    type: String,
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  faq:[
    {
      question:{
        type:String,
      },
      answer:{
        type:String
      }
    }
  ]
});

testSchema.plugin(timestamps);
module.exports = mongoose.model("Test", testSchema);
