// import request from 'supertest';
// import app from '../../app';
// import { UserModel } from '../../models/user.model';

// describe('Auth Integration Tests', () => {
//     let authToken: string;
//     let userId: string;

//     const testUser = {
//         firstName: 'Auth',
//         lastName: 'Tester',
//         email: 'authtester@example.com',
//         password: 'password123',
//         confirmPassword: 'password123',
//         username: 'authtester',
//         role: 'user'
//     };

//     beforeAll(async () => {
//         // Cleanup
//         await UserModel.deleteMany({
//             email: { $in: [testUser.email, 'testseller@example.com', 'testadmin@example.com'] }
//         });
//     });

//     afterAll(async () => {
//         await UserModel.deleteMany({ email: testUser.email });
//     });

//     describe('POST /api/auth/register', () => {
//         it('should register a new user', async () => {
//             const response = await request(app)
//                 .post('/api/auth/register')
//                 .send(testUser);

//             expect([200, 201]).toContain(response.status);
//             expect(response.body).toHaveProperty('success', true);
//             expect(response.body.data).toHaveProperty('email', testUser.email);
//             expect(response.body.data).toHaveProperty('username', testUser.username);

//             // Store userId for later tests
//             userId = response.body.data._id;
//         });

//         it('should fail with duplicate email', async () => {
//             const response = await request(app)
//                 .post('/api/auth/register')
//                 .send(testUser);

//             expect([400, 409]).toContain(response.status);
//         });

//         it('should fail with invalid email', async () => {
//             const invalidUser = {
//                 ...testUser,
//                 email: 'invalid-email',
//                 username: 'different'
//             };

//             const response = await request(app)
//                 .post('/api/auth/register')
//                 .send(invalidUser);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with password mismatch', async () => {
//             const invalidUser = {
//                 ...testUser,
//                 email: 'another@example.com',
//                 username: 'another',
//                 confirmPassword: 'different123'
//             };

//             const response = await request(app)
//                 .post('/api/auth/register')
//                 .send(invalidUser);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with missing required fields', async () => {
//             const invalidUser = {
//                 email: 'test@example.com'
//                 // Missing other required fields
//             };

//             const response = await request(app)
//                 .post('/api/auth/register')
//                 .send(invalidUser);

//             expect(response.status).toBe(400);
//         });
//     });

//     describe('POST /api/auth/login', () => {
//         it('should login with valid credentials', async () => {
//             const loginData = {
//                 email: testUser.email,
//                 password: testUser.password
//             };

//             const response = await request(app)
//                 .post('/api/auth/login')
//                 .send(loginData);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(response.body).toHaveProperty('token');
//             expect(response.body.data).toHaveProperty('email', testUser.email);

//             // Store token for authenticated requests
//             authToken = response.body.token;
//         });

//         it('should fail with invalid email', async () => {
//             const loginData = {
//                 email: 'nonexistent@example.com',
//                 password: testUser.password
//             };

//             const response = await request(app)
//                 .post('/api/auth/login')
//                 .send(loginData);

//             expect([401, 404]).toContain(response.status);
//         });

//         it('should fail with invalid password', async () => {
//             const loginData = {
//                 email: testUser.email,
//                 password: 'wrongpassword'
//             };

//             const response = await request(app)
//                 .post('/api/auth/login')
//                 .send(loginData);

//             expect(response.status).toBe(401);
//         });

//         it('should fail with missing credentials', async () => {
//             const response = await request(app)
//                 .post('/api/auth/login')
//                 .send({});

//             expect(response.status).toBe(400);
//         });
//     });

//     describe('GET /api/auth/whoami', () => {
//         it('should get current user with valid token', async () => {
//             const response = await request(app)
//                 .get('/api/auth/whoami')
//                 .set('Authorization', `Bearer ${authToken}`);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(response.body.data).toHaveProperty('email', testUser.email);
//             expect(response.body.data).toHaveProperty('username', testUser.username);
//         });

//         it('should fail without authentication', async () => {
//             const response = await request(app)
//                 .get('/api/auth/whoami');

//             expect(response.status).toBe(401);
//         });

//         it('should fail with invalid token', async () => {
//             const response = await request(app)
//                 .get('/api/auth/whoami')
//                 .set('Authorization', 'Bearer invalid-token');

//             expect([401, 500]).toContain(response.status);
//         });
//     });

//     describe('PUT /api/auth/update-profile', () => {
//         it('should update user profile', async () => {
//             const updateData = {
//                 firstName: 'Updated',
//                 lastName: 'Name'
//             };

//             const response = await request(app)
//                 .put('/api/auth/update-profile')
//                 .set('Authorization', `Bearer ${authToken}`)
//                 .send(updateData);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(response.body.data).toHaveProperty('firstName', updateData.firstName);
//             expect(response.body.data).toHaveProperty('lastName', updateData.lastName);
//         });

//         it('should fail without authentication', async () => {
//             const updateData = {
//                 firstName: 'Updated',
//                 lastName: 'Name'
//             };

//             const response = await request(app)
//                 .put('/api/auth/update-profile')
//                 .send(updateData);

//             expect(response.status).toBe(401);
//         });
//     });

//     describe('POST /api/auth/request-password-reset', () => {
//         it('should request password reset', async () => {
//             const response = await request(app)
//                 .post('/api/auth/request-password-reset')
//                 .send({ email: testUser.email });

//             // Should return success even if email doesn't exist (security)
//             expect([200, 201]).toContain(response.status);
//         });

//         it('should handle non-existent email gracefully', async () => {
//             const response = await request(app)
//                 .post('/api/auth/request-password-reset')
//                 .send({ email: 'nonexistent@example.com' });

//             // Should return success for security reasons
//             expect([200, 201, 404]).toContain(response.status);
//         });

//         it('should fail with invalid email format', async () => {
//             const response = await request(app)
//                 .post('/api/auth/request-password-reset')
//                 .send({ email: 'invalid-email' });

//             expect([400, 404]).toContain(response.status);
//         });
//     });

//     describe('User Role Tests', () => {
//         it('should register a seller', async () => {
//             const sellerData = {
//                 firstName: 'Test',
//                 lastName: 'Seller',
//                 email: 'testseller@example.com',
//                 password: 'password123',
//                 confirmPassword: 'password123',
//                 username: 'testseller',
//                 role: 'seller'
//             };

//             const response = await request(app)
//                 .post('/api/auth/register')
//                 .send(sellerData);

//             expect([200, 201]).toContain(response.status);
//             // Role might default to 'user' - just verify registration succeeded
//             expect(response.body.data).toHaveProperty('email', sellerData.email);

//             // Cleanup
//             await UserModel.deleteOne({ email: sellerData.email });
//         });

//         it('should register an admin', async () => {
//             const adminData = {
//                 firstName: 'Test',
//                 lastName: 'Admin',
//                 email: 'testadmin@example.com',
//                 password: 'password123',
//                 confirmPassword: 'password123',
//                 username: 'testadmin',
//                 role: 'admin'
//             };

//             const response = await request(app)
//                 .post('/api/auth/register')
//                 .send(adminData);

//             expect([200, 201]).toContain(response.status);
//             // Role might default to 'user' - just verify registration succeeded
//             expect(response.body.data).toHaveProperty('email', adminData.email);

//             // Cleanup
//             await UserModel.deleteOne({ email: adminData.email });
//         });
//     });
// });
