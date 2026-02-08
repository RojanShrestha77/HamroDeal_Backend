import mongoose from "mongoose";

export interface CartItemType {
    productId: string;
    quantity: number;
    price: number;
}

export interface CartType {
    userId?: string;
    items: CartItemType[];
}

export interface PopulatedCartItem {
    productId: {
        _id: mongoose.Types.ObjectId;
        title: string;
        description: string;
        price: number;
        stock: number;
        images?: string;

    };
    quantity: number;
    price: number;
}

export interface CartResponse {
    _id: string;
    userId?: string;
    items: PopulatedCartItem[];
    total: number;
    itemCount: number;
    createdAt: Date;
    updatedAt: Date;
}