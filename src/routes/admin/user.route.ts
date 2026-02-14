// hamro_deal_backend/backend/src/routes/admin/user.route.ts

import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";
import { uploads } from "../../middlewares/upload.middleware";

let adminUserController = new AdminUserController();

const router = Router();

router.use(authorizedMiddleware);
router.use(adminMiddleware);

// ✅ Routes ordered from most specific to least specific
router.post("/", uploads.single('image'), adminUserController.createUser);
router.get("/", adminUserController.getAllUser);
router.get("/:id/details", adminUserController.getUserDetailPage);  // Must come BEFORE /:id
router.get("/:id", adminUserController.getOneUser);
router.put("/:id", uploads.single('image'), adminUserController.updateOneUser);
router.delete("/:id", adminUserController.deleteOneUser);
router.patch("/:id/approve-seller", adminUserController.approvedSeller);

export default router;
