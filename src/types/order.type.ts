import z from "zod";

export const OrderItemSchema = z.object({
    productId: z.string(),
    productName: z.string(),
    productImage: z.string().optional(),
    quantity: z.number().min(1),
    price: z.number().min(0),
    sellerId: z.string(),
});

export const ShippingAddressSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    phone: z.string().min(10, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().optional(),
    zipCode: z.string().min(1, "Zip code is required"),
    country: z.string().min(1, "Country is required"),
});

export const OrderSchema = z.object({
    userId: z.string(),
    items: z.array(OrderItemSchema),
    shippingAddress: ShippingAddressSchema,
    paymentMethod: z.enum(["cash_on_delivery", "card", "online"]),
    subtotal: z.number().min(0),
    shippingCost: z.number().min(0).default(0),
    tax: z.number().min(0).default(0),
    total: z.number().min(0),
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
    notes: z.string().optional(),
});

export type OrderItemType = z.infer<typeof OrderItemSchema>;
export type ShippingAddressType = z.infer<typeof ShippingAddressSchema>;
export type OrderType = z.infer<typeof OrderSchema>;
