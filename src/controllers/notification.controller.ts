import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";

const notificationService = new NotificationService();

export class NotificationController {
  async getMyNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 20;

      const result = await notificationService.getUserNotification(userId!, page, size);

      return res.status(200).json({
        success: true,
        data: result.notifications,
        pagination: result.pagination,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      const count = await notificationService.getUnreadCount(userId!);

      return res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async markAsRead(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = req.user?._id.toString();
      const notificationId = req.params.id;

      const notification = await notificationService.markAsRead(notificationId, userId!);

      return res.status(200).json({
        success: true,
        data: notification,
        message: "Notification marked as read",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      const count = await notificationService.markAllAsRead(userId!);

      return res.status(200).json({
        success: true,
        data: { count },
        message: `${count} notifications marked as read`,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteNotification(req: Request<{ id: string }>, res: Response) {
    try {
      const userId = req.user?._id.toString();
      const notificationId = req.params.id;

      await notificationService.deleteNotification(notificationId, userId!);

      return res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteAllNotifications(req: Request, res: Response) {
    try {
      const userId = req.user?._id.toString();
      const count = await notificationService.deleteAllNotifications(userId!);

      return res.status(200).json({
        success: true,
        data: { count },
        message: `${count} notifications deleted`,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message,
      });
    }
  }
}
