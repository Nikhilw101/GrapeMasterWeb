import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        unique: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
        min: 0
    },
    originalPrice: {
        type: Number,
        default: 0,
        min: 0
    },
    description: {
        type: String,
        trim: true
    },
    image: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        trim: true,
        default: 'Red'
    },
    stock: {
        type: Number,
        default: 100,
        min: 0
    },
    unit: {
        type: String,
        required: true,
        default: 'kg'
    },
    origin: {
        type: String,
        required: true,
        default: 'Nashik'
    },
    grade: {
        type: String,
        enum: ['A++', 'A+', 'A', 'B'],
        default: 'A+'
    },
    features: [{
        type: String
    }],
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Product = mongoose.model('Product', productSchema);

export default Product;
