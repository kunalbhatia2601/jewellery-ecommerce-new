/**
 * Database initialization script for production
 * Run this once after deployment to ensure indexes are created
 */

import dbConnect from './lib/mongodb.js';
import Product from './models/Product.js';

async function initializeDatabase() {
    try {
        console.log('🔄 Connecting to database...');
        await dbConnect();
        console.log('✅ Database connected');

        console.log('🔄 Creating indexes for Product collection...');
        await Product.createIndexes();
        console.log('✅ Product indexes created');

        // List all indexes
        const indexes = await Product.collection.getIndexes();
        console.log('📋 Current indexes:', Object.keys(indexes));

        console.log('✅ Database initialization completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database initialization failed:', error);
        process.exit(1);
    }
}

initializeDatabase();
