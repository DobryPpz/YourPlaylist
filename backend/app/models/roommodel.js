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
		]
    })
);
module.exports = Room;