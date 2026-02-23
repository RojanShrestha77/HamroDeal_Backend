import { z } from "zod";

export const CreateNotificationSchema = z.object({
  userId: z.string(),
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(500),
  type: z.enum(['order', 'product', 'review', 'system', 'admin']),
  relatedId: z.string().optional(), 
  actionUrl: z.string().optional(),
});

export const UpdateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
});

export type CreateNotificationType = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationType = z.infer<typeof UpdateNotificationSchema>;
