import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const notificationController = new NotificationController();

router.use(authorizedMiddleware);

router.get("/", notificationController.getMyNotifications.bind(notificationController));

router.get("/unread-count", notificationController.getUnreadCount.bind(notificationController));

router.patch("/:id/read", notificationController.markAsRead.bind(notificationController));

router.patch("/mark-all-read", notificationController.markAllAsRead.bind(notificationController));

router.delete("/:id", notificationController.deleteNotification.bind(notificationController));

router.delete("/", notificationController.deleteAllNotifications.bind(notificationController));

export default router;
