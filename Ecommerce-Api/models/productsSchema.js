import { Schema, model } from 'mongoose';

const schema = Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        brand: {
            type: String,
            required: true,
        },
        discount: {
            type: Number,
            required: true,
        },
        thumbnailImage: String,
        images: [String],
        variants: [String],
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
        },
        subCategoryId: {
            type: Schema.Types.ObjectId,
            ref: 'SubCategory',
        },
        isAvailable: Boolean,
        quantity: {
            type: Number,
            required: true,
        },
        tags: [String],
        sellerId: {
            type: Schema.Types.ObjectId,
            ref: 'SubCategory',
        },
        ratings: [
            {
                customerId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Customer',
                },
                rating: { type: Number },
                review: String,
                date: Date,
            },
        ],
    },
    { timestamps: true }
);

const Product = model('Product', schema);

export default Product;
