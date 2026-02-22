import z from 'zod';

export const ReviewSchema = z.object({
    productId: z.string(),
    userId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().min(10, "Comment must be at least 10 characters").max(500, "Comment must be less than 500 characters"),
});

export const CreateReviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(10, "Comment must be at least 10 characters").max(500, "Comment must be less than 500 characters"),
});

export const UpdateReviewSchema = z.object({
    rating: z.number().min(1).max(5).optional(),
    comment: z.string().min(10, "Comment must be at least 10 characters").max(500, "Comment must be less than 500 characters").optional(),
});

export type ReviewType = z.infer<typeof ReviewSchema>;
export type CreateReviewType = z.infer<typeof CreateReviewSchema>;
export type UpdateReviewType = z.infer<typeof UpdateReviewSchema>;
