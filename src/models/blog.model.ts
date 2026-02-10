import mongoose, {Document, Schema} from "mongoose";
import { BlogType } from "../types/blog.type";

export interface IBlog extends Omit<BlogType, "authorId">, Document {
    authorId: mongoose.Types.ObjectId | string;
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
const schema = new Schema<IBlog> (
    {
        title: {type: String, required: true},
        content: {type: String, required: true},
        authorId: {type: Schema.Types.ObjectId, ref: "User", required: true},

    },
    {
        timestamps: true,
    }
);

export const BlogModel = mongoose.model<IBlog>("Blog", schema);