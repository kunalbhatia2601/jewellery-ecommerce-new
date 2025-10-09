import connectDB from '../lib/mongodb.js';
import Category from '../models/Category.js';

const sampleCategories = [
    {
        name: 'Diamond',
        description: 'Exquisite diamond jewelry featuring brilliant cuts and exceptional clarity. Each piece showcases the timeless beauty of diamonds in elegant settings.',
        image: 'samples/diamond-category_q8xvrl.jpg',
        sortOrder: 1
    },
    {
        name: 'Gold',
        description: 'Pure gold jewelry crafted with traditional techniques and contemporary designs. From classic chains to modern statement pieces.',
        image: 'samples/gold-category_p2qwer.jpg',
        sortOrder: 2
    },
    {
        name: 'Silver',
        description: 'Sterling silver collections combining affordability with style. Perfect for everyday wear and special occasions.',
        image: 'samples/silver-category_m8tyui.jpg',
        sortOrder: 3
    },
    {
        name: 'Wedding',
        description: 'Bridal and wedding jewelry sets designed for your special day. Includes engagement rings, wedding bands, and bridal sets.',
        image: 'samples/wedding-category_x4cvbn.jpg',
        sortOrder: 4
    },
    {
        name: 'Traditional',
        description: 'Heritage jewelry inspired by Indian traditions. Featuring intricate designs and cultural motifs passed down through generations.',
        image: 'samples/traditional-category_l9opqr.jpg',
        sortOrder: 5
    },
    {
        name: 'Contemporary',
        description: 'Modern jewelry designs for the fashion-forward individual. Clean lines, minimalist aesthetics, and innovative materials.',
        image: 'samples/contemporary-category_n3zxcv.jpg',
        sortOrder: 6
    }
];

async function seedCategories() {
    try {
        console.log('Connecting to database...');
        await connectDB();
        
        console.log('Clearing existing categories...');
        await Category.deleteMany({});
        
        console.log('Seeding categories...');
        const createdCategories = await Category.insertMany(sampleCategories);
        
        console.log(`✅ Successfully created ${createdCategories.length} categories:`);
        createdCategories.forEach(category => {
            console.log(`  - ${category.name} (/${category.slug})`);
        });
        
        console.log('\n🎉 Category seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding categories:', error);
        process.exit(1);
    }
}

seedCategories();