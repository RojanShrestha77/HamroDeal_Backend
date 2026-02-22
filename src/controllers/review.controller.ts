import { Request, Response } from "express";
import { CreateReviewSchema, UpdateReviewSchema } from "../types/review.type";
import { ReviewService } from "../services/review.service";

const reviewService = new ReviewService();

export class ReviewController {
    async createReview(req: Request<{ productId: string }>, res: Response) {
        try {
            const parsedData = CreateReviewSchema.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: parsedData.error
                });
            }

            const userId = req.user?._id.toString();
            const productId = req.params.productId;

            const review = await reviewService.createReview(userId!, productId, parsedData.data);

            return res.status(201).json({
                success: true,
                data: review,
                message: "Review created successfully"
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });
        }
    }

    async getProductReviews(req: Request<{ productId: string }>, res: Response) {
        try {
            const productId = req.params.productId;
            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 10;

            const result = await reviewService.getProductReviews(productId, page, size);

            return res.status(200).json({
                success: true,
                data: result.reviews,
                avgRating: result.avgRating,
                pagination: result.pagination,
                message: "Reviews fetched successfully"
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });
        }
    }

    async getUserReviews(req: Request, res: Response) {
        try {
            const userId = req.user?._id.toString();
            const reviews = await reviewService.getUserReviews(userId!);

            return res.status(200).json({
                success: true,
                data: reviews,
                message: "Reviews fetched successfully"
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });
        }
    }

    async updateReview(req: Request<{ id: string }>, res: Response) {
        try {
            const parsedData = UpdateReviewSchema.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: parsedData.error
                });
            }

            const reviewId = req.params.id;
            const userId = req.user?._id.toString();

            const review = await reviewService.updateReview(reviewId, userId!, parsedData.data);

            return res.status(200).json({
                success: true,
                data: review,
                message: "Review updated successfully"
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });
        }
    }

    async deleteReview(req: Request<{ id: string }>, res: Response) {
        try {
            const reviewId = req.params.id;
            const userId = req.user?._id.toString();
            const userRole = req.user?.role;

            await reviewService.deleteReview(reviewId, userId!, userRole);

            return res.status(200).json({
                success: true,
                message: "Review deleted successfully"
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });
        }
    }
}
