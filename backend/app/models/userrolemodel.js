const mongoose = require("mongoose");
const UserRole = mongoose.model(
    "UserRole",
    new mongoose.Schema({
        userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		roleName: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Role"
		},
		roomId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Room"
		}
    })
);
module.exports = UserRole;