const mongoose = require('mongoose');

const tableSchema = mongoose.Schema({
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, required: true },
    location: { type: String },
    status: { type: String, required: true, default: 'available' }
}, {
    timestamps: true
});

const Table = mongoose.model('Table', tableSchema);
module.exports = Table;