import { ConversationService } from "../services/conversation.service";
import { Request, Response } from "express";
import { CreateConversationSchema } from "../types/conversation.type";
const conversationService = new ConversationService();

export class ConversationController {
    async createOrGetConversation(req: Request, res: Response) {
        try {
            const userId = req.user?._id.toString();
            if(!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            // validate request body
            const parsedData = CreateConversationSchema.safeParse(req.body);
            if(!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: parsedData.error.issues,
                });
            }

            const {otherUserId} = parsedData.data;

            const conversation = await conversationService.createOrGetConversation(
                userId,
                otherUserId
            );

            return res.status(200).json({
                success: true,
                message: 'Conversation retrieved successfully',
                data: conversation,
            });            
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to create conversation',
            });
        }
    }

    async getConversationById(req: Request<{id: string}>, res: Response) {
        try{
            const userId = req.user?._id.toString();
            if(!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }
            const conversationId =req.params.id;

            const conversation = await conversationService.getConversationById(
                conversationId,
                userId
            );

            return res.status(200).json({
            success: true,
            message: 'Conversation retrieved successfully',
            data: conversation,
          })
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to get conversation',
            })
        }
    }

    async getUserConversations(req: Request, res: Response) {
        try {
            const userId = req.user?._id.toString();
            if(!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized',
                });
            }

            const page = parseInt(req.query.page as string) || 1;
            const size = parseInt(req.query.size as string) || 20;

            const result = await conversationService.getUserConversations(
                userId,
                page,
                size
            );

            return res.status(200).json({
                success: true,
                message: 'Conversations retreived successfully',
                data: result,
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Failed to get conversations',
            });
        }
    }

    async deleteConversation(req: Request<{id: string}>, res: Response) {
        try  {
            const userId = req.user?._id.toString();
            if(!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthroized',
                });
            }

            const conversationId = req.params.id;

            await conversationService.deleteConversation(conversationId, userId);

            res.status(200).json({
                success: true,
                message: 'Conversation deleted successfully',
            });
        }catch(error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message ||'Failed to delete conversation',
            });
        }
    }

    async resetUnreadCount(req: Request<{id: string}>, res: Response) {
        try {
            const userId = req.user?._id.toString();
            if(!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthrorized',
                });;
            }

            const conversationId = req.params.id;

            await conversationService.resetUnreadCount(conversationId, userId);
            return res.status(200).json({
        success: true,
        message: 'Unread count reset successfully',
      });
        }catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Failed to reset unread count',
      });
    }
    }
}