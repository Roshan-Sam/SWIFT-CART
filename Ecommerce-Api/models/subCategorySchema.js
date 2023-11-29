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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
  },
  { timestamps: true }
);

const SubCategory = model('SubCategory', schema);

export default SubCategory;
