import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const messageController = new MessageController();

// All message routes require authentication
router.use(authorizedMiddleware);

// Send a message
router.post("/", messageController.sendMessage);

// Get messages for a conversation
router.get("/conversation/:conversationId", messageController.getMessages);

// Delete a message
router.delete("/:id", messageController.deleteMessages);

// Mark messages as read in a conversation
router.patch("/conversation/:id/read", messageController.markAsRead);

export default router;
