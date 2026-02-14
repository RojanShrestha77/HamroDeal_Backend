import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('Authentication Integration Tests', () => {
    const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: 'testuser'
    }

    beforeAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
    });

    afterAll(async () => {
        await UserModel.deleteMany({ email: testUser.email });
    });

    describe('POST /api/auth/register', () => {
        test('should register a new user', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send(testUser);
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'Register Successful');
            expect(response.body).toHaveProperty('success', true);
        });
    });

    describe('POST /api/auth/login', () => {
        test('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('success', true);
        });

        test('should fail login with invalid password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });
            
            expect(response.status).toBe(401);
            expect(response.body).toHaveProperty('success', false);
        });

        test('should fail login with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });
            
            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('success', false);
        });
    });

    describe('GET /api/auth/whoami', () => {
        test('should get current user with valid token', async () => {
            // First login to get token
            const loginResponse = await request(app)
                .post('/api/auth/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            
            const token = loginResponse.body.token;

            // Then get user info
            const response = await request(app)
                .get('/api/auth/whoami')
                .set('Authorization', `Bearer ${token}`);
            
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('email', testUser.email);
        });
    });
});
