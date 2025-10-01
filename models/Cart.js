import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: String,  // Changed from ObjectId to String to handle numeric IDs
        required: true
    },
    name: String,
    price: Number,
    image: String,
    quantity: {
        type: Number,
        required: true,
        min: 1
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema]
}, {
    timestamps: true
});

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema);