import z from "zod";

export const AddToWishlistDto = z.object({
    productId: z.string().min(1, "ProductId is required"),
});

export type AddToWishlistDto = z.infer<typeof AddToWishlistDto>;
