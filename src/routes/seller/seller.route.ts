import { Router } from "express";
import { SellerController } from "../../controllers/seller/seller.controller";

let sellerController = new SellerController();

const router = Router();

router.post("/",sellerController.createSeller);
export default router;
