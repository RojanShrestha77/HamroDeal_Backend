import mongoose from "mongoose";
import { IMessage } from "../models/message.model";
import { ConversationRepository, IConversationRepository } from "../repositories/conversation.repository";
import { IMessageRepository, MessageRepository } from "../repositories/message.repository";
import { SendMessageType } from "../types/message.type";
import { HttpError } from "../errors/http-error";

const messageRepo : IMessageRepository = new MessageRepository();
const conversationRepo : IConversationRepository = new ConversationRepository();

export class MessageService {
    async sendMessage(userId: string, data: SendMessageType): Promise<IMessage> {
    const { conversationId, text } = data;

    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new HttpError(400, 'Invalid conversation ID');
    }

    const conversation = await conversationRepo.findById(conversationId);
    if (!conversation) {
        throw new HttpError(404, 'Conversation not found');
    }

    // Check if user is participant (handle both populated and non-populated)
    const isParticipant = conversation.participants.some(
        (p: any) => (p._id ? p._id.toString() : p.toString()) === userId
    );
    if (!isParticipant) {
        throw new HttpError(403, 'Access denied');
    }

    // find receiver (handle both populated and non-populated)
    const receiverId = conversation.participants
        .find((p: any) => (p._id ? p._id.toString() : p.toString()) !== userId);
    
    const receiverIdString = receiverId?._id ? receiverId._id.toString() : receiverId?.toString();

    if (!receiverIdString) {
        throw new HttpError(400, 'Receiver not found');
    }

    // create message
    const message = await messageRepo.create({
        conversationId,
        senderId: userId,
        receiverId: receiverIdString,
        text,
        type: 'text',
        status: 'sent',
    });

    await conversationRepo.updateLastMessage(conversationId, {
        text,
        senderId: userId,
        timestamp: new Date(),
    });

    await conversationRepo.incrementUnreadCount(conversationId, receiverIdString);

    return message;
  }


    async getMessages(conversationId: string, userId: string, page: number = 1, size: number = 50) {
    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new HttpError(400, 'Invalid conversation ID');
    }

    // Get conversation
    const conversation = await conversationRepo.findById(conversationId);
    if (!conversation) {
        throw new HttpError(404, 'Conversation not found');
    }

    // Verify user is a participant (handle populated participants)
    const isParticipant = conversation.participants.some(
        (p: any) => (p._id ? p._id.toString() : p.toString()) === userId
    );
    if (!isParticipant) {
        throw new HttpError(403, 'Access denied');
    }

    const { messages, total } = await messageRepo.findByConversationId(conversationId, page, size);

    await messageRepo.markAsRead(conversationId, userId);

    await conversationRepo.resetUnreadCount(conversationId, userId);

    return {
        messages,
        total,
        page,
        size,
        totalPages: Math.ceil(total / size),
    };
}


  async deleteMessage(messageId: string, userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      throw new HttpError(400, 'Invalid message ID');
    }

    const message = await messageRepo.findById(messageId);
    if (!message) {
      throw new HttpError(404, 'Message not found');
    }

    if (message.senderId.toString() !== userId) {
      throw new HttpError(403, 'Access denied');
    }

    await messageRepo.delete(messageId);
  }

  async markAsDelivered(conversationId: string, userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new HttpError(400, 'Invalid conversation ID');
    }

    await messageRepo.markAsDelivered(conversationId, userId);
  }

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      throw new HttpError(400, 'Invalid conversation ID');
    }

    await messageRepo.markAsRead(conversationId, userId);
    await conversationRepo.resetUnreadCount(conversationId, userId);
  }
}