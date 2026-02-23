import mongoose from "mongoose";
import { HttpError } from "../errors/http-error";
import { INotification } from "../models/notification.model";
import { NotificationRepository } from "../repositories/notification.repository";
import { CreateNotificationType } from "../types/notification.type";

const notificationRepo = new NotificationRepository();

export class NotificationService {
    async createNotification(data: CreateNotificationType): Promise<INotification>{
        const notification = await notificationRepo.create({...data, userId: new mongoose.Types.ObjectId(data.userId),});
        return notification;
    }

    async getUserNotification(userId: string, page: number = 1,size: number = 20){
        const {notifications, total} = await notificationRepo.findByUserId(userId, page, size);

        const pagination = {
            page, 
            size,
            total,
            totalPages: Math.ceil(total/size),
        };

        return { notifications, pagination};
    }

    async getUnreadCount(userId: string): Promise<number>{
        return await notificationRepo.getUnreadCount(userId);
    }

    async markAsRead(notificationId: string, userId: string):Promise<INotification> {
        const notification = await notificationRepo.findById(notificationId);

        if(!notification) {
            throw new HttpError(404, "Notification not found");
        }

        if(notification.userId.toString() !== userId) {
            throw new HttpError(403, "You can only mark your own notification as read");
        }

        const updated = await notificationRepo.markAsRead(notificationId);

        if(!updated) {
            throw new HttpError(500, "Failed to mark notification as read");
        }

        return updated;
    }

    async markAllAsRead(userId: string):Promise<number> {
        return await notificationRepo.markAllAsRead(userId);
    }

    async deleteNotification(notificationId: string, userId: string): Promise<INotification> {
        const notification = await notificationRepo.findById(notificationId);

        if(!notification) {
            throw new HttpError(404, "Notification not found",)
        }

        if(notification.userId.toString() !== userId) {
            throw new HttpError(403, "You can only delete your own notification");
        }

        const deleted = await notificationRepo.delete(notificationId);

        if(!deleted) {
            throw new HttpError(500, "Failed to delete notification");
        }

        return deleted;
    }

    async deleteAllNotifications(userId: string): Promise<number> {
        return await notificationRepo.deleteAllForUser(userId);
    }
}