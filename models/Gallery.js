import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    mediaType: {
        type: String,
        enum: ['image', 'video'],
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String, // For video thumbnails
        default: ''
    },
    alt: {
        type: String,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String
    }]
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});

export default mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
