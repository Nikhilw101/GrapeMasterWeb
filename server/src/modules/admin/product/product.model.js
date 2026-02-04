import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true,
        unique: true
    },
    weight: {
        type: String,
        required: [true, 'Please provide weight'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please provide price'],
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
        default: 'Grapes'
    },
    stock: {
        type: Number,
        default: 100,
        min: 0
    },
    // New fields
    origin: {
        type: String,
        trim: true,
        default: 'Nashik'
    },
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
    grade: {
        type: String,
        trim: true,
        default: 'A'
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
