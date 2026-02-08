// models/product.model.ts
import mongoose, { Schema, Document } from "mongoose";

const ProductMongoSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    images: {
      type: String,
      required: false,
      
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:'Category',
      required: true,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

export interface IProduct extends  Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  stock: number;
  images?: string;
  categoryId:mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const ProductModel = mongoose.model<IProduct>("Product", ProductMongoSchema);