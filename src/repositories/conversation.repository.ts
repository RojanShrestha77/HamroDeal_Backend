import mongoose from "mongoose";
import { ConversationModel, IConversation } from "../models/conversation.model";

export interface IConversationRepository {
    create(participants: string[]): Promise<IConversation>;
    findById(id: string): Promise<IConversation | null>;
    findByParticipants(userId1: string, userId2: string): Promise<IConversation | null>;
    findByUserId(userId: string, page: number, size: number): Promise<{ conversations: IConversation[], total: number }>;
    updateLastMessage(id: string, lastMessage: {text: string, senderId: string, timestamp: Date}): Promise<IConversation | null>;
    incrementUnreadCount(id: string, userId: string): Promise<IConversation | null>;
    resetUnreadCount(id: string, userId: string): Promise<IConversation | null>;
    delete(id: string): Promise<IConversation | null>;
}

export class ConversationRepository implements IConversationRepository {
    async create(participants: string[]): Promise<IConversation> {
        // sorrting the paticipatns for the conistency
        const sortedParticipants = participants.map(id => new mongoose.Types.ObjectId(id)).sort((a, b) => a.toString().localeCompare(b.toString()));

        const conversation = await ConversationModel.create({
            participants: sortedParticipants,
            unreadCount: {
                [participants[0]]: 0,
                [participants[1]]: 0,
            }
        });

        return conversation;
    }
    async findById(id: string): Promise<IConversation | null> {
        return await ConversationModel.findById(id).populate('participants', 'firstName lastName email imageUrl').exec();
    }
    async findByParticipants(userId1: string, userId2: string): Promise<IConversation | null> {
        const participants = [
            new mongoose.Types.ObjectId(userId1),
            new mongoose.Types.ObjectId(userId2),
        ].sort((a, b) => a.toString().localeCompare(b.toString()));

        return await ConversationModel.findOne({ participants }).populate('participants', 'firstName lastName email imageUrl').exec();
    }

    async findByUserId(userId: string, page: number, size: number): Promise<{ conversations: IConversation[]; total: number; }> {
        const skip = (page - 1) * size;

        const conversations = await ConversationModel.find({
            participants: new mongoose.Types.ObjectId(userId),
        })
        .populate('participants', 'firstName lastName email imageUrl')
        .sort({ updatedAt: -1})
        .skip(skip)
        .limit(size)
        .exec();

        const total = await ConversationModel.countDocuments({
            participants: new mongoose.Types.ObjectId(userId),
        });

        return { conversations, total};
    }
    async updateLastMessage(id: string, lastMessage: { text: string; senderId: string; timestamp: Date; }): Promise<IConversation | null> {
        return await ConversationModel.findByIdAndUpdate(
            id,
            {
                lastMessage: {
                    text: lastMessage.text,
                    senderId: new mongoose.Types.ObjectId(lastMessage.senderId),
                    timestamp: lastMessage.timestamp,
                }
            },
            { new: true}
        )
        .populate('participants', 'firstName lastName email imageurl')
        .exec();
    }

    async incrementUnreadCount(id: string, userId: string): Promise<IConversation | null> {
        return await ConversationModel.findByIdAndUpdate(
            id,
            {$inc: {[`unreadCount.${userId}`]: 1}},
            { new:true}
        )
        .populate('participants', 'firstName lastName email imageUrl')
        .exec();
    }
    async resetUnreadCount(id: string, userId: string): Promise<IConversation | null> {
        return await ConversationModel.findByIdAndUpdate(
            id,
            {[`unreadCount.${userId}`]: 0},
            { new: true}
        )
        .populate('participants', 'firstName lastName email imageUrl')
        .exec();
    }
    async delete(id: string): Promise<IConversation | null> {
        return await ConversationModel.findByIdAndDelete(id).exec();
    }

}