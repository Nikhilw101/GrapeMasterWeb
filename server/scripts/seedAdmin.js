
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
// import { printTable } from 'console-table-printer'; // Removed dependency
import Admin from '../src/modules/admin/admin.model.js';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env') });

const seedAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully');

        // Check if admin exists
        const adminExists = await Admin.findOne({ email: 'admin@grapemaster.com' });

        if (adminExists) {
            console.log('Admin user exists. Deleting to reset credentials...');
            await Admin.deleteOne({ email: 'admin@grapemaster.com' });
        }

        // Create admin user
        const admin = await Admin.create({
            name: 'Super Admin',
            email: 'admin@grapemaster.com',
            password: 'admin123',
            role: 'admin',
            mobile: '9999999999',
            isActive: true
        });

        console.log('Admin user created successfully');
        console.log({
            Email: admin.email,
            Password: 'admin123',
            Role: admin.role,
            Status: 'Active'
        });

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
