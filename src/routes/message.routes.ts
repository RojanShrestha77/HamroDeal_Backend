import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const messageController = new MessageController();

router.use(authorizedMiddleware);

router.post("/", messageController.sendMessage);

router.get("/conversation/:conversationId", messageController.getMessages);

router.delete("/:id", messageController.deleteMessages);

router.patch("/conversation/:id/read", messageController.markAsRead);

export default router;
