import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        price: {
            type: Number,
            required: false  // Will be populated when needed
        },
        subtotal: {
            type: Number,
            required: false
        }
    }],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for total amount
cartSchema.virtual('totalAmount').get(function () {
    return this.items.reduce((total, item) => total + (item.subtotal || 0), 0);
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
