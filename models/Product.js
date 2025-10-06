import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    mrp: {
        type: Number,
        required: true
    },
    costPrice: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    sku: {
        type: String,
        unique: true,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Dynamic pricing fields
    goldWeight: {
        type: Number,
        default: 0 // Weight in grams
    },
    goldPurity: {
        type: Number,
        default: 22, // 22K, 18K, etc.
        enum: [10, 14, 18, 22, 24]
    },
    makingChargePercent: {
        type: Number,
        default: 15 // Making charge percentage
    },
    isDynamicPricing: {
        type: Boolean,
        default: false // Enable dynamic pricing based on live gold rates
    },
    fixedMakingCharge: {
        type: Number,
        default: 0 // Fixed making charge (alternative to percentage)
    },
    stoneValue: {
        type: Number,
        default: 0 // Value of diamonds/stones (not affected by gold price)
    },
    pricingMethod: {
        type: String,
        enum: ['fixed', 'dynamic'],
        default: 'fixed'
    },
    lastPriceUpdate: {
        type: Date,
        default: Date.now
    },
    priceHistory: [{
        date: Date,
        goldPrice: Number,
        calculatedPrice: Number,
        finalPrice: Number
    }]
}, {
    timestamps: true
});

export default mongoose.models.Product || mongoose.model('Product', productSchema);