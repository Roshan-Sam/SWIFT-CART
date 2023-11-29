import { Schema, model } from 'mongoose';

const schema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Category = model('Category', schema);

export default Category;
