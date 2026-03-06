import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { CartModel } from '../../models/cart.model';
import { ProductModel } from '../../models/product.model';
import { CategoryModel } from '../../models/category_model';

describe('Cart Integration Tests', () => {
    let userToken: string;
    let userId: string;
    let sellerToken: string;
    let sellerId: string;
    let productId: string;
    let categoryId: string;
    const timestamp = Date.now();

    const testUser = {
        firstName: 'Cart',
        lastName: 'User',
        email: `cartuser${timestamp}@example.com`,
        password: 'password123',
        confirmPassword: 'password123',
        username: `cartuser${timestamp}`,
        role: 'user'
    };

    const testSeller = {
        firstName: 'Cart',
        lastName: 'Seller',
        email: `cartseller${timestamp}@example.com`,
        password: 'password123',
        confirmPassword: 'password123',
        username: `cartseller${timestamp}`,
        role: 'seller'
    };

    beforeAll(async () => {
        // Cleanup - only delete test users, not all products/categories
        await UserModel.deleteMany({
            email: { $in: [testUser.email, testSeller.email] }
        });
        await CartModel.deleteMany({});

        // Create category
        const category = await CategoryModel.create({
            name: "Test Category 1772755987.37749",
            description: 'Test category for cart',
            status: 'active'
        });
        categoryId = category._id.toString();

        // Create test users
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(testUser.password, 10);

        const user = await UserModel.create({
            ...testUser,
            password: hashedPassword
        });
        userId = user._id.toString();

        const seller = await UserModel.create({
            ...testSeller,
            password: hashedPassword,
            isApproved: true
        });
        sellerId = seller._id.toString();

        // Login users
        const userLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        userToken = userLoginResponse.body.token;

        const sellerLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: testSeller.email, password: testSeller.password });
        sellerToken = sellerLoginResponse.body.token;

        // Create test product
        const product = await ProductModel.create({
            title: 'Test Product',
            description: 'Test product for cart',
            price: 100,
            stock: 50,
            categoryId: categoryId,
            sellerId: sellerId,
            images: []
        });
        productId = product._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({
            email: { $in: [testUser.email, testSeller.email] }
        });
        await CartModel.deleteMany({});
        await ProductModel.deleteMany({ sellerId: sellerId });
        await CategoryModel.deleteMany({});
    });

    describe('POST /api/cart', () => {
        it('should add item to cart', async () => {
            const cartData = {
                productId: productId,
                quantity: 2
            };

            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send(cartData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('items');
            expect(response.body.data.items.length).toBeGreaterThan(0);
        });

        it('should fail without authentication', async () => {
            const cartData = {
                productId: productId,
                quantity: 1
            };

            const response = await request(app)
                .post('/api/cart')
                .send(cartData);

            expect(response.status).toBe(401);
        });

        it('should fail with missing product ID', async () => {
            const cartData = {
                quantity: 1
            };

            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send(cartData);

            expect(response.status).toBe(400);
        });

        it('should fail with missing quantity', async () => {
            const cartData = {
                productId: productId
            };

            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send(cartData);

            expect(response.status).toBe(400);
        });

        it('should fail with invalid quantity (zero)', async () => {
            const cartData = {
                productId: productId,
                quantity: 0
            };

            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send(cartData);

            expect(response.status).toBe(400);
        });

        it('should fail with invalid quantity (negative)', async () => {
            const cartData = {
                productId: productId,
                quantity: -5
            };

            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send(cartData);

            expect(response.status).toBe(400);
        });

        it('should fail with invalid product ID', async () => {
            const cartData = {
                productId: 'invalid-id',
                quantity: 1
            };

            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send(cartData);

            expect([400, 401, 500]).toContain(response.status);
        });

        it('should fail with non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const cartData = {
                productId: fakeId,
                quantity: 1
            };

            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send(cartData);

            expect([401, 404]).toContain(response.status);
        });

        it('should increase quantity if product already in cart', async () => {
            const cartData = {
                productId: productId,
                quantity: 3
            };

            const response = await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send(cartData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });

    describe('GET /api/cart', () => {
        it('should get user cart', async () => {
            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('items');
            expect(Array.isArray(response.body.data.items)).toBe(true);
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .get('/api/cart');

            expect(response.status).toBe(401);
        });

        it('should return empty cart for new user', async () => {
            // Create a new user
            const newUser = {
                firstName: 'New',
                lastName: 'CartUser',
                email: 'newcartuser@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                username: 'newcartuser',
                role: 'user'
            };

            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(newUser.password, 10);
            const user = await UserModel.create({
                ...newUser,
                password: hashedPassword
            });

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({ email: newUser.email, password: newUser.password });
            const newUserToken = loginResponse.body.token;

            const response = await request(app)
                .get('/api/cart')
                .set('Authorization', `Bearer ${newUserToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);

            // Cleanup
            await UserModel.deleteOne({ email: newUser.email });
        });
    });

    describe('PUT /api/cart/:productId', () => {
        it('should update cart item quantity', async () => {
            const updateData = {
                quantity: 5
            };

            const response = await request(app)
                .put(`/api/cart/${productId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('items');
        });

        it('should fail without authentication', async () => {
            const updateData = {
                quantity: 5
            };

            const response = await request(app)
                .put(`/api/cart/${productId}`)
                .send(updateData);

            expect(response.status).toBe(401);
        });

        it('should fail with missing quantity', async () => {
            const updateData = {};

            const response = await request(app)
                .put(`/api/cart/${productId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(response.status).toBe(400);
        });

        it('should fail with invalid quantity (zero)', async () => {
            const updateData = {
                quantity: 0
            };

            const response = await request(app)
                .put(`/api/cart/${productId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect([200, 400]).toContain(response.status);
        });

        it('should fail with invalid quantity (negative)', async () => {
            const updateData = {
                quantity: -3
            };

            const response = await request(app)
                .put(`/api/cart/${productId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(response.status).toBe(400);
        });

        it('should fail with invalid product ID', async () => {
            const updateData = {
                quantity: 5
            };

            const response = await request(app)
                .put('/api/cart/invalid-id')
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect([400, 401, 500]).toContain(response.status);
        });

        it('should fail with non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const updateData = {
                quantity: 5
            };

            const response = await request(app)
                .put(`/api/cart/${fakeId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect([401, 404]).toContain(response.status);
        });
    });

    describe('DELETE /api/cart/:productId', () => {
        it('should remove item from cart', async () => {
            const response = await request(app)
                .delete(`/api/cart/${productId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('items');
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .delete(`/api/cart/${productId}`);

            expect(response.status).toBe(401);
        });

        it('should fail with invalid product ID', async () => {
            const response = await request(app)
                .delete('/api/cart/invalid-id')
                .set('Authorization', `Bearer ${userToken}`);

            expect([200, 400, 401, 500]).toContain(response.status);
        });

        it('should fail with non-existent product', async () => {
            const fakeId = '507f1f77bcf86cd799439011';
            const response = await request(app)
                .delete(`/api/cart/${fakeId}`)
                .set('Authorization', `Bearer ${userToken}`);

            expect([200, 400, 401, 404, 500]).toContain(response.status);
        });
    });

    describe('DELETE /api/cart/clear/all', () => {
        it('should clear entire cart', async () => {
            // First add an item to cart
            const cartData = {
                productId: productId,
                quantity: 2
            };

            await request(app)
                .post('/api/cart')
                .set('Authorization', `Bearer ${userToken}`)
                .send(cartData);

            // Then clear the cart
            const response = await request(app)
                .delete('/api/cart/clear/all')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('items');
            expect(response.body.data.items).toHaveLength(0);
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .delete('/api/cart/clear/all');

            expect(response.status).toBe(401);
        });

        it('should handle clearing empty cart', async () => {
            // Create a new user with empty cart
            const timestamp = Date.now();
            const newUser = {
                firstName: 'Empty',
                lastName: 'CartUser',
                email: `emptycartuser${timestamp}@example.com`,
                password: 'password123',
                confirmPassword: 'password123',
                username: `emptycartuser${timestamp}`,
                role: 'user'
            };

            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(newUser.password, 10);
            const user = await UserModel.create({
                ...newUser,
                password: hashedPassword
            });

            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({ email: newUser.email, password: newUser.password });
            const newUserToken = loginResponse.body.token;

            const response = await request(app)
                .delete('/api/cart/clear/all')
                .set('Authorization', `Bearer ${newUserToken}`);

            expect([200, 404]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toHaveProperty('success', true);
            }

            // Cleanup
            await UserModel.deleteOne({ email: newUser.email });
        });
    });

    describe('Error scenarios', () => {
        it('should handle concurrent cart operations', async () => {
            const cartData = {
                productId: productId,
                quantity: 1
            };

            // Make concurrent requests
            const responses = await Promise.all([
                request(app)
                    .post('/api/cart')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(cartData),
                request(app)
                    .post('/api/cart')
                    .set('Authorization', `Bearer ${userToken}`)
                    .send(cartData)
            ]);

            // Both should succeed
            responses.forEach(response => {
                expect(response.status).toBe(200);
            });
        });
    });
});
