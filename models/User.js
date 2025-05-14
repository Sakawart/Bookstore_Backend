const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    role: {
        type: String,
        default: 'user'
    },
    enabled: {
        type: Boolean,
        default: false
    },
    address: {
        firstName: { type: String },
        lastName: { type: String },
        country: { type: String },
        address: { type: String },
        district: { type: String },
        city: { type: String },
        province: { type: String },
        postalCode: { type: String },
        phone: { type: String },
    },
    wishlist:[{
        type: ObjectId,
        ref: 'product'
    }]
}, { timestamps: true });

module.exports = User = mongoose.model('users', UserSchema);
