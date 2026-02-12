import z from "zod";

export const CreateOrderDto = z.object({
    items: z.array(z.object({
        productId: z.string().min(1, "Product id is required"),
        productName: z.string().min(1, "Product name is required"),
        productImage: z.string().optional(),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0, "Price must be positive"),
        sellerId: z.string().min(1, "Seller Id is required"),

    })).min(1, "At least one item is required"),

    shippingAddress: z.object({
        fullName: z.string().min(1, "Full name is required"),
        phone: z.string().min(10, "Phone number must be at least 10"),
        address: z.string().min(5, "Address is required"),
        city: z.string().min(1, "City is required"),
        state: z.string().optional(),
        zipCode: z.string().min(1, "Zip code is required"),
        country: z.string().min(1, "Country is required"),
    }),

    paymentMethod: z.enum(["cash_on_delivery", "card", "online"], {
        message: "Invalid payment method"
    }),

    shippingCost: z.number().min(0).optional(),
    notes: z.string().optional(),
    
});

// dto for updatinfg order status
export const UpdateOrderStatusDto = z.object({
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"], {
        message: "Invalid order status"
    })
});

// dto for query parameteds
export const OrderQueryDto = z.object({
    page: z.string().optional(),
    size: z.string().optional(),
    status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).optional(),
});

export type CreateOrderDtoType = z.infer<typeof CreateOrderDto>;
export type UpdateOrderStatusDtoType = z.infer<typeof UpdateOrderStatusDto>;
export type OrderQuerDtoType = z.infer<typeof OrderQueryDto>;
