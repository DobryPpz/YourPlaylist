const mongoose = require("mongoose")
const Playlist = mongoose.model(
    "Playlist",
    new mongoose.Schema({
        name: String,
        tracks: [
            {
                url: String,
                trackPosition: Number,	// Position in a playlist
                title: String,
                artist: String,			// Artist name or a URL to user profile
		album: String,
                albumCover: String,		// URL to a JPEG file
                duration: Number,
                service: {
                    type: String,
                    enum: ['SOUNDCLOUD', 'YOUTUBE'],
                    default: 'SOUNDCLOUD'
                }
            }
        ],
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room"
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    })
);
module.exports = Playlist;