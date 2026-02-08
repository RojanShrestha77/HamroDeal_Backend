import { Router } from "express";
import { ProductUserController } from "../controllers/product.controller";
import { uploads } from "../middlewares/upload.middleware";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const productController = new ProductUserController();

// ============================================
// PUBLIC ROUTES (anyone can access)
// ============================================
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/category", productController.getProductByCategory);

// ============================================
// PROTECTED ROUTES (require authentication)
// ============================================
router.get("/my-products", authorizedMiddleware, productController.getMyProducts);
router.post("/", authorizedMiddleware, uploads.single('images'), productController.createProduct);
router.put("/:id", authorizedMiddleware, uploads.single('images'), productController.updateProduct);
router.delete("/:id", authorizedMiddleware, productController.deleteProduct);

// ============================================
// DYNAMIC ROUTE - MUST BE LAST
// Public: anyone can view a product
// ============================================
router.get("/:id", productController.getOneProduct);

export default router;
