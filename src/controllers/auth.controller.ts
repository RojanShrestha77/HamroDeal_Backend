import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import z from 'zod';
import {Request, Response} from 'express';
import { UserService } from "../services/user.service";


let userService = new UserService();

export class AuthController {
    async createUser(req: Request, res: Response) {
        try {
            const parsedData = CreateUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    {success: false, message: z.prettifyError(parsedData.error)}
                )
            }
            const newUser = await userService.registerUser(parsedData.data);
            return res.status(201).json(
                {success: true,message: 'Register Successful', data: newUser }
            )
        } catch (error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success: false, message: error.message || "Internal Server Error"}
            )
        }

       
    }

    async loginUser(req: Request, res: Response){
        try{
            const parsedData = LoginUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json({success:false, message: parsedData.error});

            }
            const{ token, user} = await userService.loginUser(parsedData.data);
            return res.status(200).json({success: true, message: "LOgin Successful", data:user, token});
        } catch(error: Error | any){
            return res.status(error.statusCode || 500).json(
                {success: false, message: error.message || "Internal server error"}
            )
        }
    }
    async updatedProfile(req: Request, res: Response) {
        try {
            const userId = req.user?._id;
            const filename = req.file?.filename;
            if(!userId){
                return res.status(401).json(
                    {success: false, message: 'Unauthorized'}
                );
            }
            let parsedData = UpdateUserDto.safeParse(req.body);
            if(!parsedData.success) {
                return res.status(400).json(
                    { success: false, message: z.prettifyError(parsedData.error)}
                )
            }
            if(filename){
                parsedData.data.imageUrl = `/uploads/${filename}`;

            }

            const updatedUser = await userService.updateProfile(userId, parsedData.data);

            return res.status(200).json(
                {success: true, message: "Profile updated Successfully", data: updatedUser}
            );

        
        }
        catch(error: Error|any){
            return res.status(error.statusCode ?? 500).json(
                {success: false, message: error.message ||"Internal Server Error"}
            )
        }

    }

    async getUserById(req: Request, res:Response) {
        try {
            const userId = req.user?._id;
            if(!userId){
                return res.status(400).json(
                    { success: false, message: "User Id not Provided"}
                )
            }
            const user = await userService.getUserById(userId);
            return res.status(200).json(
                {success: true, message: "User fecthed Successfully", data: user}
            )
        }catch(error: Error | any){
            return res.status(error.statusCode || 500).json({
                success: false, message: error.message ||"Internal Server Error"
            })
        }
    }

    async updateUserById(req: Request, res: Response){
        try {
            const userId = Array.isArray(req.user?._id) ? req.user!._id[0] : req.user?._id;
            if(req.user!.role !== "admin" && req.user!._id.toString() !== userId){
                return res.status(403).json({success:false, message: 'Access Forbidden'}); 
            }
            const payload = { ...req.body};
            const filename = req.file?.filename;
            if(filename){
                payload.imageUrl = `/uploads/${filename}`;
            }
            const parsedData = UpdateUserDto.safeParse(payload);
            if(!parsedData.success){
                return res.status(400).json({
                    success: false, message: z.prettifyError(parsedData.error)
                })
            }

            const updatedUser = await userService.updateProfile(userId, parsedData.data);

            return res.status(200).json({
                success: true, message:"User Updated Succesfully", data: updatedUser
            })
        } catch(error: Error | any) {
            return res.status(error.statusCode ?? 500).json({
                success: false, message: error.message || "Internal Server Error"
            })
        }
    }

    async requestPasswordChange(req: Request, res:Response)  {
        try {
            const { email} = req.body;
            const user = await userService.sendResetPasswordEmail(email);
            return res.status(200).json(
                {
                    success: true,
                    data: user,
                    message: "Password reset email sent"
                }
            )
        }catch (error: Error | any) {
            return res.status(error.statusCode || 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            )
        }
    }

       async resetPassword(req: Request, res: Response) {
        try {

            const rawToken = req.params.token;
            const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;            
            const { newPassword } = req.body;
            await userService.resetPassword(token, newPassword);
            return res.status(200).json(
                { success: true, message: "Password has been reset successfully." }
            );
        } catch (error: Error | any) {
            return res.status(error.statusCode ?? 500).json(
                { success: false, message: error.message || "Internal Server Error" }
            );
        }
    }
}