const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Define Schemas 
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['Student', 'Admin'], default: 'Student' },
    profileId: { type: mongoose.Schema.Types.ObjectId, refPath: 'role' },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

const AdminSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    employeeId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    roleLevel: { type: String, enum: ['SuperAdmin', 'Warden', 'Manager'], default: 'Warden' },
    contactNumber: { type: String },
    department: { type: String },
    profilePic: { type: String, default: '' }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const email = 'uninestadmin@gmail.com';
        const password = 'Admin@123';

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('User already exists. Updating role to Admin...');
            user.role = 'Admin';
            user.password = password; // Will be hashed by pre-save
            await user.save();
        } else {
            user = new User({
                email,
                password,
                role: 'Admin'
            });
            await user.save();
            console.log('User account created.');
        }

        // Check if admin profile exists
        let admin = await Admin.findOne({ userId: user._id });
        if (!admin) {
            admin = new Admin({
                userId: user._id,
                employeeId: 'EMP001',
                firstName: 'UniNest',
                lastName: 'Admin',
                roleLevel: 'SuperAdmin',
                department: 'Administration'
            });
            await admin.save();
            console.log('Admin profile created.');
        }

        // Link profile to user
        user.profileId = admin._id;
        await user.save();

        console.log('--- ADMIN CREATED SUCCESSFULLY ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('---------------------------------');

        process.exit(0);
    } catch (err) {
        console.error('Error creating admin:', err);
        process.exit(1);
    }
}

createAdmin();
