import { Request, Response } from "express";
import { WishlistService } from "../../services/wishlist/wishlist.service";
import { IUser } from "../../models/user.model";
import { AddToWishlistDto } from "../../dtos/wishlist.dto";
import z from "zod";

const wishlistService = new WishlistService();

export class WishlistController {
    async getWishlist(req: Request, res: Response) {
        try {
            const user = req.user as IUser;

            const wishlist = await wishlistService.getWishlist(user);

             return res.status(200).json({
                success: true,
                message: "Wishlist retrieved successfully",
                data: wishlist,
            });
        } catch (error: Error | any) {
            console.error("Error in getWishlist:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async addToWishlist( req: Request, res: Response) {
        try {
            const user = req.user as IUser;

            const parsedData = AddToWishlistDto.safeParse(req.body);

            if(!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error),
                });
            }

            const wishlist = await wishlistService.addToWishlist(
                user,
                parsedData.data
            );

             return res.status(200).json({
                success: true,
                message: "Product added to wishlist successfully",
                data: wishlist,
            });
        } catch (error: Error | any) {
            console.error("Error in addToWishlist:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async removeFromWishlist(req: Request, res: Response) {
        try {
            const user = req.user as IUser;
            const {productId} = req.params;

            if(typeof productId !== "string") {
                return res.status(400).json( {
                    success: false,
                    message: "Invalid porduct ID"
                });
            }

            const wishlist = await wishlistService.removeFromWishlist(
                user, 
                productId
            );
            return res.status(200).json({
                success: true,
                message: "Product removed from wishlist successfully",
                data: wishlist,
            });
        } catch (error: Error | any) {
            console.error("Error in removeFromWishlist:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    async clearWishlist ( req: Request, res: Response) {
        try {
            const user = req.user as IUser;

            const wishlist = await wishlistService.clearWishlist(user);

            return res.status(200).json({
                 success: true,
                message: "Wishlist cleared successfully",
                data: wishlist,
            })
        }catch (error: Error | any) {
            console.error("Error in clearWishlist:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }

    }
}