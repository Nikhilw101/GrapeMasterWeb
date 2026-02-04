import mongoose from 'mongoose';
import { DEALER_TYPES } from '../../../utils/constants.js';

const dealerSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please provide full name'],
        trim: true
    },
    mobile: {
        type: String,
        required: [true, 'Please provide mobile number'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        lowercase: true,
        trim: true
    },
    city: {
        type: String,
        required: [true, 'Please provide city'],
        trim: true
    },
    state: {
        type: String,
        required: [true, 'Please provide state'],
        trim: true
    },
    apartmentName: {
        type: String,
        trim: true
    },
    businessName: {
        type: String,
        required: [true, 'Please provide business name'],
        trim: true
    },
    type: {
        type: String,
        enum: Object.values(DEALER_TYPES),
        required: [true, 'Please select type (Dealer/Distributor)']
    },
    distributionCapacity: {
        type: String,
        required: [true, 'Please provide distribution capacity'],
        trim: true
    },
    experience: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'approved', 'rejected'],
        default: 'pending'
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const Dealer = mongoose.model('Dealer', dealerSchema);

export default Dealer;
