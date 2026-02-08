import { IUser, UserModel } from "../models/user.model";

export interface IUserREpository {
    createUser(userData: Partial<IUser>): Promise<IUser>;
    getUserByEmail(email: string): Promise<IUser | null>;

    getUserByUsername(username: string): Promise<IUser | null>;

    getUserByID(userId: string): Promise<IUser | null>;
    getAllUsers(): Promise<IUser []>;
    updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser| null>;
    deleteUser(userId: string): Promise<boolean |null>;

    
}
export class UserRepository implements IUserREpository {
    async createUser(userData: Partial<IUser> ): Promise<IUser> {
        const user = new UserModel(userData);
        await user.save();
        return user;
    }

    async getUserByEmail(email: string): Promise<IUser | null> {
        const user = await UserModel.findOne({"email": email});
        return user;    
    }

    async getUserByUsername(username: string): Promise<IUser | null> {
        const user = await UserModel.findOne ({"username": username});
        return user;

    }
    async getUserByID(userId: string): Promise<IUser | null> {
        const user = await UserModel.findById (userId);
        return user;
    }
    async getAllUsers(): Promise<IUser[]> {
        const users = await UserModel.find();
        return users;
    }
    async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser| null>{
        const updatedUser =  await UserModel.findByIdAndUpdate(userId, updateData, {new: true});
        return updatedUser;

    }
    async deleteUser(userId: string): Promise<boolean | null> {
        const user = await UserModel.findByIdAndDelete(userId);
        return user? true: false;
    }

   

}