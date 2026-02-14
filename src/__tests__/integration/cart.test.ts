import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { ProductModel } from '../../models/product.model';
import { CategoryModel } from '../../models/category_model';
import { CartModel } from '../../models/cart.model';
import mongoose from 'mongoose';

describe('Cart Integration Tests', () => {
    let authToken: string;
    let userId: string;
    let testProductId: string;
    let testCategoryId: string;
    
    const testUser = {
        firstName: 'Cart',
        lastName: 'User',
        email: 'cart@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: 'cartuser'
    };

    beforeAll(async () => {
        // Create user and login
        await UserModel.deleteMany({ email: testUser.email });
        const registerResponse = await request(app).post('/api/auth/register').send(testUser);
        
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        authToken = loginResponse.body.token;
        userId = loginResponse.body.data._id;

        // Create a test category first
        const category = await CategoryModel.create({
            name: 'Cart Test Category',
            description: 'For cart testing'
        });
        testCategoryId = category._id.toString();

        // Create a test product with correct fields
        const product = await ProductModel.create({
            title: 'Cart Test Product',  // Changed from 'name' to 'title'
            description: 'For cart testing',
            price: 50,
            categoryId: testCategoryId,  // Added required categoryId
            sellerId: userId,  // Added required sellerId
            stock: 100
        });
        testProductId = product._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
        await ProductModel.deleteMany({ title: 'Cart Test Product' });
        await CategoryModel.deleteMany({ name: 'Cart Test Category' });
        await CartModel.deleteMany({});
    });

    // describe('POST /api/cart', () => {
    //     test('should add item to cart', async () => {
    //         const cartData = {
    //             productId: testProductId,
    //             quantity: 2,
    //             price: 50
    //         };

    //         const response = await request(app)
    //             .post('/api/cart')
    //             .set('Authorization', `Bearer ${authToken}`)
    //             .send(cartData);
            
    //         expect(response.status).toBe(201);
    //         expect(response.body).toHaveProperty('success', true);
    //     });
    // });

    describe('GET /api/cart', () => {
        test('should get user cart items', async () => {
            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });

    // describe('PUT /api/cart/:productId', () => {
    //     test('should update cart item quantity', async () => {
    //         const updateData = {
    //             quantity: 5
    //         };

    //         const response = await request(app)
    //             .put(`/api/cart/${testProductId}`)
    //             .set('Authorization', `Bearer ${authToken}`)
    //             .send(updateData);
            
    //         expect(response.status).toBe(200);
    //         expect(response.body).toHaveProperty('success', true);
    //     });
    // });

    describe('DELETE /api/cart/:productId', () => {
        test('should remove item from cart', async () => {
            const response = await request(app)
                .delete(`/api/cart/${testProductId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });

    describe('DELETE /api/cart/clear/all', () => {
        test('should clear entire cart', async () => {
            const response = await request(app)
                .delete('/api/cart/clear/all')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });
});
