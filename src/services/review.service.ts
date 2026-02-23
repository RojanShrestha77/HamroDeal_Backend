import { CreateReviewType, UpdateReviewType } from "../types/review.type";
import { HttpError } from "../errors/http-error";
import { IReview } from "../models/review.model";
import { OrderRepository } from "../repositories/order.repository";
import mongoose from "mongoose";
import { ReviewRepository } from "../repositories/review.respositories";

const reviewRepo = new ReviewRepository();
const orderRepo = new OrderRepository();

export class ReviewService {
   async createReview(userId: string, productId: string, data: CreateReviewType) {
    const orders = await orderRepo.findByUserIdUnpopulated(userId);
    
    
    const hasPurchased = orders.some(order => {
        if (order.status !== "delivered") {
            return false;
        }
        
        return order.items.some(item => {
            const itemProductId = item.productId instanceof mongoose.Types.ObjectId 
                ? item.productId.toString() 
                : String(item.productId);
            
            return itemProductId === productId;
        });
    });
    
    if (!hasPurchased) {
        throw new HttpError(403, "You can only review products you have purchased");
    }

    // Check if user already reviewed this product
    const existingReview = await reviewRepo.findByUserAndProduct(userId, productId);
    if (existingReview) {
        throw new HttpError(400, "You have already reviewed this product");
    }

    const reviewData: Partial<IReview> = {
        userId,
        productId,
        rating: data.rating,
        comment: data.comment
    };

    const review = await reviewRepo.create(reviewData);
    return review;
}


    async getProductReviews(productId: string, page: number = 1, size: number = 10) {
        const { reviews, total } = await reviewRepo.findByProductId(productId, page, size);
        const avgRating = await reviewRepo.getAverageRating(productId);
        
        const pagination = {
            page,
            size,
            total,
            totalPages: Math.ceil(total / size)
        };

        return { reviews, avgRating, pagination };
    }

    async getUserReviews(userId: string) {
        const reviews = await reviewRepo.findByUserId(userId);
        return reviews;
    }

    async updateReview(reviewId: string, userId: string, data: UpdateReviewType) {
        const review = await reviewRepo.findById(reviewId);
        
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        if (review.userId.toString() !== userId) {
            throw new HttpError(403, "You can only update your own reviews");
        }

        const updated = await reviewRepo.update(reviewId, data);
        return updated;
    }

    async deleteReview(reviewId: string, userId: string, userRole?: string) {
        const review = await reviewRepo.findById(reviewId);
        
        if (!review) {
            throw new HttpError(404, "Review not found");
        }

        // Only owner or admin can delete
        if (review.userId.toString() !== userId && userRole !== "admin") {
            throw new HttpError(403, "You can only delete your own reviews");
        }

        const deleted = await reviewRepo.delete(reviewId);
        return deleted;
    }
}
