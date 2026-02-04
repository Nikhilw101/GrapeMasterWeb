import crypto from 'crypto';
import User from './user.model.js';
import { generateTokenPair } from '../../utils/jwt.util.js';
import { verifyRefreshToken } from '../../utils/jwt.util.js';
import { sendPasswordResetEmail, sendPasswordResetSuccessEmail, sendWelcomeEmail } from '../../utils/email.util.js';
import { RESET_PASSWORD_URL } from '../../config/env.js';
import logger from '../../utils/logger.js';

// Register new user
const registerUser = async (userData) => {
    try {
        const { name, mobile, email, password } = userData;

        // Check if user already exists
        const existingUser = await User.findOne({ mobile });
        if (existingUser) {
            throw new Error('User with this mobile number already exists');
        }

        // Create new user
        const user = await User.create({
            name,
            mobile,
            email,
            password
        });

        // Generate access and refresh tokens
        const { accessToken, refreshToken } = generateTokenPair({
            id: user._id,
            role: user.role
        });

        // Save hashed refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

        // Send welcome email if email provided
        if (email) {
            await sendWelcomeEmail(email, name);
        }

        return {
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    mobile: user.mobile,
                    email: user.email,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        };
    } catch (error) {
        logger.error(`Register user error: ${error.message}`);
        throw error;
    }
};

// Login user
const loginUser = async (mobile, password) => {
    try {
        // Find user with password field
        const user = await User.findOne({ mobile }).select('+password');

        if (!user) {
            throw new Error('Invalid credentials');
        }

        // Check if account is locked
        if (user.isLocked) {
            throw new Error(`Account is locked. Please try again later`);
        }

        // Check user status
        if (user.status !== 'active') {
            throw new Error(user.status === 'blocked' ? 'Account is blocked' : 'Account is deactivated');
        }

        // Compare password
        const isPasswordMatch = await user.comparePassword(password);
        if (!isPasswordMatch) {
            // Increment login attempts
            await user.incrementLoginAttempts();
            throw new Error('Invalid credentials');
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0) {
            await user.resetLoginAttempts();
        }

        // Generate access and refresh tokens
        const { accessToken, refreshToken } = generateTokenPair({
            id: user._id,
            role: user.role
        });

        // Save hashed refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

        return {
            success: true,
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    mobile: user.mobile,
                    email: user.email,
                    role: user.role
                },
                accessToken,
                refreshToken
            }
        };
    } catch (error) {
        logger.error(`Login user error: ${error.message}`);
        throw error;
    }
};

// Refresh access token
const refreshAccessToken = async (refreshToken) => {
    try {
        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and compare refresh token
        const user = await User.findById(decoded.id).select('+refreshToken');

        if (!user) {
            throw new Error('User not found');
        }

        // Compare refresh token
        const isTokenValid = await user.compareRefreshToken(refreshToken);
        if (!isTokenValid) {
            throw new Error('Invalid refresh token');
        }

        // Generate new token pair
        const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
            id: user._id,
            role: user.role
        });

        // Update refresh token in database
        user.refreshToken = newRefreshToken;
        await user.save();

        return {
            success: true,
            data: {
                accessToken,
                refreshToken: newRefreshToken
            }
        };
    } catch (error) {
        logger.error(`Refresh token error: ${error.message}`);
        throw error;
    }
};

// Logout user
const logoutUser = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Clear refresh token
        user.refreshToken = null;
        await user.save();

        return {
            success: true,
            message: 'Logged out successfully'
        };
    } catch (error) {
        logger.error(`Logout user error: ${error.message}`);
        throw error;
    }
};

// Forgot password
const forgotPassword = async (email) => {
    try {
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not (security best practice)
            return {
                success: true,
                message: 'If a user with that email exists, a password reset link has been sent'
            };
        }

        // Generate reset token
        const resetToken = user.generateResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${RESET_PASSWORD_URL}?token=${resetToken}`;

        // Send email
        const emailResult = await sendPasswordResetEmail(user.email, resetUrl, user.name);

        if (!emailResult.success) {
            // Clear reset token if email fails
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            throw new Error('Error sending email. Please try again later');
        }

        return {
            success: true,
            message: 'Password reset link has been sent to your email'
        };
    } catch (error) {
        logger.error(`Forgot password error: ${error.message}`);
        throw error;
    }
};

// Reset password
const resetPassword = async (resetToken, newPassword) => {
    try {
        // Hash the token to compare with database
        const hashedToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Find user with valid reset token
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }
        }).select('+resetPasswordToken +resetPasswordExpire');

        if (!user) {
            throw new Error('Invalid or expired reset token');
        }

        // Set new password
        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        user.refreshToken = null; // Invalidate all sessions
        await user.save();

        // Send confirmation email
        if (user.email) {
            await sendPasswordResetSuccessEmail(user.email, user.name);
        }

        return {
            success: true,
            message: 'Password has been reset successfully'
        };
    } catch (error) {
        logger.error(`Reset password error: ${error.message}`);
        throw error;
    }
};

// Get user profile
const getUserProfile = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        return {
            success: true,
            data: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                email: user.email,
                role: user.role,
                addresses: user.addresses
            }
        };
    } catch (error) {
        logger.error(`Get user profile error: ${error.message}`);
        throw error;
    }
};

// Update user profile
const updateUserProfile = async (userId, updateData) => {
    try {
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!user) {
            throw new Error('User not found');
        }

        return {
            success: true,
            data: {
                id: user._id,
                name: user.name,
                mobile: user.mobile,
                email: user.email
            }
        };
    } catch (error) {
        logger.error(`Update user profile error: ${error.message}`);
        throw error;
    }
};

// Add user address
const addUserAddress = async (userId, addressData) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // If this is the first address or marked as default, set it as default
        if (user.addresses.length === 0 || addressData.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
            addressData.isDefault = true;
        }

        user.addresses.push(addressData);
        await user.save();

        return {
            success: true,
            data: user.addresses
        };
    } catch (error) {
        logger.error(`Add user address error: ${error.message}`);
        throw error;
    }
};

// Update user address
const updateUserAddress = async (userId, addressId, addressData) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        const address = user.addresses.id(addressId);
        if (!address) {
            throw new Error('Address not found');
        }

        // If setting this address as default, unset others
        if (addressData.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        Object.assign(address, addressData);
        await user.save();

        return {
            success: true,
            data: user.addresses
        };
    } catch (error) {
        logger.error(`Update user address error: ${error.message}`);
        throw error;
    }
};

// Delete user address
const deleteUserAddress = async (userId, addressId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        user.addresses.pull(addressId);
        await user.save();

        return {
            success: true,
            data: user.addresses
        };
    } catch (error) {
        logger.error(`Delete user address error: ${error.message}`);
        throw error;
    }
};

export default {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    forgotPassword,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    addUserAddress,
    updateUserAddress,
    deleteUserAddress
};
