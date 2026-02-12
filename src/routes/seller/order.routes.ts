import { Router } from "express";
import { OrderController } from "../../controllers/order.controller";
import { authorizedMiddleware, approvedSellerMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const orderController = new OrderController();

// this is selller order routes
router.use(authorizedMiddleware);
router.use(approvedSellerMiddleware);

// Get all orders containing seller's products
router.get("/", orderController.getSellerOrders);

// Get single order details
router.get("/:id", orderController.getOrderById);

// Update order status (seller can update orders with their products)
router.patch("/:id/status", orderController.updateOrderStatus);

export default router;
