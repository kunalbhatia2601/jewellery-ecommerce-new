import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

import connectDB from '../lib/mongodb.js';
import Category from '../models/Category.js';

// Helper function to generate slug
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove hyphens from start and end
}

async function fixCategorySlugs() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories to fix:`);
        
        for (const category of categories) {
            if (!category.slug || category.slug === 'undefined') {
                const newSlug = generateSlug(category.name);
                await Category.findByIdAndUpdate(category._id, { slug: newSlug });
                console.log(`✅ Fixed "${category.name}" -> slug: "${newSlug}"`);
            } else {
                console.log(`✓ "${category.name}" already has slug: "${category.slug}"`);
            }
        }

        // Verify the fix
        const goldCategory = await Category.findOne({ name: 'Gold Jewellery' });
        if (goldCategory) {
            console.log('\n✅ Gold Jewellery category after fix:');
            console.log('Name:', goldCategory.name);
            console.log('Slug:', goldCategory.slug);
        }

        console.log('\n🎉 All category slugs fixed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixCategorySlugs();