// dtos/product.dto.ts
import z from 'zod';
import { ProductSchema } from '../types/product.type'; 

// ✅ REMOVE sellerId - it comes from authenticated user
export const CreateProductDto = ProductSchema.omit({
    sellerId: true,  // Don't let users specify sellerId
});

export type CreateProductDto = z.infer<typeof CreateProductDto>;

// ✅ Can't update sellerId or categoryId (prevent ownership transfer)
export const UpdateProductDto = ProductSchema.partial().omit({
    sellerId: true,     // Can't change product owner
});

export type UpdateProductDto = z.infer<typeof UpdateProductDto>;