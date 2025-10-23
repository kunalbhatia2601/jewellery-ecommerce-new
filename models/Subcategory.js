import mongoose from 'mongoose';

const subcategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        lowercase: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    order: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create compound index for category + slug uniqueness
subcategorySchema.index({ category: 1, slug: 1 }, { unique: true });

// Pre-save hook to generate slug from name
subcategorySchema.pre('save', async function(next) {
    if (this.isModified('name') || !this.slug) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

export default mongoose.models.Subcategory || mongoose.model('Subcategory', subcategorySchema);
