const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const topicSchema = mongoose.Schema({
    title: {
        type: String,
    },
    subTitle: {
        type: String,
    },
    videoUrl: {
        type: String,
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        required: true,
    },
});

topicSchema.plugin(timestamps);
module.exports = mongoose.model("Topic", topicSchema);
