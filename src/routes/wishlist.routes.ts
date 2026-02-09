import { Router } from "express";
import { WishlistController } from "../controllers/wishlist/wishlist.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const wishlistController = new WishlistController();

router.use(authorizedMiddleware);

router.post("/", wishlistController.addToWishlist.bind(wishlistController));
router.get("/", wishlistController.getWishlist.bind(wishlistController));
router.delete("/:productId", wishlistController.removeFromWishlist.bind(wishlistController));
router.delete("/clear/all", wishlistController.clearWishlist.bind(wishlistController));

export default router;
