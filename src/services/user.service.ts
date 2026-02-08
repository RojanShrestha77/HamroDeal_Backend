import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repositories";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SCERET } from "../configs";
import { sendEmail } from "../configs/email";

let userRepository = new UserRepository();

export class UserService {
    async registerUser(userData: CreateUserDto){
        const checkEmail = await userRepository.getUserByEmail(userData.email);
        if (checkEmail) {
            throw new HttpError(409, "Email already in use")
        }

        const checkUsername = await userRepository.getUserByUsername(userData.username);
        if (checkUsername){
            throw new HttpError(403, "Username already in use")
        }

      
        
        const hashedPassword = await bcryptjs.hash(userData.password, 10);
        userData.password = hashedPassword;
        const newUser = await userRepository.createUser(userData);
        return newUser;
    }

    async loginUser(loginData: LoginUserDto){
        const user = await userRepository.getUserByEmail(loginData.email);
        if(!user){
            throw new HttpError(404, "User not found");

        }
        const validPassword = await bcryptjs.compare(loginData.password, user.password);
        //compare plain password with hashed password
        // not loginData.password(client) == user.password(database)
        if(!validPassword){
            throw new HttpError(401, "Invalid credentials");
        }
        const payload = {
            id:user._id,
            email:user.email,
            role:user.role
        }
        // sign = create a token
        const token = jwt.sign(payload,JWT_SCERET,{expiresIn:'30m'});
        return {token,user}; 
    }

    async getUserById(userId: string){
        const user = await userRepository.getUserByID(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateProfile(userId: string, updateData: UpdateUserDto){
        const user = await userRepository.getUserByID(userId);
        if(!user) {
            throw new HttpError(404, "User not Found");
        }
        // if email or username is being updated, checkl for uniqueneess
        if (updateData.email && updateData.email !== user.email) {
            const emailCheck = await userRepository.getUserByEmail(updateData.email);
            if(emailCheck){
                throw new HttpError(403, "Email already in use");
            }
        }

        if(updateData.username && updateData.username !== user.username){
            const usernameCheck = await userRepository.getUserByUsername(updateData.username);
            if(usernameCheck) {
                throw new HttpError(403, 'Username already in use');
            }
        }

        if(updateData.password) {
            const hashedPassword = await bcryptjs.hash(updateData.password, 10);
            updateData.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUser(userId, updateData);
        return updatedUser;

    }
    
    async sendResetPasswordEmail(email?: string) {
        const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
        if (!email) {
            throw new HttpError(400, "Email is required");
        }
        const user = await userRepository.getUserByEmail(email);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const token = jwt.sign({ id: user._id }, JWT_SCERET, { expiresIn: '1h' }); // 1 hour expiry
        const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;
        const html = `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;
        await sendEmail(user.email, "Password Reset", html);
        return user;
    }
}

