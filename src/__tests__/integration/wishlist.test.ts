import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { ProductModel } from '../../models/product.model';
import { CategoryModel } from '../../models/category_model';
import { WishlistModel } from '../../models/wishlist.model';

describe('Wishlist Integration Tests', () => {
    let authToken: string;
    let userId: string;
    let testProductId: string;
    let testCategoryId: string;
    
    const testUser = {
        firstName: 'Wishlist',
        lastName: 'User',
        email: 'wishlist@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: 'wishlistuser'
    };

    beforeAll(async () => {
        // Create user and login
        await UserModel.deleteMany({ email: testUser.email });
        await request(app).post('/api/auth/register').send(testUser);
        
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        authToken = loginResponse.body.token;
        userId = loginResponse.body.data._id;

        // Create a test category first
        const category = await CategoryModel.create({
            name: 'Wishlist Test Category',
            description: 'For wishlist testing'
        });
        testCategoryId = category._id.toString();

        // Create a test product with correct fields
        const product = await ProductModel.create({
            title: 'Wishlist Test Product',  // Changed from 'name' to 'title'
            description: 'For wishlist testing',
            price: 75,
            categoryId: testCategoryId,  // Added required categoryId
            sellerId: userId,  // Added required sellerId
            stock: 50
        });
        testProductId = product._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
        await ProductModel.deleteMany({ title: 'Wishlist Test Product' });
        await CategoryModel.deleteMany({ name: 'Wishlist Test Category' });
        await WishlistModel.deleteMany({});
    });

    // describe('POST /api/wishlist', () => {
    //     test('should add product to wishlist', async () => {
    //         const wishlistData = {
    //             productId: testProductId
    //         };

    //         const response = await request(app)
    //             .post('/api/wishlist')
    //             .set('Authorization', `Bearer ${authToken}`)
    //             .send(wishlistData);
            
    //         expect(response.status).toBe(201);
    //         expect(response.body).toHaveProperty('success', true);
    //     });
    // });

    describe('GET /api/wishlist', () => {
        test('should get user wishlist', async () => {
            const response = await request(app)
                .get('/api/wishlist')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });

    describe('DELETE /api/wishlist/:productId', () => {
        test('should remove product from wishlist', async () => {
            const response = await request(app)
                .delete(`/api/wishlist/${testProductId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });

    describe('DELETE /api/wishlist/clear/all', () => {
        test('should clear entire wishlist', async () => {
            const response = await request(app)
                .delete('/api/wishlist/clear/all')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });
});
