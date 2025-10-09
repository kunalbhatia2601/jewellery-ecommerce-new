import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

import connectDB from '../lib/mongodb.js';
import Category from '../models/Category.js';

async function checkCategories() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories:`);
        
        categories.forEach(cat => {
            console.log(`- Name: "${cat.name}"`);
            console.log(`  Slug: "${cat.slug}"`);
            console.log(`  ID: ${cat._id}`);
            console.log(`  Active: ${cat.isActive}`);
            console.log('---');
        });

        // Test if slug is properly saved
        const goldCategory = await Category.findOne({ name: 'Gold Jewellery' });
        if (goldCategory) {
            console.log('Gold Jewellery category found:');
            console.log('Name:', goldCategory.name);
            console.log('Slug:', goldCategory.slug);
            console.log('Has slug field:', goldCategory.slug ? 'YES' : 'NO');
        } else {
            console.log('Gold Jewellery category not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkCategories();