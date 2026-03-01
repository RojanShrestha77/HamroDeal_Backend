import { CreateUserDto, LoginUserDto, UpdateUserDto } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repositories";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../configs/email";
import { JWT_SECRET } from "../configs";

let userRepository = new UserRepository();

export class UserService {
    async registerUser(userData: CreateUserDto) {
        const checkEmail = await userRepository.getUserByEmail(userData.email);
        if (checkEmail) {
            throw new HttpError(409, "Email already in use")
        }

        const checkUsername = await userRepository.getUserByUsername(userData.username);
        if (checkUsername) {
            throw new HttpError(403, "Username already in use")
        }



        const hashedPassword = await bcryptjs.hash(userData.password, 10);
        userData.password = hashedPassword;
        const newUser = await userRepository.createUser(userData);
        return newUser;
    }

    async loginUser(loginData: LoginUserDto) {
        const user = await userRepository.getUserByEmail(loginData.email);
        if (!user) {
            throw new HttpError(404, "User not found");

        }
        const validPassword = await bcryptjs.compare(loginData.password, user.password);
        //compare plain password with hashed password
        // not loginData.password(client) == user.password(database)
        if (!validPassword) {
            throw new HttpError(401, "Invalid credentials");
        }
        const payload = {
            id: user._id,
            email: user.email,
            role: user.role
        }
        // sign = create a token
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });
        return { token, user };
    }

    async getUserById(userId: string) {
        const user = await userRepository.getUserByID(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        return user;
    }

    async updateProfile(userId: string, updateData: UpdateUserDto) {
        const user = await userRepository.getUserByID(userId);
        if (!user) {
            throw new HttpError(404, "User not Found");
        }
        // if email or username is being updated, checkl for uniqueneess
        if (updateData.email && updateData.email !== user.email) {
            const emailCheck = await userRepository.getUserByEmail(updateData.email);
            if (emailCheck) {
                throw new HttpError(403, "Email already in use");
            }
        }

        if (updateData.username && updateData.username !== user.username) {
            const usernameCheck = await userRepository.getUserByUsername(updateData.username);
            if (usernameCheck) {
                throw new HttpError(403, 'Username already in use');
            }
        }

        if (updateData.password) {
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
        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

        // Create both web and app links
        const webResetLink = `${CLIENT_URL}/reset-password?token=${token}`;
        const appResetLink = `hamrodeal://reset-password?token=${token}`;

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1C1C1C;">Password Reset Request</h2>
                <p style="color: #333; font-size: 16px;">You requested to reset your password for Hamro Deal.</p>
                
                <div style="margin: 30px 0; text-align: center;">
                    <a href="${webResetLink}" 
                       style="background-color: #1C1C1C; color: white; padding: 14px 40px; 
                              text-decoration: none; border-radius: 8px; display: inline-block;
                              font-weight: bold; font-size: 16px; margin: 10px;">
                        Reset Password (Web)
                    </a>
                    <br/>
                    <a href="${appResetLink}" 
                       style="background-color: #4CAF50; color: white; padding: 14px 40px; 
                              text-decoration: none; border-radius: 8px; display: inline-block;
                              font-weight: bold; font-size: 16px; margin: 10px;">
                        Open in App
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    <strong>For Web:</strong> Click "Reset Password (Web)" button above
                </p>
                <p style="color: #666; font-size: 14px;">
                    <strong>For Mobile App:</strong> Click "Open in App" or copy this link:
                </p>
                <p style="background-color: #f5f5f5; padding: 12px; border-radius: 4px; 
                          word-break: break-all; font-size: 13px; color: #333;">
                    ${appResetLink}
                </p>
                
                <p style="color: #999; font-size: 13px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
                    This link will expire in 1 hour. If you didn't request this, please ignore this email.
                </p>
            </div>
        `;

        await sendEmail(user.email, "Password Reset - Hamro Deal", html);
        return user;
    }

    async resetPassword(token?: string, newPassword?: string) {
        try {
            if (!token || !newPassword) {
                throw new HttpError(400, "Token and new password are required");
            }
            const decoded: any = jwt.verify(token, JWT_SECRET);
            const userId = decoded.id;
            const user = await userRepository.getUserByID(userId);
            if (!user) {
                throw new HttpError(404, "User not found");
            }
            const hashedPassword = await bcryptjs.hash(newPassword, 10);
            await userRepository.updateUser(userId, { password: hashedPassword });
            return user;
        } catch (error) {
            throw new HttpError(400, "Invalid or expired token");
        }
    }
}

