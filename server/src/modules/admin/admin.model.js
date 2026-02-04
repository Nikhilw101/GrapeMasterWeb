import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../../utils/constants.js';

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        unique: true,
        lowercase: true,
        trim: true
    },
    mobile: {
        type: String,
        required: [true, 'Please provide mobile number'],
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        default: USER_ROLES.ADMIN
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
