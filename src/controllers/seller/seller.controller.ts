import z, { success } from "zod";
import { CreateUserDto } from "../../dtos/user.dto";
import { SellerService } from "../../services/seller/seller.service";
import { Request, Response } from "express";

let sellerService  = new SellerService();

export class SellerController {
    async createSeller(req: Request, res: Response){
        try{
            const parsedData = CreateUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json({
                    success: false,  message:z.prettifyError(parsedData.error)
                })
            }
            const newSeller = await sellerService.createSeller(parsedData.data);
            return res.status(200).json({success: true, message:'Register Successful', data: newSeller})

        }catch(error : Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || "Internal Server Error"
            }
        )

        }

    }
}