import { Request, Response,NextFunction } from "express";
import { IUser } from "../models/user.model";
import { UserRepository } from "../repositories/user.repositories";
import jwt from 'jsonwebtoken';
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../configs";

declare global {
    namespace Express {
        interface Request {
            user?: Record < string, any> | IUser
        }
    }
} // addingtag(user) to request, can use req.user
let userRepository = new UserRepository();


export const authorizedMiddleware = 
async(req: Request, res: Response, next: NextFunction) => {
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith('Bearer'))  // ✅ Added !
            throw new HttpError(401, 'Unauhtorized JWT Invalid');
        const token = authHeader.split(' ')[1]  // ✅ Changed '' to ' '
        const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>;
        if(!decodedToken || !decodedToken.id){  // ✅ Also add ! here
            throw new HttpError(401, "Unauthorized JWT Unverified");
        }
        const user = await userRepository.getUserByID(decodedToken.id);
        if(!user) throw new HttpError(401, 'unauthorized user not found');
        req.user = user;
        next();

    }catch(err: Error | any){
        return res.status(err.statusCode || 500).json(
            {success: false, message: err.message}
        )
    }
}
export const adminMiddleware = async(
    req: Request, res: Response, next: NextFunction
) => {
    try{
        if(!req.user) {
            throw new HttpError(401, "Unauthorized no user info");

        }
        if(req.user.role !== 'admin'){
            throw new HttpError(403, 'Forbidden not admin');

        }
        return next();

    }catch(error: Error | any) {
        return res.status(error.statusCode || 500).json(
            { success: false, message: error.message}

        )
    }
}

export const approvedSellerMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        if(!req.user){
            throw new HttpError(401, "unauthorized: No user info");
        }

        if( req.user.role !=="seller"){
            throw new HttpError(403, "Forbidden Seller access required");

        }

        if(!req.user.isApproved){
            throw new HttpError(403, "Your seller account is pending approval")

        }
        next();
    } catch(error: Error | any) {
        return res.status(error.statusCode || 500).json(
            { success: false, message: error.message}

        )
    }
}

        
