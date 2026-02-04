import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { USER_ROLES, MAX_LOGIN_ATTEMPTS, LOCK_TIME, RESET_TOKEN_EXPIRE } from '../../utils/constants.js';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true // Allow multiple null values
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
        enum: Object.values(USER_ROLES),
        default: USER_ROLES.CUSTOMER
    },
    addresses: [{
        addressLine: String,
        city: String,
        state: String,
        pincode: String,
        isDefault: { type: Boolean, default: false }
    }],
    // Refresh Token (hashed)
    refreshToken: {
        type: String,
        select: false
    },
    // Password Reset
    resetPasswordToken: {
        type: String,
        select: false
    },
    resetPasswordExpire: {
        type: Date,
        select: false
    },
    // Account Security
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    // Status: active, inactive, blocked
    status: {
        type: String,
        enum: ['active', 'inactive', 'blocked'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Virtual for checking if account is locked
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Hash refresh token before saving
userSchema.pre('save', async function (next) {
    // Only hash refresh token if it's modified and present
    if (!this.isModified('refreshToken') || !this.refreshToken) {
        return next();
    }

    const salt = await bcrypt.genSalt(10);
    this.refreshToken = await bcrypt.hash(this.refreshToken, salt);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Compare refresh token
userSchema.methods.compareRefreshToken = async function (candidateToken) {
    if (!this.refreshToken) return false;
    return await bcrypt.compare(candidateToken, this.refreshToken);
};

// Generate password reset token
userSchema.methods.generateResetPasswordToken = function () {
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (10 minutes)
    this.resetPasswordExpire = Date.now() + RESET_TOKEN_EXPIRE;

    return resetToken; // Return unhashed token to send via email
};

// Increment login attempts
userSchema.methods.incrementLoginAttempts = async function () {
    // If we have a previous lock that has expired, restart at 1
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    // Otherwise, increment
    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after max attempts
    const needsLock = this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked;
    if (needsLock) {
        updates.$set = { lockUntil: Date.now() + LOCK_TIME };
    }

    return await this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
    return await this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};

const User = mongoose.model('User', userSchema);

export default User;
