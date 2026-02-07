/**
 * Full database reset – deletes all data in all collections.
 * Use for fresh deployment only. Run from server folder: node scripts/resetDatabase.js
 * Requires confirmation via RESET_DATABASE_CONFIRM=yes
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const CONFIRM = process.env.RESET_DATABASE_CONFIRM === 'yes';

const run = async () => {
    if (!CONFIRM) {
        console.error('This script deletes ALL data (users, orders, products, admins, settings, carts, dealers).');
        console.error('To run it, set: RESET_DATABASE_CONFIRM=yes');
        console.error('Example: RESET_DATABASE_CONFIRM=yes node scripts/resetDatabase.js');
        process.exit(1);
    }

    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGODB_URI);
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();

        for (const { name } of collections) {
            await db.collection(name).deleteMany({});
            console.log(`Cleared collection: ${name}`);
        }

        console.log('Database reset complete. All collections are empty.');
        process.exit(0);
    } catch (error) {
        console.error('Reset failed:', error.message);
        process.exit(1);
    }
};

run();
