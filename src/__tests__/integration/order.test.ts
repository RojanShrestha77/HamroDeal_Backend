import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { ProductModel } from '../../models/product.model';
import { OrderModel } from '../../models/order.model';

describe('Order Integration Tests', () => {
    let authToken: string;
    let testOrderId: string;
    const testUser = {
        firstName: 'Order',
        lastName: 'User',
        email: 'order@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: 'orderuser'
    };

    beforeAll(async () => {
        // Create user and login
        await UserModel.deleteMany({ email: testUser.email });
        await request(app).post('/api/auth/register').send(testUser);
        
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        authToken = loginResponse.body.token;
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
        await OrderModel.deleteMany({});
    });

    // describe('POST /api/orders', () => {
    //     test('should create order', async () => {
    //         const orderData = {
    //             items: [
    //                 {
    //                     productId: '507f1f77bcf86cd799439011',
    //                     quantity: 2,
    //                     price: 100
    //                 }
    //             ],
    //             totalAmount: 200,
    //             shippingAddress: {
    //                 street: '123 Test St',
    //                 city: 'Test City',
    //                 state: 'Test State',
    //                 zipCode: '12345'
    //             }
    //         };

    //         const response = await request(app)
    //             .post('/api/orders')
    //             .set('Authorization', `Bearer ${authToken}`)
    //             .send(orderData);
            
    //         expect(response.status).toBe(201);
    //         expect(response.body).toHaveProperty('success', true);
    //         testOrderId = response.body.data._id;
    //     });
    // });

    describe('GET /api/orders/my-orders', () => {
        test('should get user orders', async () => {
            const response = await request(app)
                .get('/api/orders/my-orders')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    // describe('GET /api/orders/:id', () => {
    //     test('should get single order details', async () => {
    //         const response = await request(app)
    //             .get(`/api/orders/${testOrderId}`)
    //             .set('Authorization', `Bearer ${authToken}`);
            
    //         expect(response.status).toBe(200);
    //         expect(response.body.data).toHaveProperty('_id', testOrderId);
    //     });
    // });

    // describe('PATCH /api/orders/:id/cancel', () => {
    //     test('should cancel order', async () => {
    //         const response = await request(app)
    //             .patch(`/api/orders/${testOrderId}/cancel`)
    //             .set('Authorization', `Bearer ${authToken}`);
            
    //         expect(response.status).toBe(200);
    //         expect(response.body).toHaveProperty('success', true);
    //     });

    //     test('should fail to cancel already cancelled order', async () => {
    //         const response = await request(app)
    //             .patch(`/api/orders/${testOrderId}/cancel`)
    //             .set('Authorization', `Bearer ${authToken}`);
            
    //         expect(response.status).toBe(400);
    //     });
    // });
});
