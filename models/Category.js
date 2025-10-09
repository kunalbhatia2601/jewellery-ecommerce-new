import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    sortOrder: {
        type: Number,
        default: 0
    },
    productsCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Generate slug from name before saving
categorySchema.pre('save', function(next) {
    if (this.isModified('name') && this.name) {
        // Generate slug: lowercase, replace non-alphanumeric with hyphens, remove multiple hyphens, trim hyphens from ends
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
            .replace(/^-+|-+$/g, ''); // Remove hyphens from start and end
        
        // Ensure we have a valid slug
        if (!this.slug) {
            this.slug = 'category-' + Date.now();
        }
    }
    next();
});

export default mongoose.models.Category || mongoose.model('Category', categorySchema);