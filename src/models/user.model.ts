import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/user.types";

export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userMongoSchema: Schema = new Schema(
  {
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },

    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    username: { type: String, required: true, unique: true, trim: true },

    password: { type: String, required: true },

    role: { type: String, enum: ["user", "admin", "seller"], default: "user" },
    isApproved: { type: Boolean },

    imageUrl: { type: String, required: false },
  },
  { timestamps: true }
);

userMongoSchema.pre("save", async function (this: IUser) {
  if (this.isApproved == null) {
    this.isApproved = this.role === "seller" ? false : true;
  }
});

export const UserModel = mongoose.model<IUser>("User", userMongoSchema);
