import { CreateOrderDto, OrderQueryDto, UpdateOrderStatusDto } from "../dtos/order.dto";
import { OrderService } from "../services/order.service";
import { Request, Response } from "express";
const orderService = new OrderService();

export class OrderController {
    async createOrder(req: Request, res: Response) {
        try {
            const parsedData = CreateOrderDto.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "validation failed",
                    errors: parsedData.error
                });
            }

            const userId = req.user?._id;
            const orderData = {
                ...parsedData.data,
                userId
            };

            const order = await orderService.createOrder(orderData);

            return res.status(201).json({
                success: true,
                data: order,
                message: "Order created successfully",
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal server error"
            });
        }
    }

    async getOrderById(req: Request<{ id: string }>, res: Response) {
        try {
            const orderId = req.params.id;
            const order = await orderService.getOrderById(orderId);

            return res.status(200).json({
                success: true,
                data: order,
                message: "Order fetched successfully"
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });
        }

    }

    async getUserOrders(req: Request, res: Response) {
        try {
            const parsedQuery = OrderQueryDto.safeParse(req.query);

            if (!parsedQuery.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid query parameters",
                    errors: parsedQuery.error.issues
                });
            }

            const userId = req.user?._id;
            const { page, size } = parsedQuery.data;

            const currentPage = page ? parseInt(page) : 1;
            const pageSize = size ? parseInt(size) : 10;

            const { orders, pagination } = await orderService.getUserorders(
                userId!.toString(),
                currentPage,
                pageSize
            );

            return res.status(200).json({
                success: true,
                data: orders,
                pagination,
                message: "Orders fetched successfully"
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });

        }


    }
    async getSellerOrders(req: Request, res: Response) {
        try {
            const parsedQuery = OrderQueryDto.safeParse(req.query);

            if (!parsedQuery.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid query parameters",
                    errors: parsedQuery.error.issues
                });
            }

            const sellerId = req.user?._id;
            const { page, size } = parsedQuery.data;

            const currentPage = page ? parseInt(page) : 1;
            const pageSize = size ? parseInt(size) : 10;

            const { orders, pagination } = await orderService.getSellerOrders(
                sellerId!.toString(),
                currentPage,
                pageSize,
            );
            return res.status(200).json({
                success: true,
                data: orders,
                pagination,
                message: "Orders fetched successfully"
            });



        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });
        }
    }

    async getAllOrders(req: Request, res: Response) {
        try {
            const parsedQuery = OrderQueryDto.safeParse(req.query);

            if (!parsedQuery.success) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid query parameters",
                    errors: parsedQuery.error.issues
                });
            }

            const { page, size, status } = parsedQuery.data;

            const currentPage = page ? parseInt(page) : 1;
            const pageSize = size ? parseInt(size) : 10;

            const { orders, pagination } = await orderService.getAllOrders(
                currentPage,
                pageSize,
                status,

            );

            return res.status(200).json({
                success: true,
                data: orders,
                pagination,
                message: "Orders fetched successfully"
            });


        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });
        }
    }

    async updateOrderStatus(req: Request<{ id: string }>, res: Response) {
        try {
            const parsedData = UpdateOrderStatusDto.safeParse(req.body);

            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors: parsedData.error
                });
            }

            const orderId = req.params.id;
            const { status } = parsedData.data;
            const userId = req.user?._id;
            const userRole = req.user?.role;

            const order = await orderService.updateOrderStatus(
                orderId,
                status,
                userId?.toString(),
                userRole,
            );

            return res.status(200).json({
                success: true,
                data: order,
                message: "Order status updated successfully"
            })



        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });
        }

    }

    async cancelOrder(req: Request<{ id: string }>, res: Response) {
        try {
            const orderId = req.params.id;
            const userId = req.user?._id;

            const order = await orderService.cancelorder(orderId, userId!.toString());

            return res.status(200).json({
                success: true,
                data: order,
                message: "Order cancelled successfully"
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });
        }

    }

    async deleteOrder(req: Request<{ id: string }>, res: Response) {
        try {
            const orderId = req.params.id;
            await orderService.deleteOrder(orderId);

            return res.status(200).json({
                success: true,
                message: "Order deleted successfully"
            });
        } catch (err: any) {
            return res.status(err.statusCode || 500).json({
                success: false,
                message: err.message || "Internal Server Error"
            });
        }
    }

}