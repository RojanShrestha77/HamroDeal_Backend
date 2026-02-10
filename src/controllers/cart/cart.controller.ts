import { CartService } from "../../services/cart/cart.service";
import { IUser } from "../../models/user.model";
import { AddToCartDto, UpdateCartItemDto } from "../../dtos/cart.dtos";
import { Request, Response } from "express";
import {z}  from "zod";
const cartService = new CartService();

export class CartController{

    async addToCart(req: Request, res: Response) {
        try {
            const user = req.user as IUser;

            const parsedData = AddToCartDto.safeParse(req.body);

            if(!parsedData.success) {
                return res.status(400).json({
                    success: false, 
                    message: z.prettifyError(parsedData.error),
                });
            }

            const cart = await cartService.addToCart(user, parsedData.data);

            return res.status(200).json( {
                success: true, 
                message: "Item added to cart successfully",
                data: cart,
            });
        } catch (error: Error | any) {
            console.error("Error in addTocart: ", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                messgae: error.message || "INternal server error",
            });

        }
        
    }

    async getCart(req: Request, res:Response) {
        try {
            const user = req.user as IUser;

            const cart = await cartService.getCart(user);

            return res.status(200).json({
                success: true,
                messgae: "Cart retrieved successfully",
                data: cart,
            });
        } catch (error: Error | any) {
            console.error("Error in getCart:", error);
            return res.status(error.statusCode || 500).json({
                success:false,
                message: error.message || "Internal server Error"
            });
        }
    }

    async updateCartItem(req: Request<{productId: string}>, res: Response) {
        try {
            const user = req.user as IUser;
            const {productId} = req.params;
          

            const parsedData = UpdateCartItemDto.safeParse(req.body);

            if(!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                })
            }

            const cart = await cartService.updateCartItem(
                user, 
                productId,
                parsedData.data
            );

            return res.status(200).json({
                success: true,
                message: "Cart ite updateed successfully",
                data: cart,
            });

        } catch (error: Error | any) {
            console.error("Error in updateCartItem: ", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            })
        }
    }

    // delete
    async removeFromCart(req: Request<{productId: string}>, res:Response) {
        try {
            const user = req.user as IUser;
            const {productId} = req.params;

            const cart = await cartService.removeFromCart(user, productId);

            return res.status(200).json({
                success: true,
                message: "Item remove from cart successfully",
                data: cart,
            });

        } catch (error: Error | any) {
            console.error("❌ Error in removeFromCart:", error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error",
            });
        }
    }

    // delete
    async clearCart(req: Request, res: Response) {
        try{
            const user = req.user as IUser;

            const cart = await cartService.clearCart(user);

            return res.status(200).json({
                success: true,
                message: "Cart cleared successfully",
                data: cart,
            });
        } catch (error: Error | any) {
            console.error("❌ Error in clearCart:", error);
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
        }
    }



}