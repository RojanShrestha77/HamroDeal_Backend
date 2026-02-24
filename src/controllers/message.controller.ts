import { success } from "zod";
import { MessageService } from "../services/message.service";
import { Request, Response } from "express";
import { SendMessageSchema } from "../types/message.type";
const messageService = new MessageService();

export class MessageController {
    async sendMessage(req: Request, res: Response) {
        try {
            const userId = req.user?._id.toString();
            if(!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            // validate 
            const parsedData = SendMessageSchema.safeParse(req.body);
                if(!parsedData.success) {
                    return res.status(400).json({
                        success: false,
                        message: 'validation failed',
                        errors: parsedData.error.issues,

                    });
                }

                const message = await messageService.sendMessage(userId, parsedData.data);

                return res.status(201).json({
                    success: true,
                    message: 'Message sent succesfully',
                    data: message,
                });
            
                
            
        }catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to send message'
            });
        }


    }

    async getMessages(req: Request<{conversationId: string}>, res: Response) {
        try {
            const userId = req.user?._id.toString();
            if(!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                })
            }

            const conversationId = String(req.params.conversationId);
            const page = parseInt(String(req.query.page)) || 1;
            const size = parseInt(String(req.query.size)) || 50;

            const result = await messageService.getMessages(
                conversationId,
                userId,
                page,
                size,
            );

            return res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: result,
      });

        } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to get messages',
      });
    }
    }

    async deleteMessages(req: Request<{id: string}>, res: Response) {
        try {
            const userId = req.user?._id.toString();
            if(!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const messageId  = req.params.id;

            await messageService.deleteMessage(messageId, userId);

            return res.status(200).json({
                success: true,
                message: 'Message deleted successfully',
            });
        } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to delete message',
      });
    }
    }
    
    async markAsRead(req: Request<{id: string}>, res: Response) {
        try {
            const  userId = req.user?._id.toString();
            if(!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const conversationId = req.params.id;

            await messageService.markAsRead(conversationId, userId);

            return res.status(200).json({
                success: true,
                message: 'Messages marked as read',
            })
            } catch (error: any) {
                return res.status(error.statusCode || 500).json({
                    success: false,
                    message: error.message || 'Failed to mark messages as read'
            })
        }
        
    }
        
    
}