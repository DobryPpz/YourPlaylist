const mongoose = require("mongoose");
const Avatar = mongoose.model(
    "Avatar",
    new mongoose.Schema({
        name: String,
        src: String
    })
);
module.exports = Avatar;