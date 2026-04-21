const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registrationNumber: { type: String, required: true, unique: true },
    firstName: { 
        type: String, 
        required: true,
        match: [/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces']
    },
    lastName: { 
        type: String, 
        required: true,
        match: [/^[a-zA-Z\s]+$/, 'Name must contain only letters and spaces']
    },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    contactNumber: { type: String },
    course: { type: String },
    batchYear: { 
        type: Number,
        validate: {
            validator: function(v) {
                const currentYear = new Date().getFullYear();
                return v >= currentYear - 3 && v <= currentYear;
            },
            message: 'Enrollment year must be within the last 3 years or current year'
        }
    },
    profilePic: { type: String, default: null },
    profileCompletion: { type: Number, default: 10 },
    status: { type: String, enum: ['Active', 'Inactive', 'Deleted'], default: 'Active' },
    adminWarning: { type: String, default: '' },
    warningAcknowledged: { type: Boolean, default: false },
    preferences: {
        room: {
            roomType: { type: String, default: 'Any' },
            floorPreference: { type: String, default: 'Any' },
            bedPreference: { type: String, default: 'Any' }
        },
        lifestyle: {
            sleepTime: { type: String, default: '' },
            studyPreference: { type: String, default: '' }
        },
        roommate: {
            sameDepartment: { type: Boolean, default: false },
            sameYear: { type: Boolean, default: false },
            sameLanguage: { type: Boolean, default: false },
            any: { type: Boolean, default: true }
        },
        facilities: {
            isAC: { type: Boolean, default: false },
            attachedBathroom: { type: Boolean, default: false },
            wifiPriority: { type: Boolean, default: false }
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
