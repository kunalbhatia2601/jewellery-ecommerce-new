import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '../.env.local') });

import connectDB from '../lib/mongodb.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

// Helper function to generate slug
function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-+|-+$/g, ''); // Remove hyphens from start and end
}

const categories = [
    {
        name: 'Gold Jewellery',
        description: 'Exquisite gold jewelry pieces crafted with precision and elegance. From traditional designs to contemporary styles.',
        image: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/category-gold',
        isActive: true
    },
    {
        name: 'Diamond Jewellery', 
        description: 'Sparkling diamond jewelry that captures the light and your heart. Premium quality diamonds in stunning settings.',
        image: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/category-diamond',
        isActive: true
    },
    {
        name: 'Silver Jewellery',
        description: 'Contemporary silver jewelry pieces that blend modern aesthetics with traditional craftsmanship.',
        image: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/category-silver',
        isActive: true
    },
    {
        name: 'Wedding Collection',
        description: 'Special jewelry for your special day. Bridal sets, engagement rings, and wedding bands.',
        image: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/category-wedding',
        isActive: true
    },
    {
        name: 'Vintage Collection',
        description: 'Timeless vintage-inspired pieces that tell a story. Classic designs with a modern touch.',
        image: 'https://res.cloudinary.com/your-cloud-name/image/upload/v1/category-vintage',
        isActive: true
    }
].map(cat => ({
    ...cat,
    slug: generateSlug(cat.name)
}));

async function seedCategories() {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        // Clear existing categories
        await Category.deleteMany({});
        console.log('Cleared existing categories');

        // Create new categories one by one to ensure pre-save hooks run
        const createdCategories = [];
        for (const categoryData of categories) {
            const category = new Category(categoryData);
            const savedCategory = await category.save();
            createdCategories.push(savedCategory);
        }
        console.log(`Created ${createdCategories.length} categories:`);
        
        createdCategories.forEach(cat => {
            console.log(`- ${cat.name} (slug: ${cat.slug})`);
        });

        // Update existing products to have categories
        const products = await Product.find({});
        console.log(`Found ${products.length} existing products`);

        if (products.length > 0) {
            const categoryNames = createdCategories.map(cat => cat.name);
            
            // Randomly assign categories to existing products
            for (const product of products) {
                if (!product.category || product.category === 'Diamond' || product.category === 'Gold') {
                    // Assign category based on product name or random assignment
                    let assignedCategory;
                    
                    if (product.name.toLowerCase().includes('gold')) {
                        assignedCategory = 'Gold Jewellery';
                    } else if (product.name.toLowerCase().includes('diamond')) {
                        assignedCategory = 'Diamond Jewellery';
                    } else if (product.name.toLowerCase().includes('silver')) {
                        assignedCategory = 'Silver Jewellery';
                    } else if (product.name.toLowerCase().includes('wedding') || product.name.toLowerCase().includes('bridal')) {
                        assignedCategory = 'Wedding Collection';
                    } else if (product.name.toLowerCase().includes('vintage') || product.name.toLowerCase().includes('antique')) {
                        assignedCategory = 'Vintage Collection';
                    } else {
                        // Random assignment
                        assignedCategory = categoryNames[Math.floor(Math.random() * categoryNames.length)];
                    }
                    
                    await Product.findByIdAndUpdate(product._id, { 
                        category: assignedCategory 
                    });
                    console.log(`Updated ${product.name} -> ${assignedCategory}`);
                }
            }
        }

        // Update products count for each category
        for (const category of createdCategories) {
            const productCount = await Product.countDocuments({ 
                category: category.name, 
                isActive: true 
            });
            await Category.findByIdAndUpdate(category._id, { 
                productsCount: productCount 
            });
            console.log(`${category.name}: ${productCount} products`);
        }

        console.log('✅ Categories seeded successfully with product assignments!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();