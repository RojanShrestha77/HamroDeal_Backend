import mongoose, { Document, Schema } from "mongoose";
import { ReviewType } from "../types/review.type";

type Id = mongoose.Types.ObjectId | string;

export interface IReview extends Omit<ReviewType, "productId" | "userId">, Document {
    productId: Id;
    userId: Id;
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    },
    { timestamps: true }
);

// Unique index: one review per user per product
ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

export const ReviewModel = mongoose.model<IReview>("Review", ReviewSchema);
