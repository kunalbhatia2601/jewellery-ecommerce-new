import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

import connectDB from '../lib/mongodb.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

async function assignProductsToCategories() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Get all products
        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        // Get all categories
        const categories = await Category.find({});
        console.log(`Found ${categories.length} categories`);

        if (products.length === 0) {
            console.log('No products found to assign to categories');
            process.exit(0);
        }

        // Find the Gold Jewellery category
        const goldCategory = await Category.findOne({ 
            $or: [
                { slug: 'gold-jewellery' },
                { name: { $regex: /gold/i } }
            ]
        });
        
        if (!goldCategory) {
            console.log('Gold Jewellery category not found. Available categories:');
            categories.forEach(cat => console.log(`- ${cat.name} (${cat.slug})`));
            process.exit(1);
        }

        console.log(`Found target category: "${goldCategory.name}" (slug: ${goldCategory.slug})`);

        let assignedCount = 0;
        for (const product of products) {
            let targetCategory = goldCategory.name;
            
            // Smart category assignment based on product name
            if (product.name.toLowerCase().includes('gold')) {
                targetCategory = goldCategory.name;
            } else if (product.name.toLowerCase().includes('diamond')) {
                // For non-gold products, assign to gold category for now since it's the only one
                targetCategory = goldCategory.name;
            } else {
                // Default to gold category
                targetCategory = goldCategory.name;
            }

            // Update product category
            await Product.findByIdAndUpdate(product._id, { 
                category: targetCategory 
            });
            console.log(`✅ Assigned "${product.name}" to "${targetCategory}"`);
            assignedCount++;
        }

        // Update category's product count
        const productCount = await Product.countDocuments({ 
            category: goldCategory.name, 
            isActive: true 
        });
        await Category.findByIdAndUpdate(goldCategory._id, { 
            productsCount: productCount 
        });

        console.log(`\n🎉 Successfully assigned ${assignedCount} products to "${goldCategory.name}"`);
        console.log(`📊 Updated category product count: ${productCount}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

assignProductsToCategories();