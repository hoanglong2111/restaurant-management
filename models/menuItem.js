const mongoose = require('mongoose');

const menuItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrls: [{ type: String }],
    availability: { type: Boolean, required: true, default: true },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sold: { type: Number, required: true, default: 0, min: 0 }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual field for remaining stock
menuItemSchema.virtual('remaining').get(function() {
    return this.stock - this.sold;
});

// Pre-save middleware to auto-update availability based on stock
menuItemSchema.pre('save', function(next) {
    const remaining = this.stock - this.sold;
    
    // If remaining stock is 0, set availability to false (out of stock)
    if (remaining <= 0) {
        this.availability = false;
    } 
    // If remaining stock is <= 10% of initial stock, set availability to false (low stock)
    else if (remaining <= this.stock * 0.1) {
        this.availability = false;
    }
    // Otherwise, set availability to true
    else {
        this.availability = true;
    }
    
    next();
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;