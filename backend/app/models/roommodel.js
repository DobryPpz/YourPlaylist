const mongoose = require("mongoose");
const Room = mongoose.model(
    "Room",
    new mongoose.Schema({
		name: String,
		accessCode: String,
		visibility: {
			type: String,
			enum: ['PUBLIC', 'INVITE_ONLY', 'PRIVATE'],
			default: 'PRIVATE'
		},
		members: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "User"
			}
		],
		playQueue: {
			playlist:
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Playlist"
			},
			currentTrack: Number,
		}
    })
);
module.exports = Room;