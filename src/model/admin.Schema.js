const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const adminSchema = mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    email: {
        type: String
    },
    phoneNumber: {
        type: String,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        enum: ["admin","supervisor", "superadmin"],
        default: "admin",
    },
    token: {
        type: String,
    },
});

adminSchema.plugin(timestamps);
module.exports = mongoose.model("Admin", adminSchema);