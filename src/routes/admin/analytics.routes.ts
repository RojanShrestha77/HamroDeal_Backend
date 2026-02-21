import { Router } from "express";
import { AdminAnalyticsController } from "../../controllers/admin/analytics.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";

let adminAnalyticsController = new AdminAnalyticsController();

const router = Router();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

router.get("/overview", adminAnalyticsController.getOverview);
router.get("/revenue", adminAnalyticsController.getRevenue);
router.get("/top-products", adminAnalyticsController.getTopProducts);
router.get("/recent-orders", adminAnalyticsController.getRecentOrders);
router.get("/low-stock", adminAnalyticsController.getLowStock);
router.get("/top-sellers", adminAnalyticsController.getTopSellers);

export default router;
