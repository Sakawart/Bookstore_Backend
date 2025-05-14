const mongoose = require('mongoose')
const { ObjectId } = mongoose.Schema;

const ProductSchema = new mongoose.Schema(
    {
    ISBN: {
        type: String,
    },
    title: {
        type: String,
        text: true
    },
    author: {
        type: String,
        text: true
    },
    publisher: {
        type: String,
        text: true
    },
    price: {
        type: Number,
    },
    sold: {
        type: Number,
        default: 0
    },
    quantity: {
        type: Number,
    },
    description: {
        type: String,
    },
    category: {
        type: ObjectId,
        ref: "category",
    },
    images: {
        type: Array,
    },
},
    { timestamps: true }
);
module.exports = Product = mongoose.model("product",ProductSchema)
