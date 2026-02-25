import { ConversationRepository, IConversationRepository } from "../repositories/conversation.repository";
import { IConversation } from "../models/conversation.model";
import mongoose from "mongoose";
import { HttpError } from "../errors/http-error";

const conversationRepo: IConversationRepository = new ConversationRepository();

export class ConversationService {
    async createOrGetConversation(userId: string, otherUserId: string): Promise<IConversation> {
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
            throw new HttpError(400, 'Invalid user ID');
        }

        if (userId === otherUserId) {
            throw new HttpError(400, 'Cannot create convesation with yourself');
        }

        const existingConversation = await conversationRepo.findByParticipants(userId, otherUserId);
        if (existingConversation) {
            return existingConversation;
        }

        // create new convo
        const conversation = await conversationRepo.create([userId, otherUserId]);
        return conversation;
    }

    async getConversationById(conversationId: string, userId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
        throw new HttpError(400, 'Invalid conversation ID');
    }

    const conversation = await conversationRepo.findById(conversationId);
    if (!conversation) {
        throw new HttpError(404, 'Conversation not found');
    }

    // verify user is participant
    const isParticipant = conversation.participants.some(
        (p: any) => (p._id ? p._id.toString() : p.toString()) === userId
    );
    if (!isParticipant) {
        throw new HttpError(403, 'Access denied');
    }

    // Format response to match getUserConversations format
    const otherUser = conversation.participants.find(
        (p: any) => (p._id ? p._id.toString() : p.toString()) !== userId
    );

    return {
        _id: conversation._id,
        otherUser: otherUser,
        lastMessage: conversation.lastMessage,
        unreadCount: conversation.unreadCount.get(userId) || 0,
        createdAt: conversation.createdAt,
        updatedAt: conversation.updatedAt,
    };
    }
 


    async getUserConversations(userId: string, page: number = 1, size: number = 20) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new HttpError(400, 'Invalid user ID');
        }

        const { conversations, total } = await conversationRepo.findByUserId(userId, page, size);

        const formattedConversations = conversations.map((conv) => {
            const otherUser = conv.participants.find(
                (p: any) => p._id.toString() != userId
            );

            return {
                _id: conv._id,
                otherUser: otherUser,
                lastMessage: conv.lastMessage,
                unreadCount: conv.unreadCount.get(userId) || 0,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt,
            }
        });

        return {
            conversations: formattedConversations,
            total,
            page,
            size,
            totalPages: Math.ceil(total / size),
        };
    }

    async deleteConversation(conversationId: string, userId: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            throw new HttpError(400, 'Invalid conversation ID')
        }

        const conversation = await conversationRepo.findById(conversationId);

        if (!conversation) {
            throw new HttpError(404, 'Conversation not found');
        }

        const isParticipant = conversation.participants.some(
            (p) => p.toString() === userId
        );
        if (!isParticipant) {
            throw new HttpError(403, 'Access denied');
        }

        await conversationRepo.delete(conversationId);
    }

    async resetUnreadCount(conversationId: string, userId: string): Promise<void> {
        if (!mongoose.Types.ObjectId.isValid(conversationId)) {
            throw new HttpError(400, 'Invalid conversation ID');
        }

        const conversation = await conversationRepo.findById(conversationId);

        if (!conversation) {
            throw new HttpError(404, 'Conversation not found');
        }

        const isParticipant = conversation.participants.some(
            (p) => p.toString() === userId
        );
        if (!isParticipant) {
            throw new HttpError(403, 'Access denied');
        }

        await conversationRepo.resetUnreadCount(conversationId, userId);

    }
}