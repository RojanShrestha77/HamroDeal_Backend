import { z } from "zod";

// Product schema (for populated product)
export const PopulatedProductSchema = z.object({
    _id: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    stock: z.number(),
    images: z.string().optional(),
    categoryId: z.object({
        _id: z.string(),
        name: z.string(),
    }).optional(),
    sellerId: z.object({
        _id: z.string(),
        username: z.string().optional(),
        email: z.string().optional(),
    }).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

// Wishlist item with validated product
export const WishlistItemResponseSchema = z.object({
    productId: PopulatedProductSchema,
    addedAt: z.date(),
});

// Full wishlist response
export const WishlistResponseSchema = z.object({
    _id: z.string(),
    userId: z.string(),
    items: z.array(WishlistItemResponseSchema),
    itemCount: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// TypeScript types
export type WishlistItemResponse = z.infer<typeof WishlistItemResponseSchema>;
export type WishlistResponse = z.infer<typeof WishlistResponseSchema>;
export type PopulatedProduct = z.infer<typeof PopulatedProductSchema>;
