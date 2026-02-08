import { Router } from "express";
import { CategoryUserController } from "../controllers/category.controller";

const router = Router();

const categoryController = new CategoryUserController();

// public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// admin routes
// we will add the middleware late on
router.post("/",categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);


export default router;