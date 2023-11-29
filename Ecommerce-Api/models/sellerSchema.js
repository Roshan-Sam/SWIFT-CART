import { Schema, model } from 'mongoose';

const schema = Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            default: 'SELLER',
        },
        image: String,
        password: {
            type: String,
            required: true,
        },
        address: [
            {
                addressType: String,
                houseName: String,
                street: String,
                city: String,
                state: String,
                pincode: String,
            },
        ],
    },
    { timestamps: true }
);

const Seller = model('Seller', schema);

export default Seller;
