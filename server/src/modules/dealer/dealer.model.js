import mongoose from 'mongoose';

const dealerRequestSchema = new mongoose.Schema({
    storeName: { type: String, required: true, trim: true },
    ownerName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
    businessDetails: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'approved', 'rejected'],
        default: 'pending'
    },
    statusNote: { type: String, trim: true },
    reviewedAt: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' }
}, {
    timestamps: true
});

const DealerRequest = mongoose.model('DealerRequest', dealerRequestSchema);
export default DealerRequest;
