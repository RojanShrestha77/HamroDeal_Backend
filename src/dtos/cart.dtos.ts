import z from "zod";

export const AddToCartDto = z.object({
    productId: z.string().min(1, "Product Id is required"),
    quantity: z.number().int().min(1,"Quality mus tbe at least 1")
});

export const UpdateCartItemDto = z.object({
    quantity: z.number().int().min(0, "Quality cannot be nagative")
});

export type AddToCartDto = z.infer<typeof AddToCartDto>;
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemDto>;