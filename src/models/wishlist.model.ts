import mongoose, { Schema, Document } from "mongoose";

// Wishlist item interface
export interface IWishlistItem {
    productId: mongoose.Types.ObjectId;
    addedAt: Date;
}

// Wishlist interface
export interface IWishlist extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    items: IWishlistItem[];
    createdAt: Date;
    updatedAt: Date;
}

// Wishlist item schema
const WishlistItemSchema = new Schema<IWishlistItem>({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

// Wishlist schema
const WishlistSchema = new Schema<IWishlist>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true, // One wishlist per user
        },
        items: {
            type: [WishlistItemSchema],
            default: [],
        },
    },
    {
        timestamps: true,
    }
);

// Indexing for faster queries
WishlistSchema.index({ userId: 1 });

export const WishlistModel = mongoose.model<IWishlist>("Wishlist", WishlistSchema);
