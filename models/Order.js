import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    mrp: {
        type: Number,
        required: true
    },
    sellingPrice: {
        type: Number,
        required: true,
        validate: {
            validator: function(value) {
                return value <= this.mrp;
            },
            message: 'Selling price cannot be greater than MRP'
        }
    },
    discount: {
        type: Number,
        default: function() {
            if (this.mrp && this.sellingPrice) {
                return Math.round(((this.mrp - this.sellingPrice) / this.mrp) * 100);
            }
            return 0;
        }
    },
    discountAmount: {
        type: Number,
        default: function() {
            return this.mrp - this.sellingPrice;
        }
    },
    itemTotal: {
        type: Number,
        default: function() {
            return this.mrp * this.quantity;
        }
    },
    totalDiscount: {
        type: Number,
        default: function() {
            return this.discountAmount * this.quantity;
        }
    },
    finalPrice: {
        type: Number,
        default: function() {
            return this.sellingPrice * this.quantity;
        }
    }
});

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema],
    itemsTotal: {
        type: Number,
        default: 0
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    totalDiscount: {
        type: Number,
        default: 0
    },
    finalTotal: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true,
        default: function() {
            return this.subtotal;
        }
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    shippingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

// Calculate all totals before saving
orderSchema.pre('save', function(next) {
    if (this.items && this.items.length > 0) {
        this.itemsTotal = this.items.reduce((total, item) => total + item.itemTotal, 0);
        this.totalDiscount = this.items.reduce((total, item) => total + item.totalDiscount, 0);
        this.finalTotal = this.items.reduce((total, item) => total + item.finalPrice, 0);
        this.subtotal = this.itemsTotal - this.totalDiscount;
        this.total = this.subtotal;
    }
    next();
});

export default mongoose.models.Order || mongoose.model('Order', orderSchema);