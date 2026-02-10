import { Router } from "express";
import { BlogController } from "../controllers/blog.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const blogController = new BlogController();

router.post("/", authorizedMiddleware, blogController.createBlog)

router.get("/", blogController.getAllBlog)

router.get("/:id", blogController.getOneBlog)

router.put("/:id", authorizedMiddleware, blogController.updateBlog)

export default router;