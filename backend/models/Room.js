const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomNumber: { type: String, required: true, unique: true },
    block: { type: String },
    floor: { type: Number },
    type: { type: String, enum: ['Single', 'Double', 'Triple', 'Dormitory'] },
    capacity: { type: Number, required: true },
    currentOccupancy: { type: Number, default: 0 },
    status: { type: String, enum: ['Available', 'Full', 'Maintenance'], default: 'Available' },
    amenities: [{ type: String }],
    pricePerMonth: { type: Number }
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
