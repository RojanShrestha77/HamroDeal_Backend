import { z } from 'zod';

// Zod schema for validation (uses strings for API)
export const MessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  senderId: z.string().min(1, 'Sender ID is required'),
  receiverId: z.string().min(1, 'Receiver ID is required'),
  text: z.string().min(1, 'Message text is required').max(1000, 'Message too long'),
  type: z.enum(['text', 'image', 'file']).default('text'),
  status: z.enum(['sent', 'delivered', 'read']).default('sent'),
});

// TypeScript type for database (don't extend from Zod)
export type MessageType = {
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  type: 'text' | 'image' | 'file';
  status: 'sent' | 'delivered' | 'read';
};

export const SendMessageSchema = z.object({
  conversationId: z.string().min(1, 'Conversation ID is required'),
  text: z.string().min(1, 'Message text is required').max(1000, 'Message too long'),
});

export type SendMessageType = z.infer<typeof SendMessageSchema>;

export const UpdateMessageStatusSchema = z.object({
  status: z.enum(['delivered', 'read']),
});

export type UpdateMessageStatusType = z.infer<typeof UpdateMessageStatusSchema>;
