import mongoose from "mongoose";
import { OrderModel, IOrder } from "../models/order.model";

export interface IOrderRepository {
    create(order: Partial<IOrder>): Promise<IOrder>;
    findById(id: string): Promise<IOrder | null>;
    findByUserId(userId: string, page: number, size: number): Promise<{ orders: IOrder[], total: number }>;
    findBySellerId(sellerId: string, page: number, size: number): Promise<{ orders: IOrder[], total: number }>;
        findByUserIdUnpopulated(userId: string): Promise<IOrder[]>; // ← Add this

    findAll(page: number, size: number, status?: string): Promise<{ orders: IOrder[], total: number }>;
    updateStatus(id: string, status: string): Promise<IOrder | null>;
    delete(id: string): Promise<boolean>;


}

export class OrderRepository implements IOrderRepository {
    async findByUserIdUnpopulated(userId: string): Promise<IOrder[]> {
        const orders = await OrderModel.find({ userId })
            .sort({ createdAt: -1 })
            .lean(); // Use lean() for better performance
        return orders;    }
    async findAll(page: number, size: number, status?: string): Promise<{ orders: IOrder[]; total: number; }> {
        const filter = status ? { status } : {}
        const [orders, total] = await Promise.all([
            OrderModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * size)
                .limit(size)
                .populate([
                    { path: "userId", select: "firstName lastName email" },
                    { path: "items.productId", select: "name images price" },
                    { path: "items.sellerId", select: "firstName lastName" }
                ]),
            OrderModel.countDocuments(filter)
        ]);
        return { orders, total };
    }
    async create(order: Partial<IOrder>): Promise<IOrder> {
        const newOrder = new OrderModel(order);
        const saved = await newOrder.save();
        return saved.populate([
            { path: "userId", select: "firstname lastName email" },
            { path: "items.productId", select: "name images price" },
            { path: "items.sellerId", select: "firstName lastName email" }
        ]);
    }
    async findById(id: string): Promise<IOrder | null> {
        const order = await OrderModel.findById(id).populate([
            { path: "userId", select: "firstName lastName email" },
            { path: "items.productId", select: "name images price" },
            { path: "items.sellerId", select: "firstName lastName email" }
        ]);
        return order;
    }
    async findByUserId(userId: string, page: number, size: number): Promise<{ orders: IOrder[]; total: number; }> {
        const [orders, total] = await Promise.all([
            OrderModel.find({ userId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * size)
                .limit(size)
                .populate([
                    { path: "items.productId", select: "name images price" },
                    { path: "items.sellerId", select: "firstName lastName" }
                ]),
            OrderModel.countDocuments({ userId })
        ]);
        return { orders, total };
    }
    async findBySellerId(sellerId: string, page: number, size: number): Promise<{ orders: IOrder[]; total: number; }> {
        const [orders, total] = await Promise.all([
            OrderModel.find({ "items.sellerId": sellerId })
                .sort({ createdAt: -1 })
                .skip((page - 1) * size)
                .limit(size)
                .populate([
                    { path: "userId", select: "firstName lastName email" },
                    { path: "items.productId", select: "name images price" }
                ]),
            OrderModel.countDocuments({ "items.sellerId": sellerId })
        ]);
        return { orders, total };


    }

    async updateStatus(id: string, status: string): Promise<IOrder | null> {
        const order = await OrderModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate([
            { path: "userId", select: "firstName lastName email" },
            { path: "items.productId", select: "name images price" },
            { path: "items.sellerId", select: "firstName lastName" }
        ]);
        return order;
    }
    async delete(id: string): Promise<boolean> {
        const result = await OrderModel.findByIdAndDelete(id);
        return result !== null;
    }

}