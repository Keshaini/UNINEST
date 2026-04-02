const mongoose = require("mongoose");

const transferSchema = new mongoose.Schema(
	{
		studentName: {
			type: String,
			required: true,
			trim: true,
		},
		studentId: {
			type: String,
			required: true,
			trim: true,
		},
		currentRoomNumber: {
			type: String,
			required: true,
			trim: true,
		},
		requestedRoomNumber: {
			type: String,
			required: true,
			trim: true,
		},
		reason: {
			type: String,
			required: true,
			trim: true,
		},
		priority: {
			type: String,
			enum: ["Low", "Medium", "High"],
			default: "Medium",
		},
		status: {
			type: String,
			enum: ["Pending", "Approved", "Rejected"],
			default: "Pending",
		},
		requestedAt: {
			type: Date,
			default: Date.now,
		},
	},
	{ timestamps: true }
);

module.exports = mongoose.model("Transfer", transferSchema);
