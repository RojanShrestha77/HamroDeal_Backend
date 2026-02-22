import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();
const reviewController = new ReviewController();

router.get("/product/:productId", reviewController.getProductReviews);

// Protected routes 
router.use(authorizedMiddleware);

router.post("/product/:productId", reviewController.createReview);
router.get("/my-reviews", reviewController.getUserReviews);
router.patch("/:id", reviewController.updateReview);
router.delete("/:id", reviewController.deleteReview);

export default router;
