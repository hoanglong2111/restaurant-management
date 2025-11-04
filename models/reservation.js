const mongoose = require('mongoose');

const reservationSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User',
        },
        table: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Table',
        },
        reservationDate: {
            type: Date,
            required: true,
        },
        reservationEnd: { // Required field
            type: Date,
            required: true,
        },
        numberOfGuests: {
            type: Number,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ['pending', 'confirmed', 'cancelled', 'completed'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

// Pre-save middleware to set reservationEnd if not provided
reservationSchema.pre('save', function (next) {
    if (!this.reservationEnd) {
        // Set reservationEnd to 2 hours after reservationDate
        this.reservationEnd = new Date(this.reservationDate.getTime() + 2 * 60 * 60 * 1000);
    }
    next();
});

const Reservation = mongoose.model('Reservation', reservationSchema);

module.exports = Reservation;