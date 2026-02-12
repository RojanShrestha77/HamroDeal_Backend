import mongoose from "mongoose";
import { CartModel, ICart } from "../models/cart.model";

export interface ICartRepository {
    getCartByUserId(userId: string): Promise<ICart | null>;
    createCart(userId: string): Promise<ICart>;
    addItemToCart(userId: string, productId: string, quantity: number, price: number): Promise<ICart>;
    updateItemQuantity(userId: string, productId: string, quantity: number): Promise<ICart | null>;
    removeItemFromCart(userId: string, productId: string): Promise<ICart | null>;
    clearCart(userId: string): Promise<ICart | null>;

}

export class CartRepository implements ICartRepository {
    async updateItemQuantity(userId: string, productId: string, quantity: number): Promise<ICart | null> {
        const cart = await CartModel.findOne({ userId });

        if (!cart) return null;

        if (quantity === 0) {
            return await this.removeItemFromCart(userId, productId);
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (itemIndex === -1) return null;

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        return await CartModel.findById(cart._id).populate({
            path: "items.productId",
            select: "title description price stock images sellerId",
        });

    }
    async getCartByUserId(userId: string): Promise<ICart | null> {
        return await CartModel.findOne({ userId })
            .populate({
                path: "items.productId",
                select: "title description price stock images sellerId",
            });
    }
    async createCart(userId: string): Promise<ICart> {
        const cart = new CartModel({ userId, items: [] });
        await cart.save();
        return cart;
    }
    async addItemToCart(userId: string, productId: string, quantity: number, price: number): Promise<ICart> {
        let cart = await CartModel.findOne({ userId });

        if (!cart) {
            cart = await this.createCart(userId) as any;
        }

        // check if product already exists in teh cart
        const existingItemIndex = cart!.items.findIndex(
            (item) => item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
            cart!.items[existingItemIndex].quantity += quantity;
        } else {
            cart!.items.push({
                productId: new mongoose.Types.ObjectId(productId),
                quantity,
                price,
            });
        }

        await cart!.save();

        // Populate aND RETURN
        return await CartModel.findById(cart!._id).populate({
            path: "items.productId",
            select: "title description price stock images sellerId"

        }) as ICart;
    }


    async removeItemFromCart(userId: string, productId: string): Promise<ICart | null> {
        const cart = await CartModel.findOne({ userId });

        if (!cart) return null;

        cart.items = cart.items.filter(
            (item) => item.productId.toString() !== productId

        );

        await cart.save();

        return await CartModel.findById(cart._id).populate({
            path: "items.productId",
            select: "title description price stock images sellerId",
        });

    }
    async clearCart(userId: string): Promise<ICart | null> {
        const cart = await CartModel.findOne({ userId });

        if (!cart) return null;

        cart.items = [];
        await cart.save();

        return cart;
    }

}