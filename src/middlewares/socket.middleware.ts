import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repositories";
import { JWT_SECRET } from "../configs";

const userRepository = new UserRepository();

export interface AuthenticatedSocket extends Socket {
    userId?: string;
    user?: any;
}

export const socketAuthMiddleware = async (
    socket: AuthenticatedSocket,
    next: (err?: Error) => void
) => {
    try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

        if(!token) {
            return next(new Error("Authentication error: NO token provided"));
        }

        const decodedToken = jwt.verify(token, JWT_SECRET) as Record<string, any>;

        if(!decodedToken || !decodedToken.id) {
            return next(new Error("Authentication error: Invalid token"))
        }

        const user = await userRepository.getUserByID(decodedToken.id);

        if(!user) {
            return next(new Error("Authenticaiton error: User not found"));
        }

        socket.userId = user._id.toString();
        socket.user = user;

        next();
    }catch (error: any) {
    next(new Error("Authentication error: " + error.message));
  }
}