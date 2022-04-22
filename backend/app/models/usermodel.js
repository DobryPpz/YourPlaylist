const mongoose = require("mongoose");
const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: String,
        email: String,
        password: String,
		authToken: String,
        avatar: String,
		friends: [ 
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
            }
        ],
		rooms: [ 
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room"
            }
        ]
    })
);
module.exports = User;