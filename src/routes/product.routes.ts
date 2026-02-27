import { Router } from "express";
import { ProductUserController } from "../controllers/product.controller";
import { uploads } from "../middlewares/upload.middleware";
import { authorizedMiddleware, sellerOrAdminMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const productController = new ProductUserController();

// =================== public routes =========================
router.get("/", productController.getAllProducts);
router.get("/search", productController.searchProducts);
router.get("/category", productController.getProductByCategory);
router.get("/newest", productController.getNewestProducts);        
router.get("/trending", productController.getTrendingProducts);

// =================== seller or admin =========================
router.get("/my-products", authorizedMiddleware, sellerOrAdminMiddleware, productController.getMyProducts);
router.post("/", authorizedMiddleware, sellerOrAdminMiddleware, uploads.single('images'), productController.createProduct);
router.put("/:id", authorizedMiddleware, sellerOrAdminMiddleware, uploads.single('images'), productController.updateProduct);
router.delete("/:id", authorizedMiddleware, sellerOrAdminMiddleware, productController.deleteProduct);

// =================== dynamic routes =========================
router.get("/:id", productController.getOneProduct);

export default router;
