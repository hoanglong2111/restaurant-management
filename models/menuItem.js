const mongoose = require('mongoose');

const menuItemSchema = mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    imageUrls: [{ type: String }],
    availability: { type: Boolean, required: true, default: true },
    stock: { type: Number, required: true, default: 0, min: 0 }
}, {
    timestamps: true
});

const MenuItem = mongoose.model('MenuItem', menuItemSchema);
module.exports = MenuItem;