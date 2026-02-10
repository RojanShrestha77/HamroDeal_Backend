// backend/src/types/cart.type.ts
import z from "zod";
import mongoose from "mongoose";

// Zod schemas for validation
export const CartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
});

export const PopulatedProductSchema = z.object({
  _id: z.instanceof(mongoose.Types.ObjectId),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  stock: z.number(),
  images: z.string().optional(),
});

export const PopulatedCartItemSchema = z.object({
  productId: PopulatedProductSchema,
  quantity: z.number().int().min(1),
  price: z.number().min(0),
});

export const CartResponseSchema = z.object({
  _id: z.string(),
  userId: z.string().optional(),
  items: z.array(PopulatedCartItemSchema),
  total: z.number(),
  itemCount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Export types from Zod schemas
export type CartItemType = z.infer<typeof CartItemSchema>;
export type PopulatedCartItem = z.infer<typeof PopulatedCartItemSchema>;
export type CartResponse = z.infer<typeof CartResponseSchema>;

// Additional types that don't need Zod validation
export interface CartType {
  userId?: string;
  items: CartItemType[];
}