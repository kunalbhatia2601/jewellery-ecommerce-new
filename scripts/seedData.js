import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Check if MONGODB_URI is loaded
if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in environment variables');
    process.exit(1);
}

// Define models inline to avoid import issues
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    slug: { type: String, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    productsCount: { type: Number, default: 0 }
}, { timestamps: true });

const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    mrp: { type: Number, required: true },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    category: { type: String, required: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Subcategory', default: null },
    images: [{
        url: { type: String, required: true },
        alt: { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
        order: { type: Number, default: 0 }
    }],
    image: { type: String, required: false },
    stock: { type: Number, default: 0 },
    sku: { type: String, unique: true, required: true },
    isActive: { type: Boolean, default: true },
    goldWeight: { type: Number, default: 0 },
    goldPurity: { type: Number, default: 22, enum: [18, 20, 22, 24] },
    silverWeight: { type: Number, default: 0 },
    silverPurity: { type: Number, default: 999, enum: [999] },
    makingChargePercent: { type: Number, default: 15 },
    isDynamicPricing: { type: Boolean, default: false },
    fixedMakingCharge: { type: Number, default: 0 }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);
const Subcategory = mongoose.models.Subcategory || mongoose.model('Subcategory', subcategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Sample jewellery images (using placeholder images)
const placeholderImages = [
    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
    'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
    'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800',
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
];

// Seed data structure
const seedData = [
    {
        name: 'Rings',
        description: 'Exquisite collection of gold and diamond rings for every occasion',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
        subcategories: [
            {
                name: 'Engagement Rings',
                description: 'Beautiful engagement rings to celebrate your love',
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
                products: [
                    { name: 'Solitaire Diamond Ring', weight: 3.5, purity: 18 },
                    { name: 'Classic Gold Band', weight: 4.0, purity: 22 },
                    { name: 'Halo Diamond Ring', weight: 5.2, purity: 18 },
                    { name: 'Three Stone Ring', weight: 4.8, purity: 18 },
                    { name: 'Vintage Diamond Ring', weight: 4.5, purity: 22 }
                ]
            },
            {
                name: 'Wedding Bands',
                description: 'Timeless wedding bands for your special day',
                image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
                products: [
                    { name: 'Classic Gold Wedding Band', weight: 5.0, purity: 22 },
                    { name: 'Diamond Eternity Band', weight: 6.5, purity: 18 },
                    { name: 'Brushed Gold Band', weight: 5.5, purity: 22 },
                    { name: 'Two Tone Wedding Band', weight: 6.0, purity: 18 },
                    { name: 'Carved Gold Band', weight: 5.8, purity: 22 }
                ]
            },
            {
                name: 'Cocktail Rings',
                description: 'Bold and beautiful statement rings',
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
                products: [
                    { name: 'Ruby Statement Ring', weight: 8.0, purity: 18 },
                    { name: 'Emerald Cocktail Ring', weight: 7.5, purity: 18 },
                    { name: 'Sapphire Designer Ring', weight: 7.8, purity: 22 },
                    { name: 'Multi Stone Ring', weight: 8.5, purity: 18 },
                    { name: 'Art Deco Ring', weight: 7.2, purity: 22 }
                ]
            },
            {
                name: 'Stackable Rings',
                description: 'Delicate rings perfect for stacking',
                image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800',
                products: [
                    { name: 'Thin Gold Band', weight: 2.0, purity: 22 },
                    { name: 'Diamond Stack Ring', weight: 2.5, purity: 18 },
                    { name: 'Midi Ring Set', weight: 1.8, purity: 22 },
                    { name: 'Gemstone Stack Ring', weight: 2.2, purity: 18 },
                    { name: 'Beaded Gold Ring', weight: 2.0, purity: 22 }
                ]
            },
            {
                name: 'Signet Rings',
                description: 'Classic signet rings for men and women',
                image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800',
                products: [
                    { name: 'Classic Signet Ring', weight: 6.0, purity: 22 },
                    { name: 'Engraved Signet Ring', weight: 6.5, purity: 22 },
                    { name: 'Diamond Signet Ring', weight: 7.0, purity: 18 },
                    { name: 'Square Signet Ring', weight: 6.8, purity: 22 },
                    { name: 'Oval Signet Ring', weight: 6.2, purity: 22 }
                ]
            }
        ]
    },
    {
        name: 'Necklaces',
        description: 'Stunning necklaces and pendants to adorn your neckline',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
        subcategories: [
            {
                name: 'Chain Necklaces',
                description: 'Elegant gold chains for everyday wear',
                image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
                products: [
                    { name: 'Classic Gold Chain', weight: 10.0, purity: 22 },
                    { name: 'Box Chain Necklace', weight: 12.0, purity: 22 },
                    { name: 'Rope Chain', weight: 15.0, purity: 22 },
                    { name: 'Singapore Chain', weight: 11.0, purity: 22 },
                    { name: 'Figaro Chain', weight: 13.0, purity: 22 }
                ]
            },
            {
                name: 'Pendant Necklaces',
                description: 'Beautiful pendants with intricate designs',
                image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
                products: [
                    { name: 'Diamond Pendant', weight: 8.5, purity: 18 },
                    { name: 'Heart Pendant', weight: 7.0, purity: 22 },
                    { name: 'Solitaire Pendant', weight: 6.5, purity: 18 },
                    { name: 'Evil Eye Pendant', weight: 5.5, purity: 22 },
                    { name: 'Om Pendant', weight: 6.0, purity: 22 }
                ]
            },
            {
                name: 'Choker Necklaces',
                description: 'Trendy chokers for a modern look',
                image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
                products: [
                    { name: 'Gold Choker', weight: 18.0, purity: 22 },
                    { name: 'Diamond Choker', weight: 20.0, purity: 18 },
                    { name: 'Pearl Choker', weight: 15.0, purity: 22 },
                    { name: 'Multi Layer Choker', weight: 22.0, purity: 22 },
                    { name: 'Temple Choker', weight: 25.0, purity: 22 }
                ]
            },
            {
                name: 'Statement Necklaces',
                description: 'Bold necklaces to make a statement',
                image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800',
                products: [
                    { name: 'Kundan Necklace', weight: 35.0, purity: 22 },
                    { name: 'Polki Necklace', weight: 40.0, purity: 22 },
                    { name: 'Gemstone Necklace', weight: 30.0, purity: 18 },
                    { name: 'Bridal Necklace', weight: 45.0, purity: 22 },
                    { name: 'Antique Necklace', weight: 38.0, purity: 22 }
                ]
            },
            {
                name: 'Layered Necklaces',
                description: 'Multi-strand necklaces for a layered look',
                image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800',
                products: [
                    { name: 'Double Layer Chain', weight: 16.0, purity: 22 },
                    { name: 'Triple Strand Necklace', weight: 20.0, purity: 22 },
                    { name: 'Beaded Layer Necklace', weight: 18.0, purity: 22 },
                    { name: 'Mixed Metal Layers', weight: 17.0, purity: 18 },
                    { name: 'Charm Layer Necklace', weight: 15.0, purity: 22 }
                ]
            }
        ]
    },
    {
        name: 'Earrings',
        description: 'Gorgeous earrings from studs to chandeliers',
        image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
        subcategories: [
            {
                name: 'Stud Earrings',
                description: 'Classic stud earrings for everyday elegance',
                image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
                products: [
                    { name: 'Diamond Studs', weight: 2.5, purity: 18 },
                    { name: 'Gold Ball Studs', weight: 3.0, purity: 22 },
                    { name: 'Pearl Studs', weight: 2.8, purity: 22 },
                    { name: 'Ruby Studs', weight: 3.2, purity: 18 },
                    { name: 'Emerald Studs', weight: 3.0, purity: 18 }
                ]
            },
            {
                name: 'Hoop Earrings',
                description: 'Trendy hoop earrings in various sizes',
                image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
                products: [
                    { name: 'Classic Gold Hoops', weight: 4.5, purity: 22 },
                    { name: 'Diamond Hoops', weight: 5.0, purity: 18 },
                    { name: 'Large Statement Hoops', weight: 6.0, purity: 22 },
                    { name: 'Twisted Hoops', weight: 5.5, purity: 22 },
                    { name: 'Huggie Hoops', weight: 3.5, purity: 22 }
                ]
            },
            {
                name: 'Drop Earrings',
                description: 'Elegant drop earrings for special occasions',
                image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
                products: [
                    { name: 'Diamond Drop Earrings', weight: 6.5, purity: 18 },
                    { name: 'Pearl Drop Earrings', weight: 5.5, purity: 22 },
                    { name: 'Gemstone Drops', weight: 6.0, purity: 18 },
                    { name: 'Gold Teardrop Earrings', weight: 5.8, purity: 22 },
                    { name: 'Chain Drop Earrings', weight: 5.0, purity: 22 }
                ]
            },
            {
                name: 'Chandelier Earrings',
                description: 'Dramatic chandelier earrings for grand occasions',
                image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
                products: [
                    { name: 'Crystal Chandelier', weight: 8.0, purity: 18 },
                    { name: 'Gold Jhumka', weight: 10.0, purity: 22 },
                    { name: 'Diamond Chandelier', weight: 9.5, purity: 18 },
                    { name: 'Temple Earrings', weight: 11.0, purity: 22 },
                    { name: 'Antique Chandelier', weight: 9.0, purity: 22 }
                ]
            },
            {
                name: 'Ear Cuffs',
                description: 'Modern ear cuffs for a contemporary look',
                image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800',
                products: [
                    { name: 'Gold Ear Cuff', weight: 2.0, purity: 22 },
                    { name: 'Diamond Ear Cuff', weight: 2.5, purity: 18 },
                    { name: 'Minimalist Cuff', weight: 1.8, purity: 22 },
                    { name: 'Chain Ear Cuff', weight: 2.2, purity: 22 },
                    { name: 'Floral Ear Cuff', weight: 2.3, purity: 18 }
                ]
            }
        ]
    }
];

// Helper function to generate SKU
function generateSKU(category, subcategory, index) {
    const catCode = category.substring(0, 3).toUpperCase();
    const subCode = subcategory.substring(0, 3).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    return `${catCode}-${subCode}-${timestamp}-${index}`;
}

// Helper function to calculate prices based on gold weight
function calculatePrices(goldWeight, goldPurity) {
    const goldPricePerGram = 6000; // Base price
    const basePrice = goldWeight * goldPricePerGram;
    const makingCharges = basePrice * 0.15; // 15% making charges
    const mrp = Math.round((basePrice + makingCharges) * 1.2); // 20% markup
    const sellingPrice = Math.round(mrp * 0.9); // 10% discount
    const costPrice = Math.round(basePrice + makingCharges);
    
    return { mrp, sellingPrice, costPrice };
}

// Main seeding function
async function seedDatabase() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        
        // Connect directly instead of using the lib
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');
        
        console.log('🗑️  Clearing existing data...');
        await Product.deleteMany({});
        await Subcategory.deleteMany({});
        await Category.deleteMany({});
        
        console.log('🌱 Starting to seed data...\n');
        
        let totalProducts = 0;
        let totalSubcategories = 0;
        let totalCategories = 0;
        
        for (const categoryData of seedData) {
            console.log(`📁 Creating category: ${categoryData.name}`);
            
            // Create category
            const category = await Category.create({
                name: categoryData.name,
                description: categoryData.description,
                image: categoryData.image,
                slug: categoryData.name.toLowerCase().replace(/\s+/g, '-'),
                isActive: true,
                sortOrder: totalCategories
            });
            totalCategories++;
            
            console.log(`  ✅ Category created: ${category.name}`);
            
            // Create subcategories
            for (let subIdx = 0; subIdx < categoryData.subcategories.length; subIdx++) {
                const subData = categoryData.subcategories[subIdx];
                
                console.log(`  📂 Creating subcategory: ${subData.name}`);
                
                const subcategory = await Subcategory.create({
                    name: subData.name,
                    description: subData.description,
                    image: subData.image,
                    category: category._id,
                    slug: subData.name.toLowerCase().replace(/\s+/g, '-'),
                    isActive: true,
                    order: subIdx
                });
                totalSubcategories++;
                
                console.log(`    ✅ Subcategory created: ${subcategory.name}`);
                
                // Create products for this subcategory
                for (let prodIdx = 0; prodIdx < subData.products.length; prodIdx++) {
                    const prodData = subData.products[prodIdx];
                    const prices = calculatePrices(prodData.weight, prodData.purity);
                    
                    const product = await Product.create({
                        name: prodData.name,
                        description: `Exquisite ${prodData.name} crafted with ${prodData.purity}K gold. Weight: ${prodData.weight}g. Perfect for any occasion.`,
                        category: category.name,
                        subcategory: subcategory._id,
                        sku: generateSKU(category.name, subcategory.name, prodIdx),
                        mrp: prices.mrp,
                        costPrice: prices.costPrice,
                        sellingPrice: prices.sellingPrice,
                        stock: Math.floor(Math.random() * 20) + 5, // Random stock between 5-25
                        goldWeight: prodData.weight,
                        goldPurity: prodData.purity,
                        makingChargePercent: 15,
                        isDynamicPricing: false,
                        images: [
                            {
                                url: placeholderImages[Math.floor(Math.random() * placeholderImages.length)],
                                alt: prodData.name,
                                isPrimary: true,
                                order: 0
                            }
                        ],
                        image: placeholderImages[Math.floor(Math.random() * placeholderImages.length)],
                        isActive: true
                    });
                    totalProducts++;
                    
                    console.log(`      ✨ Product created: ${product.name} (${product.sku})`);
                }
            }
            console.log(''); // Empty line for readability
        }
        
        console.log('\n✅ Database seeding completed successfully!');
        console.log(`\n📊 Summary:`);
        console.log(`   Categories: ${totalCategories}`);
        console.log(`   Subcategories: ${totalSubcategories}`);
        console.log(`   Products: ${totalProducts}`);
        console.log('\n🎉 All done! Your database is ready to use.\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seeder
seedDatabase();
