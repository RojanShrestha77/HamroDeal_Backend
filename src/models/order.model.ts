import mongoose, { Document, Schema } from "mongoose";
import { OrderItemType, OrderType, ShippingAddressType } from "../types/order.type";

type Id = mongoose.Types.ObjectId | string;

export interface IOrderItem extends Omit<OrderItemType, "productId" | "sellerId"> {
  productId: Id;
  sellerId: Id;
  _id?: mongoose.Types.ObjectId;
}

export interface IShippingAddress extends ShippingAddressType {}

export interface IOrder extends Omit<OrderType, "userId" | "items">, Document {
  userId: Id;
  items: IOrderItem[];
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true, trim: true },
    productImage: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: false, trim: true },
    zipCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    orderNumber: { type: String, required: true, unique: true },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: IOrderItem[]) => Array.isArray(items) && items.length > 0,
        message: "Order must have at least one item",
      },
    },

    shippingAddress: { type: ShippingAddressSchema, required: true },

    paymentMethod: {
      type: String,
      enum: ["cash_on_delivery", "card", "online"],
      required: true,
    },

    subtotal: { type: Number, required: true, min: 0 },
    shippingCost: { type: Number, default: 0, min: 0 },
    tax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    notes: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

// OrderSchema.pre("save", async function (this: IOrder) {
//     if (!this.orderNumber) {
//         const count = await mongoose.model("Order").countDocuments();
//         this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
//     }
// });
OrderSchema.pre("validate", function () {
  if (!this.orderNumber) {
    const rand = new mongoose.Types.ObjectId().toString().slice(-6).toUpperCase();
    this.orderNumber = `ORD-${Date.now()}-${rand}`;
  }
});

export const OrderModel = mongoose.model<IOrder>("Order", OrderSchema);
