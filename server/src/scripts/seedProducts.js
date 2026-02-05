import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../modules/admin/product/product.model.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Config
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Helper to get reliable Unsplash URLs
// Using 'raw' + size params is often more stable than 'plus' URLs
const getUrl = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=80`;

const products = [
    // --- Red Grapes ---
    {
        name: 'Flame Seedless',
        price: 450,
        originalPrice: 600,
        description: 'Premium quality Flame Seedless grapes. These red grapes are known for their crisp texture, sweet flavor, and lack of seeds. Perfect for snacking or adding to fruit salads. Directly from Nashik vineyards.',
        image: getUrl('1596363505729-4190a9506133'), // Red grapes
        category: 'Red',
        stock: 50,
        unit: 'box (2kg)',
        origin: 'Nashik, Maharashtra',
        grade: 'A++',
        features: ['Seedless', 'Sweet & Crispy', 'Export Quality', 'Fresh Harvest'],
        discount: 25,
        isFeatured: true
    },
    {
        name: 'Red Globe',
        price: 480,
        originalPrice: 650,
        description: 'Large, round, and seeded Red Globe grapes. Known for their impressive size and meaty texture. These grapes have a mild sweetness and are very decorative on cheese platters.',
        image: getUrl('1606103632483-c5980753effc'), // Alternate red/dark
        category: 'Red',
        stock: 45,
        unit: 'box (2kg)',
        origin: 'Nashik, Maharashtra',
        grade: 'A+',
        features: ['Large Berries', 'Meaty Texture', 'Mild Sweetness', 'Long Shelf Life'],
        discount: 26,
        isFeatured: false
    },
    {
        name: 'Crimson Seedless',
        price: 520,
        originalPrice: 700,
        description: 'Late-season Crimson Seedless grapes. These are firmer, crispier, and have a tart-sweet balance that evolves into pure sweetness. Excellent keeping quality.',
        image: getUrl('1597858063385-d8ac030d9fb8'), // Reddish grapes
        category: 'Red',
        stock: 40,
        unit: 'box (2kg)',
        origin: 'Sangli, Maharashtra',
        grade: 'A++',
        features: ['Extra Crisp', 'Tart-Sweet', 'Late Harvest', 'Premium'],
        discount: 25,
        isFeatured: false
    },

    // --- Green Grapes ---
    {
        name: 'Green Sonakha',
        price: 400,
        originalPrice: 550,
        description: 'Classic Green Sonakha grapes, deeply loved for their elongated shape and high sugar content. These golden-green beauties are thin-skinned and incredibly juicy. A traditional favorite.',
        image: getUrl('1595123067861-55db29b0a683'), // Green grapes
        category: 'Green',
        stock: 100,
        unit: 'box (2kg)',
        origin: 'Nashik, Maharashtra',
        grade: 'A+',
        features: ['High Sugar', 'Elongated', 'Thin Skin', 'Traditional Favourite'],
        discount: 27,
        isFeatured: true
    },
    {
        name: 'Thompson Seedless',
        price: 380,
        originalPrice: 500,
        description: 'The world-famous Thompson Seedless. Small to medium-sized, oval, and pale green. These offer a classic sweet-tart flavor profile and are versatile for eating or cooking.',
        image: getUrl('1606815802131-08ecbc21ef9a'), // Green grapes closer
        category: 'Green',
        stock: 120,
        unit: 'box (2kg)',
        origin: 'Nashik, Maharashtra',
        grade: 'A',
        features: ['Classic Taste', 'Seedless', 'Versatile', 'Daily Fresh'],
        discount: 24,
        isFeatured: false
    },
    {
        name: 'Manik Chaman',
        price: 420,
        originalPrice: 580,
        description: 'Manik Chaman is a selection of Sonaka with longer berries and a beautiful amber glow when fully ripe. Exceptionally sweet and very popular in local markets.',
        image: getUrl('1423483641091-6663f9f069fa'), // Green vineyard
        category: 'Green',
        stock: 80,
        unit: 'box (2kg)',
        origin: 'Nashik, Maharashtra',
        grade: 'A+',
        features: ['Amber Glow', 'Extra Sweet', 'Elongated', 'Local Favorite'],
        discount: 27,
        isFeatured: false
    },
    {
        name: 'Super Sonaka',
        price: 450,
        originalPrice: 600,
        description: 'An improved variety of Sonaka, offering larger berry size and crunchier texture. The "Super" tag comes from its superior shelf life and premium appearance.',
        image: getUrl('1595123067861-55db29b0a683'), // Green grapes
        category: 'Green',
        stock: 60,
        unit: 'box (2kg)',
        origin: 'Nashik, Maharashtra',
        grade: 'A++',
        features: ['Crunchy', 'Large Berry', 'Premium', 'Export Quality'],
        discount: 25,
        isFeatured: false
    },

    // --- Black Grapes ---
    {
        name: 'Black Jumbo',
        price: 550,
        originalPrice: 750,
        description: 'Exotic Black Jumbo grapes. These are large, bold, and bursting with rich, sweet juice. Known for their high antioxidant content and robust flavor profile. A premium choice for grape connoisseurs.',
        image: getUrl('1537640538966-79f369143f8f'), // Black grapes high quality
        category: 'Black',
        stock: 40,
        unit: 'box (2kg)',
        origin: 'Nashik, Maharashtra',
        grade: 'A++',
        features: ['Jumbo Size', 'Rich Antioxidants', 'Extra Sweet', 'Premium Export'],
        discount: 26,
        isFeatured: true
    },
    {
        name: 'Sharad Seedless',
        price: 520,
        originalPrice: 700,
        description: 'Sharad Seedless is a popular black variety with a slightly elongated shape. It has a distinctive sweet flavor and a firm, crisp skin that pops when you bite it.',
        image: getUrl('1625490412678-f75e0766324a'), // Dark grapes
        category: 'Black',
        stock: 55,
        unit: 'box (2kg)',
        origin: 'Nashik, Maharashtra',
        grade: 'A+',
        features: ['Crisp Skin', 'Distinct Flavor', 'Seedless', 'Fresh'],
        discount: 25,
        isFeatured: false
    },
    {
        name: 'Nanasaheb Purple',
        price: 500,
        originalPrice: 680,
        description: 'A unique purple-black variety with a slender, elongated shape. These grapes are visually stunning and offer a floral sweetness not found in other varieties.',
        image: getUrl('1596707328646-e4ea64724a8d'), // Purple grapes
        category: 'Black',
        stock: 35,
        unit: 'box (2kg)',
        origin: 'Solapur, Maharashtra',
        grade: 'A+',
        features: ['Floral Note', 'Unique Shape', 'Exotic', 'Sweet'],
        discount: 26,
        isFeatured: false
    },

    // --- Mixed & Special ---
    {
        name: 'Premium Mix Box',
        price: 500,
        originalPrice: 700,
        description: 'Experience the best of all worlds with our Premium Mix Box. A carefully curated assortment of Green, Black, and Red grapes. Ideal for families who love variety. Enjoy the distinct flavors of each variety in one pack.',
        image: getUrl('1537640538966-79f369143f8f'), // Mix/Black
        category: 'Mixed',
        stock: 30,
        unit: 'box (2kg)',
        origin: 'Nashik, Maharashtra',
        grade: 'A+',
        features: ['3 Varieties', 'Best Value', 'Freshly Packed', 'Great for Gifts'],
        discount: 28,
        isFeatured: true
    },
    {
        name: 'Family Mega Pack',
        price: 1100,
        originalPrice: 1500,
        description: 'The ultimate value pack for grape lovers! Contains 5kg of assorted premium grapes (2kg Green, 2kg Black, 1kg Red). Perfect for large families or weekly stocking.',
        image: getUrl('1506543734005-02758a08d249'), // Basket of fruit
        category: 'Mixed',
        stock: 15,
        unit: 'box (5kg)',
        origin: 'Nashik, Maharashtra',
        grade: 'A++',
        features: ['Bulk Savings', 'Complete Variety', 'Family Size', 'Farm Fresh'],
        discount: 26,
        isFeatured: true
    },

    // --- Other Fruits & Dry Fruits ---
    {
        name: 'Fresh Pomegranate',
        price: 500,
        originalPrice: 650,
        description: 'Ruby red, jewel-like arils packed with immunity-boosting vitamins. Our Bhagwa variety pomegranates are known for their soft seeds and deep saffron-colored skin. Sweet, tangy, and incredibly fresh.',
        image: getUrl('1615485925763-8678627d531a'), // Pomegranate
        category: 'Fruits',
        stock: 60,
        unit: 'box (2kg)',
        origin: 'Solapur, Maharashtra',
        grade: 'A+',
        features: ['Bhagwa Variety', 'Soft Seeds', 'Immunity Booster', 'Export Quality'],
        discount: 23,
        isFeatured: false
    },
    {
        name: 'Premium Black Raisins',
        price: 400,
        originalPrice: 500,
        description: 'Sun-dried black raisins made from our premium black grapes. Sweet, chewy, and perfect for baking or healthy snacking. No added sugar or preservatives.',
        image: getUrl('1606103632483-c5980753effc'), // Dark grapes/raisins
        category: 'Dry Fruits',
        stock: 100,
        unit: 'pack (500g)',
        origin: 'Nashik, Maharashtra',
        grade: 'A',
        features: ['Sun Dried', 'No Added Sugar', 'Healthy Snack', 'Iron Rich'],
        discount: 20,
        isFeatured: false
    },
    {
        name: 'Golden Raisins',
        price: 350,
        originalPrice: 450,
        description: 'Golden-hued raisins dried from select green grapes. These are plump, moist, and have a caramel-like sweetness. A pantry essential for Indian desserts.',
        image: getUrl('1595505486680-3cd686aebb05'), // Golden grapes/raisins style
        category: 'Dry Fruits',
        stock: 120,
        unit: 'pack (500g)',
        origin: 'Nashik, Maharashtra',
        grade: 'A',
        features: ['Plump & Moist', 'Caramel Sweet', 'Dessert Ready', 'Energy Boost'],
        discount: 22,
        isFeatured: false
    }
];

const seedDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/grapemaster';
        await mongoose.connect(mongoURI);
        console.log('MongoDB Connected for Seeding');

        for (const product of products) {
            // Check if product exists by name to avoid duplicates if specific about "Upsert"
            const existing = await Product.findOne({ name: product.name });
            if (existing) {
                // Update existing
                await Product.findByIdAndUpdate(existing._id, product);
                console.log(`Updated: ${product.name}`);
            } else {
                // Create new
                await Product.create(product);
                console.log(`Created: ${product.name}`);
            }
        }

        console.log('Seeding Completed Successfully');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedDB();
