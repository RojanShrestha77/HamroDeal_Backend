// services/seller.service.ts
import { CreateUserDto } from "../../dtos/user.dto";
import { HttpError } from "../../errors/http-error";
import { UserRepository } from "../../repositories/user.repositories";
import bcryptjs from "bcryptjs";

const userRepository = new UserRepository();

export class SellerService {
  async createSeller(userData: CreateUserDto) {
    // Check if email already exists
    const checkEmail = await userRepository.getUserByEmail(userData.email);
    if (checkEmail) {
      throw new HttpError(409, "Email already in use");
    }

    // Check if username already exists
    const checkUsername = await userRepository.getUserByUsername(userData.username);
    if (checkUsername) {
      throw new HttpError(409, "Username already in use"); // ← 409 is better than 404 here
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(userData.password, 10);

    // Create the full user object with role and isApproved
    const sellerData = {
      ...userData,
      password: hashedPassword,
      role: "seller" as const,     // ← Force it to "seller"
      isApproved: false,           // ← Seller needs admin approval
    };

    // Pass the complete object to createUser
    const newSeller = await userRepository.createUser(sellerData);

    return newSeller;
  }
}