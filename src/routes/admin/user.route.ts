import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized.middleware";
import { uploads } from "../../middlewares/upload.middleware";

let adminUserController = new AdminUserController();

const router = Router();

router.use(authorizedMiddleware);
router.use(adminMiddleware);
router.post("/",uploads.single('image'), adminUserController.createUser);
router.get("/:id", adminUserController.getOneUser);
router.get("/", adminUserController.getAllUser);
router.delete("/:id", adminUserController.deleteOneUser);
router.put("/:id",uploads.single('image'), adminUserController.updateOneUser);
router.patch("/:id/approve-seller", adminUserController.approvedSeller);
export default router;
