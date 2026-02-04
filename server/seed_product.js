import connectDB from './src/config/db.js';
import Product from './src/modules/admin/product/product.model.js';
import dotenv from 'dotenv';
dotenv.config();

const seed = async () => {
    try {
        console.log('Connecting to database...');
        await connectDB();

        const count = await Product.countDocuments();
        if (count === 0) {
            console.log('Seeding dummy product...');
            await Product.create({
                name: 'Fresh Thompson Seedless Grapes',
                weight: '1kg',
                price: 120,
                description: 'Sweet and juicy seedless grapes from Nashik farms.',
                category: 'Grapes',
                stock: 100,
                origin: 'Nashik',
                isFeatured: true,
                isActive: true
            });
            console.log('Product created!');
        } else {
            console.log('Products already exist.');
        }
        process.exit(0);
    } catch (err) {
        console.error('Seed error:', err);
        process.exit(1);
    }
};

seed();
