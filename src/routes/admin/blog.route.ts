import { Router } from "express";
import { BlogController } from "../../controllers/blog.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const blogController = new BlogController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/", blogController.getAllBlog);
router.get("/:id", blogController.getOneBlog);
router.delete("/:id", blogController.deleteOneBlog);

export default router;