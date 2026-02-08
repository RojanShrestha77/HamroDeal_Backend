import { Request, Response } from "express";
import { AdminUserService } from "../../services/admin/user.service";
import { CreateUserDto, UpdateUserDto,  } from "../../dtos/user.dto";
import z, { success } from "zod";
import { ca } from "zod/v4/locales";

let adminUserService = new AdminUserService();

export class AdminUserController {
    async createUser(req: Request, res: Response){
        try{
            const payload = { ...req.body};
            const filename = req.file?.filename;

            if(req.file) {
                payload.imageUrl = `/uploads/${filename}`
            }
            // const parsedData = CreateUserDto.safeParse(req.body);
            const parsedData = CreateUserDto.safeParse(payload);
            if(!parsedData.success){
                return res.status(400).json(
                    {success:false, message:z.prettifyError(parsedData.error)}
                )
            }
            const newUser = await adminUserService.createUser(parsedData.data);
            return res.status(200).json({success: true, message:'Register Successful', data: newUser})

        } catch(error : Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || "Internal Server Error"
            })
        

        }

    }

    async getOneUser( req: Request, res: Response){
        try{
            const userId = req.params.id; //eg: /api/admmin/users/:id
            const user = await adminUserService.getOneUser(userId);
            return res.status(200).json({
                success: true, message: "User Successfully fetched", data: user
            })
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || "Internal Server Error"
            })
        }
    }

    async getAllUser(req: Request, res: Response){
        try{
            const user = await adminUserService.getAllUsers();
            return res.status(200).json({
                success: true, message:'All Users Sucessfully fetched', data: user
            })

        } catch(error: Error | any){
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || 'Internal Server Error'
            })

        }
    }

    async deleteOneUser(req: Request, res: Response){
        try{
            const userId = req.params.id;
            const user = await adminUserService.deleteOneUser(userId);
            res.status(200).json({
                success: true, message: 'Users has been deleted', data: user
            })
        } catch (error: Error | any){
            return res.status(error.statusCode || 500).json({
                success: true, message: error.message || 'Internal Server Error'
            })
        }
    }

    async updateOneUser( req: Request, res: Response){
        try{
            const payload = { ...req.body}
            const userId = req.params.id;
            const filename = req.file?.filename;
            if(filename){
                payload.imageUrl = `/uploads/${filename}`
            }
            const parsedData = UpdateUserDto.safeParse(payload);
            if(!parsedData.success){
                return res.status(400).json(
                    {success:false, message:z.prettifyError(parsedData.error)}
                )
            }
            const updatedUser = await adminUserService.updateOneUser(userId, parsedData.data);
            return res.status(200).json({
                success: true, message:"User has been Updated", data: updatedUser
            })

        } catch(error : Error | any) {
            return res.status( error.statusCode || 500).json({
                success: false, message: error.message || "Internal Server Error"
            })

        }
    }

    async approvedSeller(req: Request, res: Response){
        try {
            const userId = req.params.id;

            const updatedSeller = await adminUserService.approvedSeller(userId);
            res.status(200).json({
                success: true, message: 'Seller Approved', data: updatedSeller,
            })

        } catch(error: Error | any){
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message || 'Internal Server Error'
            })
        }
    }
}