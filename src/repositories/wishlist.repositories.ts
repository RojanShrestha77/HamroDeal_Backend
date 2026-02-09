import mongoose from "mongoose";
import { IWishlist, WishlistModel } from "../models/wishlist.model";

export interface IWishListRepository {
  getWishlistByUserId(userId: string): Promise<IWishlist | null>;
  createWishlist(userId: string): Promise<IWishlist>;
  addProductToWishlist(
    userId: string,
    productId: string
  ): Promise<IWishlist | null>;
  removeProductFromWishlist(
    userId: string,
    productId: string
  ): Promise<IWishlist | null>;
  clearWishlist(userId: string): Promise<IWishlist | null>;
  isProductInWishlist(userId: string, productId: string): Promise<boolean>;
}

export class WishListRepository implements IWishListRepository {
  getWishlistByUserId(userId: string): Promise<IWishlist | null> {
    const _userId = new mongoose.Types.ObjectId(userId);

    return WishlistModel.findOne({ userId: _userId })
      .populate("items.productId")
      .exec();
  }
 

  async createWishlist(userId: string): Promise<IWishlist> {
    const wishlist = new WishlistModel({
      userId: new mongoose.Types.ObjectId(userId),
      items: [],
    });

    return wishlist.save();
  }

  async addProductToWishlist(
    userId: string,
    productId: string
  ): Promise<IWishlist | null> {
    const _userId = new mongoose.Types.ObjectId(userId);
    const _productId = new mongoose.Types.ObjectId(productId);

    const existingWishlist = await WishlistModel.findOne({
            userId,
            'items.productId': productId,
        });

        if (existingWishlist) {
            // Product already in wishlist, just return it
            return await WishlistModel.findOne({ userId })
                .populate('items.productId')
                .exec();
        }

        // Add new product with current timestamp
        return await WishlistModel.findOneAndUpdate(
            { userId },
            { 
                $push: { 
                    items: { 
                        productId, 
                        addedAt: new Date() 
                    } 
                } 
            },
            { new: true, upsert: true }
        ).populate('items.productId');
    }


  async removeProductFromWishlist(
    userId: string,
    productId: string
  ): Promise<IWishlist | null> {
    const _userId = new mongoose.Types.ObjectId(userId);
    const _productId = new mongoose.Types.ObjectId(productId);

    return WishlistModel.findOneAndUpdate(
      { userId: _userId },
      { $pull: { items: { productId: _productId } } },
      { new: true }
    )
      .populate("items.productId")
      .exec();
  }

  async clearWishlist(userId: string): Promise<IWishlist | null> {
    const _userId = new mongoose.Types.ObjectId(userId);

    return await WishlistModel.findOneAndUpdate(
            { userId },
            { $set: { items: [] } },
            { new: true }
        );
    }


  async isProductInWishlist(userId: string, productId: string): Promise<boolean> {
    const wishlist = await WishlistModel.findOne({
            userId,
            'items.productId': productId,
        });
        return !!wishlist;
    }
}
