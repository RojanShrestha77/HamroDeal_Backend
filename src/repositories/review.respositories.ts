import mongoose from "mongoose";
import { ReviewModel, IReview } from "../models/review.model";

export interface IReviewRepository {
    create(review: Partial<IReview>): Promise<IReview>;
    findById(id: string): Promise<IReview | null>;
    findByProductId(productId: string, page: number, size: number): Promise<{ reviews: IReview[], total: number }>;
    findByUserId(userId: string): Promise<IReview[]>;
    findByUserAndProduct(userId: string, productId: string): Promise<IReview | null>;
    update(id: string, data: Partial<IReview>): Promise<IReview | null>;
    delete(id: string): Promise<boolean>;
    getAverageRating(productId: string): Promise<number>;
}

export class ReviewRepository implements IReviewRepository {
    async create(review: Partial<IReview>): Promise<IReview> {
        const newReview = new ReviewModel(review);
        const saved = await newReview.save();
        return saved.populate([
            { path: "userId", select: "firstName lastName" },
            { path: "productId", select: "name" }
        ]);
    }

    async findById(id: string): Promise<IReview | null> {
        return await ReviewModel.findById(id).populate([
            { path: "userId", select: "firstName lastName" },
            { path: "productId", select: "name" }
        ]);
    }

    async findByProductId(productId: string, page: number, size: number): Promise<{ reviews: IReview[]; total: number; }> {
        const [reviews, total] = await Promise.all([
            ReviewModel.find({ productId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * size)
                .limit(size)
                .populate("userId", "firstName lastName"),
            ReviewModel.countDocuments({ productId })
        ]);
        return { reviews, total };
    }

    async findByUserId(userId: string): Promise<IReview[]> {
        return await ReviewModel.find({ userId })
            .sort({ createdAt: -1 })
            .populate("productId", "name images");
    }

    async findByUserAndProduct(userId: string, productId: string): Promise<IReview | null> {
        return await ReviewModel.findOne({ userId, productId });
    }

    async update(id: string, data: Partial<IReview>): Promise<IReview | null> {
        return await ReviewModel.findByIdAndUpdate(id, data, { new: true }).populate([
            { path: "userId", select: "firstName lastName" },
            { path: "productId", select: "name" }
        ]);
    }

    async delete(id: string): Promise<boolean> {
        const result = await ReviewModel.findByIdAndDelete(id);
        return result !== null;
    }

    async getAverageRating(productId: string): Promise<number> {
    const result = await ReviewModel.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },  // Convert to ObjectId
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    return result[0]?.avgRating || 0;
}

}
