const mongoose = require("mongoose");
const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: String,
        email: String,
        password: String,
		authToken: String,
        avatar: String,
        isInRoom: Boolean,
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
        ],
        playlists: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Playlist"
            }
        ]
    })
);
module.exports = User;