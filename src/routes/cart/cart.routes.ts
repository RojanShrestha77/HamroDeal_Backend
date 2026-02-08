import { Router } from "express";
import { CartController } from "../../controllers/cart/cart.controller";
import { authorizedMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();
const cartController = new CartController();

router.use(authorizedMiddleware);

router.post("/", cartController.addToCart.bind(cartController));
router.get("/", cartController.getCart.bind(cartController));
router.put("/:productId", cartController.updateCartItem.bind(cartController));
router.delete("/:productId", cartController.removeFromCart.bind(cartController));
router.delete("/clear/all", cartController.clearCart.bind(cartController));

export default router;