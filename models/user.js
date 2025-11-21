const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Not required for OAuth users
        isAdmin: { type: Boolean, default: false },
        // OAuth fields
        googleId: { type: String, sparse: true },
        facebookId: { type: String, sparse: true },
        provider: {
            type: String,
            enum: ['local', 'google', 'facebook'],
            default: 'local',
        },
        avatar: { type: String },
        emailVerified: { type: Boolean, default: false },
        refreshToken: { type: String },
    },
    {
        timestamps: true,
    }
);

// Add indexes
userSchema.index({ provider: 1 });
userSchema.index({ emailVerified: 1 });

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false; // OAuth users don't have password
    return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;