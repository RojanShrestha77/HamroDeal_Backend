import mongoose from "mongoose";
import { IMessage } from "../models/message.model";
import { ConversationRepository, IConversationRepository } from "../repositories/conversation.repository";
import { IMessageRepository, MessageRepository } from "../repositories/message.repository";
import { SendMessageType } from "../types/message.type";
import { HttpError } from "../errors/http-error";

const messageRepo : IMessageRepository = new MessageRepository();
const conversationRepo : IConversationRepository = new ConversationRepository();

export class MessageService {
    async sendMessage(userId: string, data: SendMessageType) : Promise<IMessage> {
        const { conversationId, text} = data;

        // validate dto
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            throw new HttpError(400, 'Invalid conversation ID');
        }

        // get conversation
        const conversation = await conversationRepo.findById(conversationId);
        if(!conversation) {
            throw new HttpError(404, 'Conversation not found');
        }

        const isParticipant = conversation.participants.some(
            (p) => p.toString() === userId
        );
        if (!isParticipant) {
            throw new HttpError(403, 'Access denied');
        }

        // find receiver
        const receiverId = conversation.participants.find(
            (p) => p.toString() !== userId
        )?.toString();

        if (!receiverId) {
            throw new HttpError(400, 'Receiver not found');
        }

        // create message
        const message = await messageRepo.create({
            conversationId,
            senderId: userId,
            receiverId,
            text,
            type: 'text',
            status: 'sent',
        });

        await conversationRepo.updateLastMessage(conversationId, {
            text,
            senderId: userId,
            timestamp: new Date(),
        });

        await conversationRepo.incrementUnreadCount(conversationId, receiverId);

        return message;

        
    }
}