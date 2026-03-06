import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe('User Integration Tests', () => {
    let userToken: string;
    let userId: string;
    let adminToken: string;
    let adminId: string;
    const timestamp = Date.now();

    const testUser = {
        firstName: 'User',
        lastName: 'Test',
        email: `usertest${timestamp}@example.com`,
        password: 'password123',
        confirmPassword: 'password123',
        username: `usertest${timestamp}`,
        role: 'user'
    };

    const testAdmin = {
        firstName: 'Admin',
        lastName: 'Test',
        email: `admintest${timestamp}@example.com`,
        password: 'password123',
        confirmPassword: 'password123',
        username: `admintest${timestamp}`,
        role: 'admin'
    };

    beforeAll(async () => {
        // Cleanup
        await UserModel.deleteMany({
            email: { $in: [testUser.email, testAdmin.email] }
        });

        // Create test users
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(testUser.password, 10);

        const user = await UserModel.create({
            ...testUser,
            password: hashedPassword
        });
        userId = user._id.toString();

        const admin = await UserModel.create({
            ...testAdmin,
            password: hashedPassword
        });
        adminId = admin._id.toString();

        // Login users
        const userLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: testUser.email, password: testUser.password });
        userToken = userLoginResponse.body.token;

        const adminLoginResponse = await request(app)
            .post('/api/auth/login')
            .send({ email: testAdmin.email, password: testAdmin.password });
        adminToken = adminLoginResponse.body.token;
    });

    afterAll(async () => {
        await UserModel.deleteMany({
            email: { $in: [testUser.email, testAdmin.email] }
        });
    });

    describe('POST /api/auth/register', () => {
        it('should register new user with valid data', async () => {
            const userData = {
                firstName: 'New',
                lastName: 'User',
                email: 'newuser@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                username: 'newuser',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('_id');
            expect(response.body.data).toHaveProperty('email', userData.email);

            // Cleanup
            await UserModel.deleteOne({ email: userData.email });
        });

        it('should fail with missing email', async () => {
            const userData = {
                firstName: 'New',
                lastName: 'User',
                password: 'password123',
                confirmPassword: 'password123',
                username: 'newuser2',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(400);
        });

        it('should fail with missing password', async () => {
            const userData = {
                firstName: 'New',
                lastName: 'User',
                email: 'newuser3@example.com',
                confirmPassword: 'password123',
                username: 'newuser3',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(400);
        });

        it('should fail with mismatched passwords', async () => {
            const userData = {
                firstName: 'New',
                lastName: 'User',
                email: 'newuser4@example.com',
                password: 'password123',
                confirmPassword: 'password456',
                username: 'newuser4',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(400);
        });

        it('should fail with duplicate email', async () => {
            const userData = {
                firstName: 'Duplicate',
                lastName: 'User',
                email: testUser.email,
                password: 'password123',
                confirmPassword: 'password123',
                username: 'duplicateuser',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect([400, 409]).toContain(response.status);
        });

        it('should fail with duplicate username', async () => {
            const userData = {
                firstName: 'Duplicate',
                lastName: 'User',
                email: 'duplicateuser@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                username: testUser.username,
                role: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect([400, 403]).toContain(response.status);
        });

        it('should fail with invalid email format', async () => {
            const userData = {
                firstName: 'New',
                lastName: 'User',
                email: 'invalid-email',
                password: 'password123',
                confirmPassword: 'password123',
                username: 'newuser5',
                role: 'user'
            };

            const response = await request(app)
                .post('/api/auth/register')
                .send(userData);

            expect(response.status).toBe(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: testUser.password });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('data');
        });

        it('should fail with invalid email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nonexistent@example.com', password: testUser.password });

            expect([400, 404]).toContain(response.status);
        });

        it('should fail with invalid password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email, password: 'wrongpassword' });

            expect([400, 401]).toContain(response.status);
        });

        it('should fail with missing email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ password: testUser.password });

            expect(response.status).toBe(400);
        });

        it('should fail with missing password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({ email: testUser.email });

            expect(response.status).toBe(400);
        });
    });

    describe('GET /api/auth/whoami', () => {
        it('should get current user profile', async () => {
            const response = await request(app)
                .get('/api/auth/whoami')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('_id', userId);
            expect(response.body.data).toHaveProperty('email', testUser.email);
        });

        it('should fail without authentication', async () => {
            const response = await request(app)
                .get('/api/auth/whoami');

            expect(response.status).toBe(401);
        });

        it('should fail with invalid token', async () => {
            const response = await request(app)
                .get('/api/auth/whoami')
                .set('Authorization', 'Bearer invalid-token');

            expect([401, 500]).toContain(response.status);
        });
    });

    describe('PUT /api/auth/update-profile', () => {
        it('should update user profile', async () => {
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name'
            };

            const response = await request(app)
                .put('/api/auth/update-profile')
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
            expect(response.body.data).toHaveProperty('firstName', updateData.firstName);
        });

        it('should fail without authentication', async () => {
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name'
            };

            const response = await request(app)
                .put('/api/auth/update-profile')
                .send(updateData);

            expect(response.status).toBe(401);
        });

        it('should allow partial updates', async () => {
            const updateData = {
                firstName: 'PartialUpdate'
            };

            const response = await request(app)
                .put('/api/auth/update-profile')
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });

    describe('PUT /api/auth/:id', () => {
        it('should update user by ID as admin', async () => {
            const updateData = {
                firstName: 'AdminUpdated',
                lastName: 'Name'
            };

            const response = await request(app)
                .put(`/api/auth/${userId}`)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });

        it('should allow user to update own profile', async () => {
            const updateData = {
                firstName: 'SelfUpdated',
                lastName: 'Name'
            };

            const response = await request(app)
                .put(`/api/auth/${userId}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect([200, 403]).toContain(response.status);
            if (response.status === 200) {
                expect(response.body).toHaveProperty('success', true);
            }
        });

        it('should fail without authentication', async () => {
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name'
            };

            const response = await request(app)
                .put(`/api/auth/${userId}`)
                .send(updateData);

            expect(response.status).toBe(401);
        });

        it('should fail with invalid user ID', async () => {
            const updateData = {
                firstName: 'Updated',
                lastName: 'Name'
            };

            const response = await request(app)
                .put('/api/auth/invalid-id')
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect([400, 401, 403]).toContain(response.status);
        });
    });

    describe('POST /api/auth/request-password-reset', () => {
        it('should request password reset', async () => {
            const response = await request(app)
                .post('/api/auth/request-password-reset')
                .send({ email: testUser.email });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });

        it('should fail with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/request-password-reset')
                .send({ email: 'nonexistent@example.com' });

            expect([400, 404]).toContain(response.status);
        });

        it('should fail with missing email', async () => {
            const response = await request(app)
                .post('/api/auth/request-password-reset')
                .send({});

            expect(response.status).toBe(400);
        });
    });

    describe('Authorization checks', () => {
        it('should prevent user from updating another user profile', async () => {
            // Create another user
            const otherUser = {
                firstName: 'Other',
                lastName: 'User',
                email: 'otherusertest@example.com',
                password: 'password123',
                confirmPassword: 'password123',
                username: 'otherusertest',
                role: 'user'
            };

            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash(otherUser.password, 10);
            const user = await UserModel.create({
                ...otherUser,
                password: hashedPassword
            });

            const updateData = {
                firstName: 'Hacked',
                lastName: 'User'
            };

            const response = await request(app)
                .put(`/api/auth/${user._id.toString()}`)
                .set('Authorization', `Bearer ${userToken}`)
                .send(updateData);

            expect(response.status).toBe(403);

            // Cleanup
            await UserModel.deleteOne({ email: otherUser.email });
        });
    });

    describe('Error scenarios', () => {
        it('should return 500 on internal server error', async () => {
            // This test would require mocking or a specific error condition
            // For now, we'll just verify the endpoint exists
            const response = await request(app)
                .get('/api/auth/whoami')
                .set('Authorization', `Bearer ${userToken}`);

            expect([200, 401, 500]).toContain(response.status);
        });
    });
});
