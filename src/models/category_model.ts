import mongoose, { Schema } from "mongoose";

const CategoryMongoSchema: Schema = new Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true, 

        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'inactive'],
            default: "active"
        }
    },
    {
        timestamps: true
    }
);

export interface ICategory extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    description: string,
    status: "active" | "inactive";
    createdAt: Date;
    updatedAt: Date;
}

export const CategoryModel = mongoose.model<ICategory>("Category", CategoryMongoSchema);