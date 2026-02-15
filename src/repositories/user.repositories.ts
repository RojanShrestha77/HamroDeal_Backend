import { QueryFilter } from "mongoose";
import { IUser, UserModel } from "../models/user.model";

export interface IUserREpository {
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserByEmail(email: string): Promise<IUser | null>;

    getUserByUsername(username: string): Promise<IUser | null>;

    getUserByID(userId: string): Promise<IUser | null>;
    getAllUsers({ page, size, search }: { page: number; size: number; search?: string; }): Promise<{ users: IUser[], total: number }>;
    updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
    deleteUser(userId: string): Promise<boolean | null>;


}
export class UserRepository implements IUserREpository {
    async createUser(userData: Partial<IUser>): Promise<IUser> {
        const user = new UserModel(userData);
        await user.save();
        return user;
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "email": email });
        return user;
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ "username": username });
        return user;

    }
    async getUserByID(userId: string): Promise<IUser | null> {
        const user = await UserModel.findById(userId).select('-password');
        return user;
    }

    async getAllUsers({ page, size, search }: { page: number; size: number; search?: string; }): Promise<{ users: IUser[], total: number }> {
        let filter: QueryFilter<IUser> = {};
        if (search) {
            filter = {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { username: { $regex: search, $options: 'i' } }
                ]
            };
        }

        console.log('🔍 REPOSITORY - getAllUsers params:', { page, size, search });
        console.log('🔍 REPOSITORY - Skip:', (page - 1) * size, 'Limit:', size);

        const [users, total] = await Promise.all([
            UserModel.find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * size)
                .limit(size)
                .select('-password'),
            UserModel.countDocuments(filter)

        ]);

        console.log('🔍 REPOSITORY - Found:', users.length, 'users, Total:', total);
        console.log('🔍 REPOSITORY - First user:', users[0]?.email, 'Last user:', users[users.length - 1]?.email);

        return { users, total };
    }
    async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null> {
        const updatedUser = await UserModel.findByIdAndUpdate(userId, updateData, { new: true });
        return updatedUser;

    }
    async deleteUser(userId: string): Promise<boolean | null> {
        const user = await UserModel.findByIdAndDelete(userId);
        return user ? true : false;
    }



}