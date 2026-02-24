import { z } from 'zod';

// Zod schema for validation (uses strings for API)
export const ConversationSchema = z.object({
  participants: z.array(z.string()).length(2),
  lastMessage: z.object({
    text: z.string(),
    senderId: z.string(),
    timestamp: z.date(),
  }).optional(),
  unreadCount: z.record(z.string(), z.number()).optional(),
});

// TypeScript type for database (don't extend from Zod)
export type ConversationType = {
  participants: string[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount?: Record<string, number>;
};

export const CreateConversationSchema = z.object({
  otherUserId: z.string().min(1, 'Other user ID is required'),
});

export type CreateConversationType = z.infer<typeof CreateConversationSchema>;
