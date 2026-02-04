import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['string', 'number', 'boolean', 'object'],
        default: 'string'
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
