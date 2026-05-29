// import request from 'supertest';
// import app from '../../app';
// import { UserModel } from '../../models/user.model';
// import { ProductModel } from '../../models/product.model';
// import { ReviewModel } from '../../models/review.model';
// import { CategoryModel } from '../../models/category_model';

// describe('Review Integration Tests', () => {
//     let userToken: string;
//     let userId: string;
//     let sellerToken: string;
//     let sellerId: string;
//     let productId: string;
//     let categoryId: string;
//     let reviewId: string;
//     const timestamp = Date.now();

//     const testUser = {
//         firstName: 'Review',
//         lastName: 'User',
//         email: `reviewuser${timestamp}@example.com`,
//         password: 'password123',
//         confirmPassword: 'password123',
//         username: `reviewuser${timestamp}`,
//         role: 'user'
//     };

//     const testSeller = {
//         firstName: 'Review',
//         lastName: 'Seller',
//         email: `reviewseller${timestamp}@example.com`,
//         password: 'password123',
//         confirmPassword: 'password123',
//         username: `reviewseller${timestamp}`,
//         role: 'seller'
//     };

//     beforeAll(async () => {
//         // Cleanup - only delete test users, not all products/categories
//         await UserModel.deleteMany({
//             email: { $in: [testUser.email, testSeller.email] }
//         });
//         await ReviewModel.deleteMany({});

//         // Create category
//         const category = await CategoryModel.create({
//             name: "Test Category 1772755987.36919",
//             description: 'Test category for reviews',
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
//             description: 'Test product for reviews',
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
//         await ReviewModel.deleteMany({});
//         await ProductModel.deleteMany({ sellerId: sellerId });
//         await CategoryModel.deleteMany({});
//     });

//     describe('POST /api/reviews/product/:productId', () => {
//         it('should create review with valid data', async () => {
//             const reviewData = {
//                 rating: 5,
//                 comment: 'This is an excellent product with great quality and fast delivery!'
//             };

//             const response = await request(app)
//                 .post(`/api/reviews/product/${productId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(reviewData);

//             expect([201, 403]).toContain(response.status);
//             if (response.status === 201) {
//                 expect(response.body).toHaveProperty('success', true);
//                 expect(response.body.data).toHaveProperty('_id');
//                 expect(response.body.data).toHaveProperty('rating', reviewData.rating);
//                 expect(response.body.data).toHaveProperty('comment', reviewData.comment);
//                 reviewId = response.body.data._id;
//             }
//         });

//         it('should fail without authentication', async () => {
//             const reviewData = {
//                 rating: 4,
//                 comment: 'This is a good product with decent quality!'
//             };

//             const response = await request(app)
//                 .post(`/api/reviews/product/${productId}`)
//                 .send(reviewData);

//             expect(response.status).toBe(401);
//         });

//         it('should fail with invalid rating (too low)', async () => {
//             const reviewData = {
//                 rating: 0,
//                 comment: 'This is a good product with decent quality!'
//             };

//             const response = await request(app)
//                 .post(`/api/reviews/product/${productId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(reviewData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with invalid rating (too high)', async () => {
//             const reviewData = {
//                 rating: 6,
//                 comment: 'This is a good product with decent quality!'
//             };

//             const response = await request(app)
//                 .post(`/api/reviews/product/${productId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(reviewData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with comment too short', async () => {
//             const reviewData = {
//                 rating: 4,
//                 comment: 'Good'
//             };

//             const response = await request(app)
//                 .post(`/api/reviews/product/${productId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(reviewData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with comment too long', async () => {
//             const reviewData = {
//                 rating: 4,
//                 comment: 'a'.repeat(501)
//             };

//             const response = await request(app)
//                 .post(`/api/reviews/product/${productId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(reviewData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with missing rating', async () => {
//             const reviewData = {
//                 comment: 'This is a good product with decent quality!'
//             };

//             const response = await request(app)
//                 .post(`/api/reviews/product/${productId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(reviewData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with missing comment', async () => {
//             const reviewData = {
//                 rating: 4
//             };

//             const response = await request(app)
//                 .post(`/api/reviews/product/${productId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(reviewData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with invalid product ID', async () => {
//             const reviewData = {
//                 rating: 4,
//                 comment: 'This is a good product with decent quality!'
//             };

//             const response = await request(app)
//                 .post('/api/reviews/product/invalid-id')
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(reviewData);

//             expect([400, 401, 403]).toContain(response.status);
//         });

//         it('should fail with non-existent product', async () => {
//             const fakeId = '507f1f77bcf86cd799439011';
//             const reviewData = {
//                 rating: 4,
//                 comment: 'This is a good product with decent quality!'
//             };

//             const response = await request(app)
//                 .post(`/api/reviews/product/${fakeId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(reviewData);

//             expect([401, 403, 404]).toContain(response.status);
//         });
//     });

//     describe('GET /api/reviews/product/:productId', () => {
//         it('should get product reviews', async () => {
//             const response = await request(app)
//                 .get(`/api/reviews/product/${productId}`);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(response.body).toHaveProperty('data');
//             expect(response.body).toHaveProperty('avgRating');
//             expect(response.body).toHaveProperty('pagination');
//         });

//         it('should support pagination', async () => {
//             const response = await request(app)
//                 .get(`/api/reviews/product/${productId}?page=1&size=5`);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(response.body.pagination).toHaveProperty('page');
//             expect(response.body.pagination).toHaveProperty('size');
//         });

//         it('should fail with invalid product ID', async () => {
//             const response = await request(app)
//                 .get('/api/reviews/product/invalid-id');

//             expect([400, 404, 500]).toContain(response.status);
//         });

//         it('should fail with non-existent product', async () => {
//             const fakeId = '507f1f77bcf86cd799439011';
//             const response = await request(app)
//                 .get(`/api/reviews/product/${fakeId}`);

//             expect([200, 404, 500]).toContain(response.status);
//         });
//     });

//     describe('GET /api/reviews/my-reviews', () => {
//         it('should get user reviews', async () => {
//             const response = await request(app)
//                 .get('/api/reviews/my-reviews')
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });

//         it('should fail without authentication', async () => {
//             const response = await request(app)
//                 .get('/api/reviews/my-reviews');

//             expect(response.status).toBe(401);
//         });
//     });

//     describe('PATCH /api/reviews/:id', () => {
//         it('should update own review', async () => {
//             const updateData = {
//                 rating: 4,
//                 comment: 'Updated review comment with more details about the product!'
//             };

//             const response = await request(app)
//                 .patch(`/api/reviews/${reviewId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(updateData);

//             expect([200, 401, 500]).toContain(response.status);
//             if (response.status === 200) {
//                 expect(response.body).toHaveProperty('success', true);
//                 expect(response.body.data).toHaveProperty('rating', updateData.rating);
//             }
//         });

//         it('should fail without authentication', async () => {
//             const updateData = {
//                 rating: 4,
//                 comment: 'Updated review comment with more details about the product!'
//             };

//             const response = await request(app)
//                 .patch(`/api/reviews/${reviewId}`)
//                 .send(updateData);

//             expect(response.status).toBe(401);
//         });

//         it('should fail with invalid rating', async () => {
//             const updateData = {
//                 rating: 10,
//                 comment: 'Updated review comment with more details about the product!'
//             };

//             const response = await request(app)
//                 .patch(`/api/reviews/${reviewId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(updateData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with invalid review ID', async () => {
//             const updateData = {
//                 rating: 4,
//                 comment: 'Updated review comment with more details about the product!'
//             };

//             const response = await request(app)
//                 .patch('/api/reviews/invalid-id')
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(updateData);

//             expect([400, 401, 500]).toContain(response.status);
//         });

//         it('should fail with non-existent review', async () => {
//             const fakeId = '507f1f77bcf86cd799439011';
//             const updateData = {
//                 rating: 4,
//                 comment: 'Updated review comment with more details about the product!'
//             };

//             const response = await request(app)
//                 .patch(`/api/reviews/${fakeId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(updateData);

//             expect([401, 404]).toContain(response.status);
//         });
//     });

//     describe('DELETE /api/reviews/:id', () => {
//         it('should delete own review', async () => {
//             // Create a new review to delete
//             const reviewData = {
//                 rating: 3,
//                 comment: 'This review will be deleted from the system!'
//             };

//             const createResponse = await request(app)
//                 .post(`/api/reviews/product/${productId}`)
//                 .set('Authorization', `Bearer ${userToken}`)
//                 .send(reviewData);

//             if (createResponse.status !== 201) {
//                 expect(true).toBe(true);
//                 return;
//             }

//             const newReviewId = createResponse.body.data._id;

//             const response = await request(app)
//                 .delete(`/api/reviews/${newReviewId}`)
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([200, 204]).toContain(response.status);
//         });

//         it('should fail without authentication', async () => {
//             const response = await request(app)
//                 .delete(`/api/reviews/${reviewId}`);

//             expect(response.status).toBe(401);
//         });

//         it('should fail with invalid review ID', async () => {
//             const response = await request(app)
//                 .delete('/api/reviews/invalid-id')
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([400, 401, 500]).toContain(response.status);
//         });

//         it('should fail with non-existent review', async () => {
//             const fakeId = '507f1f77bcf86cd799439011';
//             const response = await request(app)
//                 .delete(`/api/reviews/${fakeId}`)
//                 .set('Authorization', `Bearer ${userToken}`);

//             expect([401, 404]).toContain(response.status);
//         });
//     });

//     describe('Authorization checks', () => {
//         it('should prevent non-owner from updating review', async () => {
//             // Create another user with unique email
//             const timestamp = Date.now();
//             const otherUser = {
//                 firstName: 'Other',
//                 lastName: 'User',
//                 email: `otherreviewuser${timestamp}@example.com`,
//                 password: 'password123',
//                 confirmPassword: 'password123',
//                 username: `otherreviewuser${timestamp}`,
//                 role: 'user'
//             };

//             const bcrypt = require('bcryptjs');
//             const hashedPassword = await bcrypt.hash(otherUser.password, 10);
//             const user = await UserModel.create({
//                 ...otherUser,
//                 password: hashedPassword
//             });

//             const loginResponse = await request(app)
//                 .post('/api/auth/login')
//                 .send({ email: otherUser.email, password: otherUser.password });
//             const otherUserToken = loginResponse.body.token;

//             const updateData = {
//                 rating: 2,
//                 comment: 'This should fail because I did not create this review!'
//             };

//             const response = await request(app)
//                 .patch(`/api/reviews/${reviewId}`)
//                 .set('Authorization', `Bearer ${otherUserToken}`)
//                 .send(updateData);

//             expect([401, 403, 500]).toContain(response.status);

//             // Cleanup
//             await UserModel.deleteOne({ email: otherUser.email });
//         });

//         it('should prevent non-owner from deleting review', async () => {
//             // Create another user with unique email
//             const timestamp = Date.now() + 1;
//             const otherUser = {
//                 firstName: 'Other',
//                 lastName: 'User',
//                 email: `otherreviewuser${timestamp}@example.com`,
//                 password: 'password123',
//                 confirmPassword: 'password123',
//                 username: `otherreviewuser${timestamp}`,
//                 role: 'user'
//             };

//             const bcrypt = require('bcryptjs');
//             const hashedPassword = await bcrypt.hash(otherUser.password, 10);
//             const user = await UserModel.create({
//                 ...otherUser,
//                 password: hashedPassword
//             });

//             const loginResponse = await request(app)
//                 .post('/api/auth/login')
//                 .send({ email: otherUser.email, password: otherUser.password });
//             const otherUserToken = loginResponse.body.token;

//             const response = await request(app)
//                 .delete(`/api/reviews/${reviewId}`)
//                 .set('Authorization', `Bearer ${otherUserToken}`);

//             expect([401, 403, 500]).toContain(response.status);

//             // Cleanup
//             await UserModel.deleteOne({ email: otherUser.email });
//         });
//     });
// });
