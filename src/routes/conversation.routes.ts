import { Router } from "express";
import { ConversationController } from "../controllers/conversation.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const conversationController = new ConversationController();

router.use(authorizedMiddleware);

router.post("/", conversationController.createOrGetConversation);

router.get("/", conversationController.getUserConversations);

router.get("/:id", conversationController.getConversationById);

router.delete("/:id", conversationController.deleteConversation);

router.patch("/:id/read", conversationController.resetUnreadCount);

export default router;
