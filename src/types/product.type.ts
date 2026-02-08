import z from 'zod';
import mongoose from 'mongoose';

// Custom ObjectId validator
const objectIdSchema = z.string().refine(
  (val) => mongoose.Types.ObjectId.isValid(val),
  { message: "Invalid ObjectId format" }
);

export const ProductSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    price: z.coerce.number().positive("Price must be greater than 0"),
    stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
    images: z.string().optional(),
    categoryId: objectIdSchema,
    sellerId: objectIdSchema,    
})