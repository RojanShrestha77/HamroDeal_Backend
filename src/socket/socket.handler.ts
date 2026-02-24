import { success } from "zod";
import { AuthenticatedSocket } from "../middlewares/socket.middleware";
import { ConversationService } from "../services/conversation.service";
import { MessageService } from "../services/message.service";
import { Server } from "socket.io";

const messageService = new MessageService();
const conversationService = new ConversationService();

const onlineUsers = new Map<string, string>();

export const setupSocketHandlers = (io: Server) => {
    io.on("connection", (socket: AuthenticatedSocket) => {
        const userId = socket.userId;

        if(!userId) {
            socket.disconnect();
            return;
        }

        console.log(`User connected: ${userId}`);

        // add user to onlien users
        onlineUsers.set(userId, socket.id);

        // emit user online styatus to all conncetd clients
        io.emit("user_online", {userId});

        // join user ot their own room(for privagte messagin)
        socket.join(userId);

        // handle send message
        socket.on("send_message", async (data, callback) => {
            try {
                const {conversationId, text}= data;

                // save mess to database
                const message = await messageService.sendMessage(userId, {
                    conversationId,
                    text,
                });

                // get conversation to find recxevier
                const conversation = await conversationService.getConversationById(
                    conversationId,
                    userId
                );

                const receiverId = conversation.participants.find((p: any) => p.toString() !== userId)?.toString();

                if(receiverId) {
                    // send message to receiver if online
                    io.to(receiverId).emit("new_message", message);

                    // mark as deliuverd if receiver is onlin
                    if(onlineUsers.has(receiverId)) {
                        await messageService.markAsDelivered(conversationId, receiverId);

                        // notifiy sender that mess wa deliverd
                        socket.emit("message_delivered", {
                            messageId: message._id,
                            conversationId,
                        });
                    }
                }

                // send confimatio ot sender
                if(callback) {
                    callback({ success: true, message});
                }
            } catch (error: any) {
                console.error("Error sending message", error);
                if(callback) {
                    callback({ success: false, error: error.message});
                }
            }
        });
        
        // handle typin indicator
        socket.on("typing", (data) => {
            const {conversationId, receiverId} = data;

            if(receiverId && onlineUsers.has(receiverId)) {
                io.to(receiverId).emit("user_typing", {
                    conversationId,
                    userId,
                });
            }
        });

        // handle stop typeing
        socket.on("stop_typing", (data) => {
            const {conversationId, receiverId} = data;

            if(receiverId && onlineUsers.has(receiverId)) {
                io.to(receiverId).emit("user_stop_typing", {
                    conversationId,
                    userId,
                })
            }
        });

        // handle mark as read
        socket.on("mark_as_read", async (data) => {
            try {
                const { conversationId} = data;

                await messageService.markAsRead(conversationId, userId);

                const conversation = await conversationService.getConversationById(
                    conversationId,
                    userId
                );

                const otherUserId = conversation.participants.find((p: any) => p.toString() !== userId)?.toString();

                if(otherUserId && onlineUsers.has(otherUserId)) {
                    // notifiy sender that message were read
                    io.to(otherUserId).emit("messages_read", {
                        conversationId,
                        readBy: userId,
                    });
                }
            } catch (error: any) {
                console.error("Error marking as read:", error);
            }
        });

        // handle get online users
        socket.on("get_online_users", (callback) => {
            if(callback) {
                callback(Array.from(onlineUsers.keys()));
            }
        });

        // handle disconnet
        socket.on("disconnect", () => {
            console.log(`User disconnectd: ${userId}`);
            onlineUsers.delete(userId);

            // emit user offline
            io.emit("user_offline", {userId});
        });
        
    });
};

export const getOnlineUsers = () => {
    return Array.from(onlineUsers.keys());
};

export const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
}