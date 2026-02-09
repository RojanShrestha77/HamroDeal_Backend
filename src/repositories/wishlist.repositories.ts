import mongoose from "mongoose";
import { IWishlist, WishlistModel } from "../models/wishlist.model";

export class WishlistRepository {
  // Get wishlist by user ID
  async getWishlistByUserId(userId: string): Promise<IWishlist | null> {
    const _userId = new mongoose.Types.ObjectId(userId);

    return WishlistModel.findOne({ userId: _userId })
      .populate("items.productId")
      .exec();
  }

  // Create new wishlist
  async createWishlist(userId: string): Promise<IWishlist> {
    const _userId = new mongoose.Types.ObjectId(userId);
    
    const wishlist = new WishlistModel({
      userId: _userId,
      items: [],
    });

    return wishlist.save();
  }

  // Add product to wishlist
  async addProductToWishlist(
    userId: string,
    productId: string
  ): Promise<IWishlist | null> {
    const _userId = new mongoose.Types.ObjectId(userId);
    const _productId = new mongoose.Types.ObjectId(productId);

    // Check if product already exists in wishlist
    const existingWishlist = await WishlistModel.findOne({
      userId: _userId,
      'items.productId': _productId,
    });

    if (existingWishlist) {
      // Product already in wishlist, just return it with populated data
      return await WishlistModel.findOne({ userId: _userId })
        .populate('items.productId')
        .exec();
    }

    // Add new product with current timestamp
    return await WishlistModel.findOneAndUpdate(
      { userId: _userId },
      { 
        $push: { 
          items: { 
            productId: _productId, 
            addedAt: new Date() 
          } 
        } 
      },
      { new: true, upsert: true }
    ).populate('items.productId');
  }

  // Remove product from wishlist
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

  // Clear wishlist
  async clearWishlist(userId: string): Promise<IWishlist | null> {
    const _userId = new mongoose.Types.ObjectId(userId);

    return await WishlistModel.findOneAndUpdate(
      { userId: _userId },
      { $set: { items: [] } },
      { new: true }
    );
  }

  // Check if product is in wishlist
  async isProductInWishlist(
    userId: string,
    productId: string
  ): Promise<boolean> {
    const _userId = new mongoose.Types.ObjectId(userId);
    const _productId = new mongoose.Types.ObjectId(productId);

    const wishlist = await WishlistModel.findOne({
      userId: _userId,
      'items.productId': _productId,
    });
    
    return !!wishlist;
  }
}
