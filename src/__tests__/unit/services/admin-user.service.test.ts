import { AdminUserService } from '../../../services/admin/user.service';
import { UserRepository } from '../../../repositories/user.repositories';
import { UserModel } from '../../../models/user.model';
import { OrderModel } from '../../../models/order.model';
import { ProductModel } from '../../../models/product.model';
import { WishlistModel } from '../../../models/wishlist.model';
import { CartModel } from '../../../models/cart.model';
import { HttpError } from '../../../errors/http-error';
import mongoose from 'mongoose';

jest.mock('../../../repositories/user.repositories');

describe('AdminUserService', () => {
    let service: AdminUserService;
    const validId = new mongoose.Types.ObjectId().toString();

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AdminUserService();
    });

    describe('createUser', () => {
        it('should throw 409 if email already exists', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByEmail').mockResolvedValue({ email: 'a@b.com' } as any);
            await expect(service.createUser({ email: 'a@b.com', password: 'pass', username: 'u', firstName: 'F', lastName: 'L' } as any)).rejects.toThrow(HttpError);
        });

        it('should throw 404 if username already exists', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByEmail').mockResolvedValue(null);
            jest.spyOn(UserRepository.prototype, 'getUserByUsername').mockResolvedValue({ username: 'u' } as any);
            await expect(service.createUser({ email: 'a@b.com', password: 'pass', username: 'u', firstName: 'F', lastName: 'L' } as any)).rejects.toThrow(HttpError);
        });

        it('should create a user successfully', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByEmail').mockResolvedValue(null);
            jest.spyOn(UserRepository.prototype, 'getUserByUsername').mockResolvedValue(null);
            jest.spyOn(UserRepository.prototype, 'createUser').mockResolvedValue({ _id: validId } as any);
            const result = await service.createUser({ email: 'a@b.com', password: 'pass', username: 'u', firstName: 'F', lastName: 'L' } as any);
            expect(result).toHaveProperty('_id');
        });
    });

    describe('getAllUsers', () => {
        it('should return users with default pagination', async () => {
            jest.spyOn(UserRepository.prototype, 'getAllUsers').mockResolvedValue({ users: [], total: 0 });
            const result = await service.getAllUsers({});
            expect(result).toHaveProperty('users');
            expect(result).toHaveProperty('pagination');
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.size).toBe(10);
        });

        it('should parse page and size from string', async () => {
            jest.spyOn(UserRepository.prototype, 'getAllUsers').mockResolvedValue({ users: [], total: 50 });
            const result = await service.getAllUsers({ page: '2', size: '5' });
            expect(result.pagination.page).toBe(2);
            expect(result.pagination.size).toBe(5);
            expect(result.pagination.totalPages).toBe(10);
        });
    });

    describe('getOneUser', () => {
        it('should throw 404 if user not found', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue(null);
            await expect(service.getOneUser(validId)).rejects.toThrow(HttpError);
        });

        it('should return user if found', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue({ _id: validId } as any);
            const result = await service.getOneUser(validId);
            expect(result).toHaveProperty('_id');
        });
    });

    describe('deleteOneUser', () => {
        it('should throw 404 if user not found', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue(null);
            await expect(service.deleteOneUser(validId)).rejects.toThrow(HttpError);
        });

        it('should throw 500 if delete fails', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue({ _id: validId } as any);
            jest.spyOn(UserRepository.prototype, 'deleteUser').mockResolvedValue(null);
            await expect(service.deleteOneUser(validId)).rejects.toThrow(HttpError);
        });

        it('should return result on successful delete', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue({ _id: validId } as any);
            jest.spyOn(UserRepository.prototype, 'deleteUser').mockResolvedValue({ deletedCount: 1 } as any);
            const result = await service.deleteOneUser(validId);
            expect(result).toHaveProperty('deletedCount');
        });
    });

    describe('updateOneUser', () => {
        it('should throw 404 if user not found', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue(null);
            await expect(service.updateOneUser(validId, {} as any)).rejects.toThrow(HttpError);
        });

        it('should throw 500 if update fails', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue({ _id: validId } as any);
            jest.spyOn(UserRepository.prototype, 'updateUser').mockResolvedValue(null);
            await expect(service.updateOneUser(validId, {} as any)).rejects.toThrow(HttpError);
        });

        it('should return updated user', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue({ _id: validId } as any);
            jest.spyOn(UserRepository.prototype, 'updateUser').mockResolvedValue({ _id: validId, firstName: 'New' } as any);
            const result = await service.updateOneUser(validId, { firstName: 'New' } as any);
            expect(result).toHaveProperty('firstName', 'New');
        });
    });

    describe('approvedSeller', () => {
        it('should throw 404 if user not found', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue(null);
            await expect(service.approvedSeller(validId)).rejects.toThrow(HttpError);
        });

        it('should throw 400 if user is not a seller', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue({ role: 'user', isApproved: false } as any);
            await expect(service.approvedSeller(validId)).rejects.toThrow(HttpError);
        });

        it('should throw 400 if seller already approved', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue({ role: 'seller', isApproved: true } as any);
            await expect(service.approvedSeller(validId)).rejects.toThrow(HttpError);
        });

        it('should throw 500 if approval update fails', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue({ role: 'seller', isApproved: false } as any);
            jest.spyOn(UserRepository.prototype, 'updateUser').mockResolvedValue(null);
            await expect(service.approvedSeller(validId)).rejects.toThrow(HttpError);
        });

        it('should return approved seller on success', async () => {
            jest.spyOn(UserRepository.prototype, 'getUserByID').mockResolvedValue({ role: 'seller', isApproved: false } as any);
            jest.spyOn(UserRepository.prototype, 'updateUser').mockResolvedValue({ role: 'seller', isApproved: true } as any);
            const result = await service.approvedSeller(validId);
            expect(result).toHaveProperty('isApproved', true);
        });
    });
});
