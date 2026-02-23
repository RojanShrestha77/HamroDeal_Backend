import { CreateOrderDtoType } from "../dtos/order.dto";
import { HttpError } from "../errors/http-error";
import { IOrder } from "../models/order.model";
import { OrderRepository } from "../repositories/order.repository";
import { ProductRepository } from "../repositories/product.repositories";
import { NotificationService } from "./notification.service";

const orderRepo = new OrderRepository();
const notificationService = new NotificationService();
const productRepo = new ProductRepository();

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

        // ✅ CREATE NOTIFICATION for buyer
        await notificationService.createNotification({
            userId: data.userId.toString(),
            title: 'Order Placed Successfully',
            message: `Your order #${order._id.toString().slice(-6)} has been placed. Total: Rs.${total.toFixed(2)}`,
            type: 'order',
            relatedId: order._id.toString(),
            actionUrl: `/orders/${order._id}`
        });

        // ✅ CREATE NOTIFICATION for each seller
        const sellerNotifications = new Map<string, string[]>();
        
        for (const item of order.items) {
            const sellerId = item.sellerId.toString();
            if (!sellerNotifications.has(sellerId)) {
                sellerNotifications.set(sellerId, []);
            }
            sellerNotifications.get(sellerId)!.push(item.productName);
        }

        // Send notification to each seller
        for (const [sellerId, productTitles] of sellerNotifications) {
            await notificationService.createNotification({
                userId: sellerId,
                title: 'New Order Received',
                message: `You have a new order for ${productTitles.length} product(s): ${productTitles.join(', ')}`,
                type: 'order',
                relatedId: order._id.toString(),
                actionUrl: `/seller/orders/${order._id}`
            });
        }

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
            const sellerItems = order.items.filter(item => item.sellerId.toString() === sellerId);
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

        return { orders, pagination };
    }

    async updateOrderStatus(id: string, status: string, userId?: string, userRole?: string) {
        const order = await orderRepo.findById(id);

        if (!order) {
            throw new HttpError(404, "Order not found");
        }

        // Authorization check
        if (userRole !== "admin") {
            if (userRole === "seller") {
                const hasSellersProduct = order.items.some(item => item.sellerId.toString() === userId);
                if (!hasSellersProduct) {
                    throw new HttpError(403, "You are not authorized to update this order");
                }
            } else {
                throw new HttpError(403, "Only admins and sellers can update order status");
            }
        }

        // Update the order status
        const updatedOrder = await orderRepo.updateStatus(id, status);

        if (!updatedOrder) {
            throw new HttpError(500, "Failed to update order status");
        }

        // ✅ CREATE NOTIFICATION for buyer based on status
        const buyerUserId = typeof order.userId === 'object' && order.userId._id
            ? order.userId._id.toString()
            : order.userId.toString();

        let notificationTitle = '';
        let notificationMessage = '';
        const orderNumber = id.slice(-6);

        switch (status) {
            case 'pending':
                notificationTitle = 'Order Confirmed';
                notificationMessage = `Your order #${orderNumber} has been confirmed`;
                break;
            case 'processing':
                notificationTitle = 'Order Processing';
                notificationMessage = `Your order #${orderNumber} is being processed`;
                break;
            case 'shipped':
                notificationTitle = 'Order Shipped';
                notificationMessage = `Your order #${orderNumber} has been shipped and is on the way!`;
                break;
            case 'delivered':
                notificationTitle = 'Order Delivered';
                notificationMessage = `Your order #${orderNumber} has been delivered. Please review your products!`;
                break;
            case 'cancelled':
                notificationTitle = 'Order Cancelled';
                notificationMessage = `Your order #${orderNumber} has been cancelled`;
                break;
        }

        if (notificationTitle) {
            await notificationService.createNotification({
                userId: buyerUserId,
                title: notificationTitle,
                message: notificationMessage,
                type: 'order',
                relatedId: id,
                actionUrl: `/orders/${id}`
            });
        }

        return updatedOrder;
    }

    async cancelorder(id: string, userId: string) {
        const order = await orderRepo.findById(id);

        if (!order) {
            throw new HttpError(404, "Order not found");
        }

        // Fix: Handle both populated and non-populated userId
        const orderUserId = typeof order.userId === 'object' && order.userId._id
            ? order.userId._id.toString()
            : order.userId.toString();

        if (orderUserId !== userId) {
            throw new HttpError(403, "You are not authorized to cancel this order");
        }

        if (order.status !== "pending" && order.status !== "processing") {
            throw new HttpError(400, "Cannot cancel order in the current status");
        }

        const updated = await orderRepo.updateStatus(id, "cancelled");

        // ✅ CREATE NOTIFICATION for cancellation
        await notificationService.createNotification({
            userId: userId,
            title: 'Order Cancelled',
            message: `Your order #${id.slice(-6)} has been cancelled successfully`,
            type: 'order',
            relatedId: id,
            actionUrl: `/orders/${id}`
        });

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
