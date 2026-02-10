import mongoose, { Schema, Document } from "mongoose";


// cart interm interface
export interface ICartItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price:  number;
    
}

// cart interface
export interface ICart extends Document {
    _id: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    items: ICartItem[];
    createdAt: Date;
    updatedAt: Date;
}

// cart item schema
const CartItemSchema = new Schema<ICartItem>({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,

    },
}, {_id: false});

// cart schema
const CartSchema = new Schema<ICart>(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },
        items: {
            type: [CartItemSchema],
            default: [],
        }
    },
    {
        timestamps: true,
    }
);

// indexinf for faster wuereis
CartSchema.index({ userId: 1});

export const CartModel = mongoose.model<ICart>("Cart", CartSchema)
