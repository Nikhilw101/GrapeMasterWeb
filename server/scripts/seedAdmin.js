/**
 * One-time admin seed script.
 * Uses INITIAL_ADMIN_* from server .env (same as POST /api/admin/seed).
 * Optionally removes a legacy admin by email if LEGACY_ADMIN_EMAIL_TO_REMOVE is set in .env.
 * Run from server folder: node scripts/seedAdmin.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { default: Admin } = await import('../src/modules/admin/admin.model.js');
const { INITIAL_ADMIN_EMAIL, INITIAL_ADMIN_PASSWORD, INITIAL_ADMIN_NAME, INITIAL_ADMIN_MOBILE } = await import('../src/config/env.js');

const legacyEmailToRemove = process.env.LEGACY_ADMIN_EMAIL_TO_REMOVE?.trim();

const seedAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected successfully');

        if (legacyEmailToRemove) {
            const deleted = await Admin.deleteOne({ email: legacyEmailToRemove });
            if (deleted.deletedCount) {
                console.log(`Removed legacy admin (${legacyEmailToRemove}) from database.`);
            }
        }

        if (!INITIAL_ADMIN_EMAIL || !INITIAL_ADMIN_PASSWORD) {
            console.error('Set INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD in server .env, then run this script.');
            process.exit(1);
        }

        const existing = await Admin.findOne({ email: INITIAL_ADMIN_EMAIL.toLowerCase().trim() });
        if (existing) {
            console.log('Admin already exists for', INITIAL_ADMIN_EMAIL);
            process.exit(0);
        }

        const admin = await Admin.create({
            name: INITIAL_ADMIN_NAME || 'Admin',
            email: INITIAL_ADMIN_EMAIL.toLowerCase().trim(),
            password: INITIAL_ADMIN_PASSWORD,
            role: 'admin',
            mobile: INITIAL_ADMIN_MOBILE || '0000000000',
            isActive: true
        });

        console.log('Admin created from .env:');
        console.log({ Email: admin.email, Role: admin.role, Status: 'Active' });
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
