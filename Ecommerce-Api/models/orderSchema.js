import { Schema, model } from 'mongoose';

const schema = Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
    },
    status: String,
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
      },
    ],
    shippingAddress: [
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

const Order = model('Order', schema);

export default Order;
