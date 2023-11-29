import { Schema, model } from 'mongoose';

const schema = Schema(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
        },
        quantity: Number,
      },
    ],
  },
  { timestamps: true }
);

const Cart = model('Cart', schema);

export default Cart;
