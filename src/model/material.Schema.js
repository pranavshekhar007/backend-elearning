const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const materialSchema = mongoose.Schema({
  name: {
    type: String,
  },
  pdfLink: {
    type: String,
  },
  academyCourseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademyCourse",
    required: true,
  },
});

materialSchema.plugin(timestamps);
module.exports = mongoose.model("Material", materialSchema);
