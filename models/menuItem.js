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

// Virtual field for status text
menuItemSchema.virtual('statusText').get(function() {
    const remaining = this.stock - this.sold;
    
    if (remaining <= 0) {
        return 'Hết hàng';
    } else if (remaining <= this.stock * 0.1) {
        return 'Sắp hết hàng';
    } else {
        return 'Còn hàng';
    }
});

// Pre-save middleware to auto-update availability based on stock
menuItemSchema.pre('save', function(next) {
    const remaining = this.stock - this.sold;
    
    // Set availability based on stock levels
    // - Out of stock (remaining = 0): availability = false
    // - Low stock (remaining <= 10%): availability = false  
    // - In stock (remaining > 10%): availability = true
    if (remaining <= 0) {
        this.availability = false;
    } else if (remaining <= this.stock * 0.1) {
        this.availability = false;
    } else {
        this.availability = true;
    }
    
    next();
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;