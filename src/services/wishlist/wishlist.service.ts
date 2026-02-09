import { HttpError } from "../../errors/http-error";
import { IWishlist } from "../../models/wishlist.model";
import { IUser } from "../../models/user.model";
import { ProductRepository } from "../../repositories/product.repositories";
import { WishlistResponse } from "../../types/wishlist.type";
import { AddToWishlistDto } from "../../dtos/wishlist.dto";
import { WishlistRepository } from "../../repositories/wishlist.repositories";

const wishlistRepository = new WishlistRepository();
const productRepository = new ProductRepository();

export class WishlistService {
    private formatWishlistResponse(wishlist: IWishlist): WishlistResponse {
        return {
            _id: wishlist._id.toString(),
            userId: wishlist.userId.toString(),
            items: wishlist.items.map((item: any) => ({
                productId: item.productId,
                addedAt: item.addedAt,
            })),
            itemCount: wishlist.items.length,
            createdAt: wishlist.createdAt,
            updatedAt: wishlist.updatedAt,
        };
    }

    async getWishlist(user: IUser): Promise<WishlistResponse> {
        let wishlist = await wishlistRepository.getWishlistByUserId(
            user._id.toString()
        );

        if (!wishlist) {
            wishlist = await wishlistRepository.createWishlist(
                user._id.toString()
            );
        }

        return this.formatWishlistResponse(wishlist);
    }

    async addToWishlist(
        user: IUser,
        wishlistData: AddToWishlistDto
    ): Promise<WishlistResponse> {
        const { productId } = wishlistData;

        // Check if product exists
        const product = await productRepository.getProductById(productId);

        if (!product) {
            throw new HttpError(404, "Product not found");
        }

        const wishlist = await wishlistRepository.addProductToWishlist(
            user._id.toString(),
            productId
        );

        if (!wishlist) {
            throw new HttpError(500, "Failed to add to wishlist");
        }

        return this.formatWishlistResponse(wishlist);
    }

    async removeFromWishlist(
        user: IUser,
        productId: string
    ): Promise<WishlistResponse> {
        const wishlist = await wishlistRepository.removeProductFromWishlist(
            user._id.toString(),
            productId
        );

        if (!wishlist) {
            throw new HttpError(404, "Wishlist not found");
        }

        return this.formatWishlistResponse(wishlist);
    }

    async clearWishlist(user: IUser): Promise<WishlistResponse> {
        const wishlist = await wishlistRepository.clearWishlist(
            user._id.toString()
        );

        if (!wishlist) {
            throw new HttpError(404, "Wishlist not found");
        }

        return this.formatWishlistResponse(wishlist);
    }

    async isInWishlist(user: IUser, productId: string): Promise<boolean> {
        return await wishlistRepository.isProductInWishlist(
            user._id.toString(),
            productId
        );
    }
}
