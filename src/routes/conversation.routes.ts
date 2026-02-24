import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const conversationController = new ConversationController();

// All conversation routes require authentication
router.use(authorizedMiddleware);

// Create or get conversation with another user
router.post("/", conversationController.createOrGetConversation);

// Get all conversations for current user
router.get("/", conversationController.getUserConversations);

// Get specific conversation by ID
router.get("/:id", conversationController.getConversationById);

// Delete conversation
router.delete("/:id", conversationController.deleteConversation);

// Reset unread count for a conversation
router.patch("/:id/read", conversationController.resetUnreadCount);

export default router;
