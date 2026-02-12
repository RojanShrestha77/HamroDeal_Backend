import { Router } from "express";
import { OrderController } from "../../controllers/order.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const orderController = new OrderController();

// this is admin order routes
router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/", orderController.getAllOrders);

router.get("/:id", orderController.getOrderById);

// Update order status (admin can update any order)
router.patch("/:id/status", orderController.updateOrderStatus);

// Delete order (admin only)
router.delete("/:id", orderController.deleteOrder);

export default router;
