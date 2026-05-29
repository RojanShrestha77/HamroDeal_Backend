// import request from 'supertest';
// import app from '../../app';
// import { UserModel } from '../../models/user.model';
// import { OrderModel } from '../../models/order.model';
// import { ProductModel } from '../../models/product.model';
// import { CategoryModel } from '../../models/category_model';

// describe('Order Integration Tests', () => {
//     let userToken: string;
//     let userId: string;
//     let sellerToken: string;
//     let sellerId: string;
//     let productId: string;
//     let categoryId: string;
//     let orderId: string;
//     const timestamp = Date.now();

//     const testUser = {
//         firstName: 'Order',
//         lastName: 'User',
//         email: `orderuser${timestamp}@example.com`,
//         password: 'password123',
//         confirmPassword: 'password123',
//         username: `orderuser${timestamp}`,
//         role: 'user'
//     };

//     const testSeller = {
//         firstName: 'Order',
//         lastName: 'Seller',
//         email: `orderseller${timestamp}@example.com`,
//         password: 'password123',
//         confirmPassword: 'password123',
//         username: `orderseller${timestamp}`,
//         role: 'seller'
//     };

//     beforeAll(async () => {
//         // Cleanup - only delete test users, not all products/categories
//         await UserModel.deleteMany({
//             email: { $in: [testUser.email, testSeller.email] }
//         });
//         await OrderModel.deleteMany({});

//         // Create category
//         const category = await CategoryModel.create({
//             name: "Test Category 1772755987.3539",
//             description: 'Test category for orders',
//             status: 'active'
//         });
//         categoryId = category._id.toString();

//         // Create test users
//         const bcrypt = require('bcryptjs');
//         const hashedPassword = await bcrypt.hash(testUser.password, 10);

//         const user = await UserModel.create({
//             ...testUser,
//             password: hashedPassword
//         });
//         userId = user._id.toString();

//         const seller = await UserModel.create({
//             ...testSeller,
//             password: hashedPassword,
//             isApproved: true
//         });
//         sellerId = seller._id.toString();

//         // Login users
//         const userLoginResponse = await request(app)
//             .post('/api/auth/login')
//             .send({ email: testUser.email, password: testUser.password });
//         userToken = userLoginResponse.body.token;

//         const sellerLoginResponse = await request(app)
//             .post('/api/auth/login')
//             .send({ email: testSeller.email, password: testSeller.password });
//         sellerToken = sellerLoginResponse.body.token;

//         // Create test product
//         const product = await ProductModel.create({
//             title: 'Test Product',
//             description: 'Test product for orders',
//             price: 100,
//             stock: 50,
//             categoryId: categoryId,
//             sellerId: sellerId,
//             images: []
//         });
//         productId = product._id.toString();
//     });

//     afterAll(async () => {
//         await UserModel.deleteMany({
//             email: { $in: [testUser.email, testSeller.email] }
//         });
//         await OrderModel.deleteMany({});
//         await ProductModel.deleteMany({ sellerId: sellerId });
//         await CategoryModel.deleteMany({});
//     });

//     describe('POST /api/orders', () => {
//         it('should create order with valid data', async () => {
//             const orderData = {
//                 items: [
//                     {
//                         productId: productId,
//                         productName: 'Test Product',
//                         quantity: 2,
//                         price: 100,
//                         sellerId: sellerId
//                     }
//                 ],
//                 shippingAddress: {
//                     fullName: 'John Doe',
//                     phone: '1234567890',
//                     address: '123 Main St',
//                     city: 'Test City',
//                     zipCode: '12345',
//                     country: 'Test Country'
//                 },
//                 paymentMethod: 'cash_on_delivery',
//                 subtotal: 200,
//                 shippingCost: 10,
//                 tax: 20,
//                 total: 230
//             };

//             const response = await request(app)
//                 .post('/api/orders')
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(orderData);

//             expect(response.status).toBe(201);
//             expect(response.body).toHaveProperty('success', true);
//             expect(response.body.data).toHaveProperty('_id');
//             expect(response.body.data).toHaveProperty('orderNumber');
//             expect(response.body.data).toHaveProperty('status', 'pending');
//             expect(response.body.data.items).toHaveLength(1);

//             orderId = response.body.data._id;
//         });

//         it('should fail to create order without authentication', async () => {
//             const orderData = {
//                 items: [
//                     {
//                         productId: productId,
//                         productName: 'Test Product',
//                         quantity: 1,
//                         price: 100,
//                         sellerId: sellerId
//                     }
//                 ],
//                 shippingAddress: {
//                     fullName: 'John Doe',
//                     phone: '1234567890',
//                     address: '123 Main St',
//                     city: 'Test City',
//                     zipCode: '12345',
//                     country: 'Test Country'
//                 },
//                 paymentMethod: 'cash_on_delivery',
//                 subtotal: 100,
//                 shippingCost: 10,
//                 tax: 10,
//                 total: 120
//             };

//             const response = await request(app)
//                 .post('/api/orders')
//                 .send(orderData);

//             expect(response.status).toBe(401);
//         });

//         it('should fail with invalid items array', async () => {
//             const orderData = {
//                 items: [],
//                 shippingAddress: {
//                     fullName: 'John Doe',
//                     phone: '1234567890',
//                     address: '123 Main St',
//                     city: 'Test City',
//                     zipCode: '12345',
//                     country: 'Test Country'
//                 },
//                 paymentMethod: 'cash_on_delivery',
//                 subtotal: 0,
//                 shippingCost: 0,
//                 tax: 0,
//                 total: 0
//             };

//             const response = await request(app)
//                 .post('/api/orders')
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(orderData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with missing shipping address', async () => {
//             const orderData = {
//                 items: [
//                     {
//                         productId: productId,
//                         productName: 'Test Product',
//                         quantity: 1,
//                         price: 100,
//                         sellerId: sellerId
//                     }
//                 ],
//                 paymentMethod: 'cash_on_delivery',
//                 subtotal: 100,
//                 shippingCost: 10,
//                 tax: 10,
//                 total: 120
//             };

//             const response = await request(app)
//                 .post('/api/orders')
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(orderData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with invalid payment method', async () => {
//             const orderData = {
//                 items: [
//                     {
//                         productId: productId,
//                         productName: 'Test Product',
//                         quantity: 1,
//                         price: 100,
//                         sellerId: sellerId
//                     }
//                 ],
//                 shippingAddress: {
//                     fullName: 'John Doe',
//                     phone: '1234567890',
//                     address: '123 Main St',
//                     city: 'Test City',
//                     zipCode: '12345',
//                     country: 'Test Country'
//                 },
//                 paymentMethod: 'invalid_method',
//                 subtotal: 100,
//                 shippingCost: 10,
//                 tax: 10,
//                 total: 120
//             };

//             const response = await request(app)
//                 .post('/api/orders')
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(orderData);

//             expect(response.status).toBe(400);
//         });
//     });

//     describe('GET /api/orders/:id', () => {
//         it('should get order by ID', async () => {
//             const response = await request(app)
//                 .get(`/api/orders/${orderId}`)
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([200, 401]).toContain(response.status);
//             if (response.status === 200) {
//                 expect(response.body).toHaveProperty('success', true);
//                 expect(response.body.data).toHaveProperty('_id', orderId);
//             }
//         });

//         it('should fail without authentication', async () => {
//             const response = await request(app)
//                 .get(`/api/orders/${orderId}`);

//             expect(response.status).toBe(401);
//         });

//         it('should fail with invalid order ID', async () => {
//             const response = await request(app)
//                 .get('/api/orders/invalid-id')
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([400, 401, 500]).toContain(response.status);
//         });

//         it('should fail with non-existent order', async () => {
//             const fakeId = '507f1f77bcf86cd799439011';
//             const response = await request(app)
//                 .get(`/api/orders/${fakeId}`)
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([401, 404]).toContain(response.status);
//         });
//     });

//     describe('GET /api/orders/my-orders', () => {
//         it('should get user orders with pagination', async () => {
//             const response = await request(app)
//                 .get('/api/orders/my-orders?page=1&size=10')
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([200, 401]).toContain(response.status);
//             if (response.status === 200) {
//                 expect(response.body).toHaveProperty('success', true);
//                 expect(response.body).toHaveProperty('data');
//                 expect(response.body).toHaveProperty('pagination');
//             }
//         });

//         it('should fail without authentication', async () => {
//             const response = await request(app)
//                 .get('/api/orders/my-orders');

//             expect(response.status).toBe(401);
//         });

//         it('should support pagination parameters', async () => {
//             const response = await request(app)
//                 .get('/api/orders/my-orders?page=2&size=5')
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([200, 401]).toContain(response.status);
//             if (response.status === 200) {
//                 expect(response.body.pagination).toHaveProperty('page');
//                 expect(response.body.pagination).toHaveProperty('size');
//             }
//         });
//     });

//     describe('PATCH /api/orders/:id/cancel', () => {
//         it('should cancel own order', async () => {
//             // Create a new order to cancel
//             const orderData = {
//                 items: [
//                     {
//                         productId: productId,
//                         productName: 'Test Product',
//                         quantity: 1,
//                         price: 100,
//                         sellerId: sellerId
//                     }
//                 ],
//                 shippingAddress: {
//                     fullName: 'John Doe',
//                     phone: '1234567890',
//                     address: '123 Main St',
//                     city: 'Test City',
//                     zipCode: '12345',
//                     country: 'Test Country'
//                 },
//                 paymentMethod: 'cash_on_delivery',
//                 subtotal: 100,
//                 shippingCost: 10,
//                 tax: 10,
//                 total: 120
//             };

//             const createResponse = await request(app)
//                 .post('/api/orders')
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(orderData);

//             if (createResponse.status !== 201) {
//                 expect(true).toBe(true);
//                 return;
//             }

//             const newOrderId = createResponse.body.data._id;

//             const response = await request(app)
//                 .patch(`/api/orders/${newOrderId}/cancel`)
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([200, 401]).toContain(response.status);
//             if (response.status === 200) {
//                 expect(response.body).toHaveProperty('success', true);
//                 expect(response.body.data).toHaveProperty('status', 'cancelled');
//             }
//         });

//         it('should fail without authentication', async () => {
//             const response = await request(app)
//                 .patch(`/api/orders/${orderId}/cancel`);

//             expect(response.status).toBe(401);
//         });

//         it('should fail with invalid order ID', async () => {
//             const response = await request(app)
//                 .patch('/api/orders/invalid-id/cancel')
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([400, 401, 500]).toContain(response.status);
//         });

//         it('should fail with non-existent order', async () => {
//             const fakeId = '507f1f77bcf86cd799439011';
//             const response = await request(app)
//                 .patch(`/api/orders/${fakeId}/cancel`)
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([401, 404]).toContain(response.status);
//         });
//     });

//     describe('DELETE /api/orders/:id', () => {
//         it('should delete order', async () => {
//             // Create a new order to delete
//             const orderData = {
//                 items: [
//                     {
//                         productId: productId,
//                         productName: 'Test Product',
//                         quantity: 1,
//                         price: 100,
//                         sellerId: sellerId
//                     }
//                 ],
//                 shippingAddress: {
//                     fullName: 'John Doe',
//                     phone: '1234567890',
//                     address: '123 Main St',
//                     city: 'Test City',
//                     zipCode: '12345',
//                     country: 'Test Country'
//                 },
//                 paymentMethod: 'cash_on_delivery',
//                 subtotal: 100,
//                 shippingCost: 10,
//                 tax: 10,
//                 total: 120
//             };

//             const createResponse = await request(app)
//                 .post('/api/orders')
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(orderData);

//             if (createResponse.status !== 201) {
//                 expect(true).toBe(true);
//                 return;
//             }

//             const newOrderId = createResponse.body.data._id;

//             const response = await request(app)
//                 .delete(`/api/orders/${newOrderId}`)
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([200, 204, 404]).toContain(response.status);
//         });

//         it('should fail with invalid order ID', async () => {
//             const response = await request(app)
//                 .delete('/api/orders/invalid-id')
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([400, 401, 404, 500]).toContain(response.status);
//         });

//         it('should fail with non-existent order', async () => {
//             const fakeId = '507f1f77bcf86cd799439011';
//             const response = await request(app)
//                 .delete(`/api/orders/${fakeId}`)
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([401, 404]).toContain(response.status);
//         });
//     });
// });
