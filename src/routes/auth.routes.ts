import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";
import { uploads } from "../middlewares/upload.middleware";

const router = Router();

const authController = new AuthController();

router.post("/register", authController.createUser);
router.post("/login", authController.loginUser);

router.get("/whoami", authorizedMiddleware, authController.getUserById);

router.put('/update-profile', authorizedMiddleware, uploads.single('image'), authController.updatedProfile)
router.put('/:id', authorizedMiddleware, uploads.single('image'), authController.updateUserById)
router.post("/request-password-reset", authController.requestPasswordChange);
router.post("/reset-password/:token", authController.resetPassword)
export default router;
