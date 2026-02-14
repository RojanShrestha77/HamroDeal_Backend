import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { OrderModel } from '../../models/order.model';
import { BlogModel } from '../../models/blog.model';
import bcrypt from 'bcryptjs';

describe('Admin Integration Tests', () => {
    let adminToken: string;
    let adminUserId: string;
    let testUserId: string;
    let testOrderId: string;
    let testBlogId: string;

    const adminUser = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'admin123',
        username: 'adminuser',
        role: 'admin'
    };

    const regularUser = {
        firstName: 'Regular',
        lastName: 'User',
        email: 'regular@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: 'regularuser'
    };

    beforeAll(async () => {
        // Cleanup
        await UserModel.deleteMany({ 
            email: { $in: [adminUser.email, regularUser.email] } 
        });

        // Hash password for admin
        const hashedPassword = await bcrypt.hash(adminUser.password, 10);

        // Create admin user directly in database
        const admin = await UserModel.create({
            firstName: adminUser.firstName,
            lastName: adminUser.lastName,
            email: adminUser.email,
            username: adminUser.username,
            password: hashedPassword,
            role: 'admin',
            isApproved: true
        });
        adminUserId = admin._id.toString();

        // Login as admin
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ 
                email: adminUser.email, 
                password: adminUser.password 
            });
        adminToken = loginResponse.body.token;

        // Create a regular user for testing
        const regularUserResponse = await request(app)
            .post('/api/auth/register')
            .send(regularUser);
        testUserId = regularUserResponse.body.data._id;

        // Create a test blog with correct field name
        const blog = await BlogModel.create({
            title: 'Admin Test Blog',
            content: 'Test blog content',
            authorId: adminUserId  // Changed from 'author' to 'authorId'
        });
        testBlogId = blog._id.toString();
    });

    afterAll(async () => {
        await UserModel.deleteMany({ 
            email: { $in: [adminUser.email, regularUser.email] } 
        });
        await BlogModel.deleteMany({ title: 'Admin Test Blog' });
        await OrderModel.deleteMany({});
    });

    // ==========================================
    // ADMIN USER MANAGEMENT TESTS
    // ==========================================
    describe('Admin User Management', () => {
        // describe('POST /api/admin/users', () => {
        //     test('should create user as admin', async () => {
        //         const newUser = {
        //             firstName: 'New',
        //             lastName: 'User',
        //             email: 'newuser@example.com',
        //             username: 'newuser',
        //             password: 'password123',
        //             role: 'user'
        //         };

        //         const response = await request(app)
        //             .post('/api/admin/users')
        //             .set('Authorization', `Bearer ${adminToken}`)
        //             .send(newUser);
                
        //         expect(response.status).toBe(200);
        //         expect(response.body).toHaveProperty('success', true);
                
        //         // Cleanup
        //         await UserModel.deleteOne({ email: newUser.email });
        //     });
        // });

        describe('GET /api/admin/users', () => {
            test('should get all users as admin', async () => {
                const response = await request(app)
                    .get('/api/admin/users')
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body.data)).toBe(true);
                expect(response.body.data.length).toBeGreaterThan(0);
            });
        });

        describe('GET /api/admin/users/:id', () => {
            test('should get single user by id as admin', async () => {
                const response = await request(app)
                    .get(`/api/admin/users/${testUserId}`)
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty('_id', testUserId);
                expect(response.body.data).toHaveProperty('email', regularUser.email);
            });
        });

        describe('PUT /api/admin/users/:id', () => {
            test('should update user as admin', async () => {
                const updateData = {
                    firstName: 'Updated',
                    lastName: 'Name'
                };

                const response = await request(app)
                    .put(`/api/admin/users/${testUserId}`)
                    .set('Authorization', `Bearer ${adminToken}`)
                    .send(updateData);
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);
            });
        });

        describe('PATCH /api/admin/users/:id/approve-seller', () => {
            test('should approve seller as admin', async () => {
                // First create a seller user
                const hashedPassword = await bcrypt.hash('password123', 10);
                const sellerUser = await UserModel.create({
                    firstName: 'Seller',
                    lastName: 'Test',
                    email: 'seller-approval@example.com',
                    username: 'sellerapproval',
                    password: hashedPassword,
                    role: 'seller',
                    isApproved: false
                });

                const response = await request(app)
                    .patch(`/api/admin/users/${sellerUser._id}/approve-seller`)
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);

                // Cleanup
                await UserModel.deleteOne({ _id: sellerUser._id });
            });
        });

        describe('DELETE /api/admin/users/:id', () => {
            test('should delete user as admin', async () => {
                // Create a user to delete
                const hashedPassword = await bcrypt.hash('password123', 10);
                const userToDelete = await UserModel.create({
                    firstName: 'Delete',
                    lastName: 'Me',
                    email: 'deleteme@example.com',
                    username: 'deleteme',
                    password: hashedPassword,
                    role: 'user'
                });

                const response = await request(app)
                    .delete(`/api/admin/users/${userToDelete._id}`)
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);
            });
        });
    });

    // ==========================================
    // ADMIN ORDER MANAGEMENT TESTS
    // ==========================================
    describe('Admin Order Management', () => {
        beforeAll(async () => {
            // Create a test order with correct schema
            const order = await OrderModel.create({
                userId: testUserId,
                orderNumber: `ORD-${Date.now()}-TEST`,
                items: [
                    {
                        productId: '507f1f77bcf86cd799439011',
                        productName: 'Test Product',
                        productImage: 'test.jpg',
                        quantity: 2,
                        price: 100,
                        sellerId: adminUserId
                    }
                ],
                shippingAddress: {
                    fullName: 'Test User',
                    phone: '1234567890',
                    address: '123 Test St',  // Changed from 'street' to 'address'
                    city: 'Test City',
                    state: 'Test State',
                    zipCode: '12345',
                    country: 'Test Country'
                },
                paymentMethod: 'cash_on_delivery',
                subtotal: 200,
                shippingCost: 10,
                tax: 20,
                total: 230,
                status: 'pending'
            });
            testOrderId = order._id.toString();
        });

        describe('GET /api/admin/orders', () => {
            test('should get all orders as admin', async () => {
                const response = await request(app)
                    .get('/api/admin/orders')
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body.data)).toBe(true);
            });
        });

        describe('GET /api/admin/orders/:id', () => {
            test('should get single order by id as admin', async () => {
                const response = await request(app)
                    .get(`/api/admin/orders/${testOrderId}`)
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty('_id', testOrderId);
            });
        });

        // describe('PATCH /api/admin/orders/:id/status', () => {
        //     test('should update order status as admin', async () => {
        //         const statusUpdate = {
        //             status: 'processing'
        //         };

        //         const response = await request(app)
        //             .patch(`/api/admin/orders/${testOrderId}/status`)
        //             .set('Authorization', `Bearer ${adminToken}`)
        //             .send(statusUpdate);
                
        //         expect(response.status).toBe(200);
        //         expect(response.body).toHaveProperty('success', true);
        //     });
        // });

        describe('DELETE /api/admin/orders/:id', () => {
            test('should delete order as admin', async () => {
                const response = await request(app)
                    .delete(`/api/admin/orders/${testOrderId}`)
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);
            });
        });
    });

    // ==========================================
    // ADMIN BLOG MANAGEMENT TESTS
    // ==========================================
    describe('Admin Blog Management', () => {
        describe('GET /api/admin/blogs', () => {
            test('should get all blogs as admin', async () => {
                const response = await request(app)
                    .get('/api/admin/blogs')
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
                expect(Array.isArray(response.body.data)).toBe(true);
            });
        });

        describe('GET /api/admin/blogs/:id', () => {
            test('should get single blog by id as admin', async () => {
                const response = await request(app)
                    .get(`/api/admin/blogs/${testBlogId}`)
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
                expect(response.body.data).toHaveProperty('_id', testBlogId);
            });
        });

        describe('DELETE /api/admin/blogs/:id', () => {
            test('should delete blog as admin', async () => {
                const response = await request(app)
                    .delete(`/api/admin/blogs/${testBlogId}`)
                    .set('Authorization', `Bearer ${adminToken}`);
                
                expect(response.status).toBe(200);
                expect(response.body).toHaveProperty('success', true);
            });
        });
    });
});
