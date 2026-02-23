import { Notification, INotification } from "../models/notification.model";
import { CreateNotificationType, UpdateNotificationType } from "../types/notification.type";

export interface INotificationRepository {
  create(data: Partial<INotification>): Promise<INotification>;
  findById(id: string): Promise<INotification | null>;
  findByUserId(userId: string, page: number, size: number): Promise<{ notifications: INotification[], total: number }>;
  getUnreadCount(userId: string): Promise<number>;
  update(id: string, data: UpdateNotificationType): Promise<INotification | null>;
  markAsRead(id: string): Promise<INotification | null>;
  markAllAsRead(userId: string): Promise<number>;
  delete(id: string): Promise<INotification | null>;
  deleteAllForUser(userId: string): Promise<number>;
}

export class NotificationRepository implements INotificationRepository {
  async create(data: Partial<INotification>): Promise<INotification> {
    const notification = new Notification(data);
    return await notification.save();
  }

  async findById(id: string): Promise<INotification | null> {
    return await Notification.findById(id);
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    size: number = 20
  ): Promise<{ notifications: INotification[], total: number }> {
    const skip = (page - 1) * size;
    
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(size);
    
    const total = await Notification.countDocuments({ userId });
    
    return { notifications, total };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await Notification.countDocuments({ userId, isRead: false });
  }

  async update(id: string, data: UpdateNotificationType): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(id, data, { new: true });
  }

  async markAsRead(id: string): Promise<INotification | null> {
    return await Notification.findByIdAndUpdate(
      id,
      { isRead: true },
      { new: true }
    );
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    return result.modifiedCount;
  }

  async delete(id: string): Promise<INotification | null> {
    return await Notification.findByIdAndDelete(id);
  }

  async deleteAllForUser(userId: string): Promise<number> {
    const result = await Notification.deleteMany({ userId });
    return result.deletedCount;
  }
}
