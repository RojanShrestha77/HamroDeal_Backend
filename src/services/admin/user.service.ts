import { CreateUserDto, UpdateUserDto } from "../../dtos/user.dto";
import { HttpError } from "../../errors/http-error";
import { UserRepository } from "../../repositories/user.repositories";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import { IUser, UserModel } from "../../models/user.model";
import { OrderModel } from "../../models/order.model";
import { ProductModel } from "../../models/product.model";
import { WishlistModel } from "../../models/wishlist.model";
import { CartModel } from "../../models/cart.model";
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

    async getAllUsers({page, size, search}: {page?: string, size?: string, search?: string}){
        const currentPage = page? parseInt(page): 1;
        const pageSize = size? parseInt(size): 10;
        const currentSearch = search || '';

        const {users, total} = await userRepository.getAllUsers(
            {page: currentPage, size: pageSize, search: currentSearch}
        );
        const pagination = {
            page: currentPage,
            size: pageSize,
            total,
            totalPages: Math.ceil(total/pageSize)
        }
        return {users, pagination};
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

    async getUserDetailPage(userId: string) {
        // Get user basic info
        const user = await UserModel.findById(userId)
            .select('-password')
            .lean();

        if (!user) {
            const error: any = new Error("User not found");
            error.statusCode = 404;
            throw error;
        }

        // Get user's orders
        const orders = await OrderModel.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean();

        // Get user's products (if seller)
        const products = user.role === 'seller' 
            ? await ProductModel.find({ sellerId: userId })
                .populate('categoryId', 'name')
                .sort({ createdAt: -1 })
                .limit(10)
                .lean()
            : [];

        // Get user's wishlist
        const wishlist = await WishlistModel.findOne({ userId })
            .populate('items.productId', 'title price images')
            .lean();

        // Get user's cart
        const cart = await CartModel.findOne({ userId })
            .populate('items.productId', 'title price images')
            .lean();

        // Calculate statistics
        const totalOrders = await OrderModel.countDocuments({ userId });
        const totalSpent = await OrderModel.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]);

        const totalProducts = user.role === 'seller' 
            ? await ProductModel.countDocuments({ sellerId: userId })
            : 0;

        const totalRevenue = user.role === 'seller'
            ? await OrderModel.aggregate([
                { $unwind: '$items' },
                { $match: { 'items.sellerId': user._id } },
                { $group: { _id: null, total: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } }
            ])
            : [];

        return {
            user: {
                _id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                username: user.username,
                role: user.role,
                isApproved: user.isApproved,
                imageUrl: user.imageUrl,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            statistics: {
                totalOrders,
                totalSpent: totalSpent[0]?.total || 0,
                totalProducts,
                totalRevenue: totalRevenue[0]?.total || 0,
                wishlistItems: wishlist?.items?.length || 0,
                cartItems: cart?.items?.length || 0,
            },
            recentOrders: orders,
            recentProducts: products,
            wishlist: wishlist?.items || [],
            cart: cart?.items || [],
        };
    }


}