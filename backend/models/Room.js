const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomNumber: { type: String },
    name: { type: String },
    location: { type: String },
    price: { type: Number },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    image: { type: String, default: '/api/placeholder/400/250' },
    bedsAvailable: { type: Number },
    status: { type: String, enum: ['Open', 'Closed', 'Full', 'Limited'], default: 'Open' },
    hostelType: { type: String },
    type: { type: String },
    nearUniversity: { type: Boolean, default: false },
    mealPlanIncluded: { type: Boolean, default: false },
    maxResidentsPerRoom: { type: Number, default: 1 },
    stayPeriodLabel: { type: String, default: 'Any' },
    features: [{ type: String }],
    block: { type: String },
    floor: { type: Number },
    capacity: { type: Number },
    currentOccupancy: { type: Number, default: 0 },
    amenities: [{ type: String }],
    pricePerMonth: { type: Number }
}, { timestamps: true });

// Auto-generate roomNumber if not provided
RoomSchema.pre('save', function(next) {
    if (!this.roomNumber) {
        this.roomNumber = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        console.log('🆔 Generated roomNumber:', this.roomNumber);
    }
    next();
});

module.exports = mongoose.model('Room', RoomSchema);
