import mongoose from "mongoose";
import { IMessage, MessageModel } from "../models/message.model";

export interface IMessageRepository {
    create(message: {
        conversationId: string,
        senderId: string,
        receiverId: string,
        text: string,
        type?: 'text'|'image'|'file';
        status?: 'sent'|'delivered'|'read';
    }): Promise<IMessage>;
    findById(id: string): Promise<IMessage | null>;
    findByConversationId(conversationId: string, page: number, size: number): Promise<{messages: IMessage[], total : number}>;
    updateStatus(id: string, status: 'delivered' | 'read'): Promise<IMessage | null>;
    markAsDelivered(conversationId: string, receiverId: string): Promise<number>;
    markAsRead(conversationId: string, receiverId: string): Promise<number>;
    delete(id: string): Promise<IMessage | null>;
    deleteByConversationId(conversationId: string): Promise<number>;


}

export class MessageRepository implements IMessageRepository {
    async create(message: {
    conversationId: string;
    senderId: string;
    receiverId: string;
    text: string;
    type?: "text" | "image" | "file";
    status?: "sent" | "delivered" | "read";
}): Promise<IMessage> {
    const newMessage = await MessageModel.create({
        conversationId: new mongoose.Types.ObjectId(message.conversationId),
        senderId: new mongoose.Types.ObjectId(message.senderId),
        receiverId: new mongoose.Types.ObjectId(message.receiverId),
        text: message.text,
        type: message.type || 'text',
        status: message.status || 'sent',
    });

    return await newMessage.populate([
        { path: 'senderId', select: 'firstName lastName email imageUrl' },
        { path: 'receiverId', select: 'firstName lastName email imageUrl' },
    ]);
}

    
    async findById(id: string): Promise<IMessage | null> {
        return await MessageModel.findById(id)
        .populate('senderId', 'firstName lastName email imageUrl')
        .populate('receiverId', 'firstName lastName email imageUrl')
        .exec();
    }
    async findByConversationId(conversationId: string, page: number, size: number): Promise<{ messages: IMessage[]; total: number; }> {
        const skip = (page - 1)  * size;

        const messages = await MessageModel.find({
            conversationId: new mongoose.Types.ObjectId(conversationId),
        })
        .populate('senderId', 'firstName lastName email imageUrl')
        .populate('receiverId', 'firstName lastName email imageUrl')
        .sort({ createdAt: -1})
        .skip(skip)
        .limit(size)
        .exec();

        const total = await MessageModel.countDocuments({
            conversationId: new mongoose.Types.ObjectId(conversationId),
        });

        return { messages: messages.reverse(), total};
    }
    async updateStatus(id: string, status: "delivered" | "read"): Promise<IMessage | null> {
        return await MessageModel.findByIdAndUpdate(
            id,
            { status },
            { new: true}
        )
        .populate('senderId', 'firstName lastName email imageUrl')
        .populate('receiverId', 'firstName lastName email imageUrl')
        .exec();
    }
    async markAsDelivered(conversationId: string, receiverId: string): Promise<number> {
        const result = await MessageModel.updateMany(
            {
                conversationId: new mongoose.Types.ObjectId(conversationId),
                receiverId: new mongoose.Types.ObjectId(receiverId),
                status: 'sent',
            },
            {status: 'delivered'}
        );
        return result.modifiedCount;
    }
    async markAsRead(conversationId: string, receiverId: string): Promise<number> {
        const result = await MessageModel.updateMany(
            {
                conversationId: new mongoose.Types.ObjectId(conversationId),
                receiverId: new mongoose.Types.ObjectId(receiverId),
                status: {$ne: 'read'},
            },
            { status: 'read'}
        );
        return result.modifiedCount;
    }
    async delete(id: string): Promise<IMessage | null> {
        return await MessageModel.findByIdAndDelete(id).exec();
    }
    async deleteByConversationId(conversationId: string): Promise<number> {
        const result = await MessageModel.deleteMany({
            conversationId: new mongoose.Types.ObjectId(conversationId),
        });

        return result.deletedCount;
    }

}