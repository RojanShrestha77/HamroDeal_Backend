import { Router } from "express";
import { OrderController } from "../controllers/order.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const orderController = new OrderController();

router.use(authorizedMiddleware);

// Create order (from cart checkout)
router.post("/", orderController.createOrder);

// Get user's orders
router.get("/my-orders", orderController.getUserOrders);

// Get single order by ID
router.get("/:id", orderController.getOrderById);

// Cancel order (user can only cancel their own pending/processing orders)
router.patch("/:id/cancel", orderController.cancelOrder);

export default router;
