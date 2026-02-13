import { CreateOrderDtoType } from "../dtos/order.dto";
import { HttpError } from "../errors/http-error";
import { IOrder } from "../models/order.model";
import { OrderRepository } from "../repositories/order.repository";

const orderRepo = new OrderRepository();

export class OrderService {
    async createOrder(data: CreateOrderDtoType & { userId: any }) {
        // Validate order data
        if (!data.userId || !data.items || data.items.length === 0) {
            throw new HttpError(400, "Invalid order data");
        }

        // Calculate totals
        const subtotal = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = data.shippingCost || 50; // Default shipping cost
        const tax = subtotal * 0.13; // 13% tax
        const total = subtotal + shippingCost + tax;

        const orderData: Partial<IOrder> = {
            userId: data.userId,
            items: data.items,
            shippingAddress: data.shippingAddress,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
            subtotal,
            shippingCost,
            tax,
            total,
            status: "pending"
        };

        const order = await orderRepo.create(orderData);
        return order;
    }


    async getOrderById(id: string) {
        const order = await orderRepo.findById(id);
        if (!order) {
            throw new HttpError(404, "Order not found");
        }
        return order;
    }

    async getUserorders(userId: string, page: number = 1, size: number = 10) {
        const { orders, total } = await orderRepo.findByUserId(userId, page, size);
        const pagination = {
            page,
            size,
            total,
            totalPages: Math.ceil(total / size)
        };
        return { orders, pagination };

    }

    async getSellerOrders(sellerId: string, page: number = 1, size: number = 10) {
        const { orders, total } = await orderRepo.findBySellerId(sellerId, page, size);

        const filteredOrders = orders.map(order => {
            const sellerItems = order.items.filter(
                item => item.sellerId.toString() === sellerId
            );

            return {
                ...order.toObject(),
                items: sellerItems, // Only seller's items
            };
        });
        const pagination = {
            page,
            size,
            total,
            totalPages: Math.ceil(total / size)
        };
        return { orders: filteredOrders, pagination };
    }

    async getAllOrders(page: number = 1, size: number = 10, status?: string) {
        const { orders, total } = await orderRepo.findAll(page, size, status);
        const pagination = {
            page,
            size,
            total,
            totalPages: Math.ceil(total / size)
        };
        return { orders, pagination }
    }

    async updateOrderStatus(id: string, stauts: string, userId?: string, userRole?: string) {
        const order = await orderRepo.findById(id);
        if (!order) {
            throw new HttpError(404, "Order not found");
        }

        // Authorizxation check
        if (userRole !== "admin") {
            if (userRole === "seller") {
                const hasSellersProduct = order.items.some(
                    item => item.sellerId.toString() === userId
                );
                if (!hasSellersProduct) {
                    throw new HttpError(403, "You are not authorized to update this order");
                }
            } else {
                throw new HttpError(403, "Only admins and sellers can update order status");
            }
        }
    }

    async cancelorder(id: string, userId: string) {
        const order = await orderRepo.findById(id);

        if (!order) {
            throw new HttpError(404, "Order not found");
        }

        if (order.userId.toString() !== userId) {
            throw new HttpError(403, "You are not authorized to cancel this order");
        }

        if (order.status !== "pending" && order.status !== "processing") {
            throw new HttpError(400, "Cannot cancel order in teh current status")
        }

        const updated = await orderRepo.updateStatus(id, "cancelled");
        return updated;
    }

    async deleteOrder(id: string) {
        const order = await orderRepo.findById(id);

        if (!order) {
            throw new HttpError(404, "Order not found");
        }

        const deleted = await orderRepo.delete(id);
        return deleted;
    }
}