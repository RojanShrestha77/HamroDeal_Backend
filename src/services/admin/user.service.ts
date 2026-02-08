import { CreateUserDto, UpdateUserDto } from "../../dtos/user.dto";
import { HttpError } from "../../errors/http-error";
import { UserRepository } from "../../repositories/user.repositories";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { IUser } from "../../models/user.model";
let userRepository = new UserRepository;

export class AdminUserService {
    async createUser(userData: CreateUserDto){
        const checkEmail = await userRepository.getUserByEmail(userData.email);
        if(checkEmail){
            throw new HttpError(409, "Email already exist");
        }

        const checkUsername = await userRepository.getUserByUsername(userData.username);
        if(checkUsername){
            throw new HttpError(404, 'user already exist');


        }
        const hashedPassword = await bcryptjs.hash(userData.password, 10);
        userData.password = hashedPassword;

        const newUser = await userRepository.createUser(userData);
        return newUser;

    }

    async getAllUsers(){
        const users = await userRepository.getAllUsers();
        return users;
    }

    async getOneUser( userId: string){
        const user = await userRepository.getUserByID(userId);
        if(!user){
            throw new HttpError(404, "User not found")
        }
        return user;
    }

    async deleteOneUser(userId: string){
        const user = await userRepository.getUserByID(userId);
        if(!user){
            throw new HttpError(404, "user not found");
        }
        const result = await userRepository.deleteUser(userId);
        if(!result){
            throw new HttpError(500, "Failed to delete user");
        }
        return result;
    }

    async updateOneUser(userId: string, updateData: UpdateUserDto){
        const user = await userRepository.getUserByID(userId);
        if(!user){
            throw new HttpError(404, "User not Found");
        }
        const updatedUser = await userRepository.updateUser(userId, updateData);
        if(!updatedUser){
            throw new HttpError(500, "Failed to update the user");

        }
        return updatedUser;
    }

    async approvedSeller(userId: string){        
        const user = await userRepository.getUserByID(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        if (user.role !== "seller") {
            throw new HttpError(400, "Only sellers can be approved");
        }

        if (user.isApproved) {
            throw new HttpError(400, "Seller is already approved");
        }

        const approveSeller = await userRepository.updateUser(userId, {
            isApproved: true   // ← Hardcoded here, in the service
        } as Partial<IUser> );
        if(!approveSeller){
            throw new HttpError(500, "Failed to approve User");
        }
        return approveSeller;
    }


}