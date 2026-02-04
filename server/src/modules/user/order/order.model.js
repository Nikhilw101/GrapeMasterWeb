import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from '../../../utils/constants.js';

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    userDetails: {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        email: String
    },
    deliveryAddress: {
        addressLine: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        subtotal: Number
    }],
    pricing: {
        itemsTotal: { type: Number, required: true },
        deliveryCharges: { type: Number, required: true },
        total: { type: Number, required: true }
    },
    paymentMethod: {
        type: String,
        enum: Object.values(PAYMENT_METHODS),
        required: true
    },
    paymentStatus: {
        type: String,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING
    },
    paymentDetails: {
        transactionId: String,
        paymentGateway: String,
        paidAt: Date
    },
    orderStatus: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PLACED
    },
    statusHistory: [{
        status: String,
        updatedAt: { type: Date, default: Date.now },
        note: String
    }],
    adminReview: {
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin'
        },
        reviewedAt: Date,
        reviewNote: String,
        approvalStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        }
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: Date,
    notes: String
}, {
    timestamps: true
});

// Generate order ID before saving
orderSchema.pre('save', async function (next) {
    if (!this.orderId) {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        this.orderId = `ORD${timestamp}${random}`;
    }
    next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;
