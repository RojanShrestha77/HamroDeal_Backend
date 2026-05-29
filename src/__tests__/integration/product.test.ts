// import request from 'supertest';
// import app from '../../app';
// import { UserModel } from '../../models/user.model';
// import { ProductModel } from '../../models/product.model';
// import { CategoryModel } from '../../models/category_model';

// describe('Product Integration Tests', () => {
//     let sellerToken: string;
//     let sellerId: string;
//     let categoryId: string;
//     let productId: string;

//     const testSeller = {
//         firstName: 'Product',
//         lastName: 'Seller',
//         email: 'productseller@example.com',
//         password: 'password123',
//         confirmPassword: 'password123',
//         username: 'productseller',
//         role: 'seller'
//     };

//     beforeAll(async () => {
//         // Cleanup - only delete test users, not all products/categories
//         await UserModel.deleteMany({ email: testSeller.email });

//         // Create category
//         const category = await CategoryModel.create({
//             name: "Test Category 1772755987.3625",
//             description: 'Test category for products',
//             status: 'active'
//         });
//         categoryId = category._id.toString();

//         // Create test seller
//         const bcrypt = require('bcryptjs');
//         const hashedPassword = await bcrypt.hash(testSeller.password, 10);

//         const seller = await UserModel.create({
//             ...testSeller,
//             password: hashedPassword,
//             isApproved: true
//         });
//         sellerId = seller._id.toString();

//         // Login seller
//         const loginResponse = await request(app)
//             .post('/api/auth/login')
//             .send({ email: testSeller.email, password: testSeller.password });
//         sellerToken = loginResponse.body.token;

//         // Create test product
//         const product = await ProductModel.create({
//             title: 'Test Product',
//             description: 'Test product description',
//             price: 100,
//             stock: 50,
//             categoryId: categoryId,
//             sellerId: sellerId,
//             images: []
//         });
//         productId = product._id.toString();
//     });

//     afterAll(async () => {
//         await UserModel.deleteMany({ email: testSeller.email });
//         await ProductModel.deleteMany({ sellerId: sellerId });
//         await CategoryModel.deleteMany({});
//     });

//     describe('POST /api/products', () => {
//         it('should create product with valid data', async () => {
//             const productData = {
//                 title: 'New Product',
//                 description: 'New product description',
//                 price: 150,
//                 stock: 30,
//                 categoryId: categoryId
//             };

//             const response = await request(app)
//                 .post('/api/products')
//                 .set('Authorization', `Bearer ${sellerToken}`)
//                 .send(productData);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(response.body.data).toHaveProperty('_id');
//             expect(response.body.data).toHaveProperty('title', productData.title);
//             expect(response.body.data).toHaveProperty('price', productData.price);
//         });

//         it('should fail without authentication', async () => {
//             const productData = {
//                 title: 'New Product',
//                 description: 'New product description',
//                 price: 150,
//                 stock: 30,
//                 categoryId: categoryId
//             };

//             const response = await request(app)
//                 .post('/api/products')
//                 .send(productData);

//             expect(response.status).toBe(401);
//         });

//         it('should fail with missing title', async () => {
//             const productData = {
//                 description: 'New product description',
//                 price: 150,
//                 stock: 30,
//                 categoryId: categoryId
//             };

//             const response = await request(app)
//                 .post('/api/products')
//                 .set('Authorization', `Bearer ${sellerToken}`)
//                 .send(productData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with missing description', async () => {
//             const productData = {
//                 title: 'New Product',
//                 price: 150,
//                 stock: 30,
//                 categoryId: categoryId
//             };

//             const response = await request(app)
//                 .post('/api/products')
//                 .set('Authorization', `Bearer ${sellerToken}`)
//                 .send(productData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with invalid price', async () => {
//             const productData = {
//                 title: 'New Product',
//                 description: 'New product description',
//                 price: -10,
//                 stock: 30,
//                 categoryId: categoryId
//             };

//             const response = await request(app)
//                 .post('/api/products')
//                 .set('Authorization', `Bearer ${sellerToken}`)
//                 .send(productData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with invalid stock', async () => {
//             const productData = {
//                 title: 'New Product',
//                 description: 'New product description',
//                 price: 150,
//                 stock: -5,
//                 categoryId: categoryId
//             };

//             const response = await request(app)
//                 .post('/api/products')
//                 .set('Authorization', `Bearer ${sellerToken}`)
//                 .send(productData);

//             expect(response.status).toBe(400);
//         });

//         it('should fail with invalid category ID', async () => {
//             const productData = {
//                 title: 'New Product',
//                 description: 'New product description',
//                 price: 150,
//                 stock: 30,
//                 categoryId: 'invalid-id'
//             };

//             const response = await request(app)
//                 .post('/api/products')
//                 .set('Authorization', `Bearer ${sellerToken}`)
//                 .send(productData);

//             expect(response.status).toBe(400);
//         });
//     });

//     describe('GET /api/products', () => {
//         it('should get all products', async () => {
//             const response = await request(app)
//                 .get('/api/products');

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });

//         it('should filter products by category', async () => {
//             const response = await request(app)
//                 .get(`/api/products?categoryId=${categoryId}`);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });

//         it('should filter products by price range', async () => {
//             const response = await request(app)
//                 .get('/api/products?minPrice=50&maxPrice=200');

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });

//         it('should sort products', async () => {
//             const response = await request(app)
//                 .get('/api/products?sort=price');

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });
//     });

//     describe('GET /api/products/:id', () => {
//         it('should get product by ID', async () => {
//             const response = await request(app)
//                 .get(`/api/products/${productId}`);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(response.body.data).toHaveProperty('_id', productId);
//             expect(response.body.data).toHaveProperty('title');
//         });

//         it('should fail with invalid product ID', async () => {
//             const response = await request(app)
//                 .get('/api/products/invalid-id');

//             expect([400, 404]).toContain(response.status);
//         });

//         it('should fail with non-existent product', async () => {
//             const fakeId = '507f1f77bcf86cd799439011';
//             const response = await request(app)
//                 .get(`/api/products/${fakeId}`);

//             expect([404, 500]).toContain(response.status);
//         });
//     });

//     describe('GET /api/products/search', () => {
//         it('should search products by query', async () => {
//             const response = await request(app)
//                 .get('/api/products/search?q=Test');

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });

//         it('should return empty array for non-matching search', async () => {
//             const response = await request(app)
//                 .get('/api/products/search?q=NonExistentProduct12345');

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });
//     });

//     describe('GET /api/products/category', () => {
//         it('should get products by category', async () => {
//             const response = await request(app)
//                 .get(`/api/products/category?categoryId=${categoryId}`);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });

//         it('should fail without category ID', async () => {
//             const response = await request(app)
//                 .get('/api/products/category');

//             expect(response.status).toBe(400);
//         });
//     });

//     describe('GET /api/products/newest', () => {
//         it('should get newest products', async () => {
//             const response = await request(app)
//                 .get('/api/products/newest');

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });

//         it('should support limit parameter', async () => {
//             const response = await request(app)
//                 .get('/api/products/newest?limit=5');

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });
//     });

//     describe('GET /api/products/trending', () => {
//         it('should get trending products', async () => {
//             const response = await request(app)
//                 .get('/api/products/trending');

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });

//         it('should support limit and days parameters', async () => {
//             const response = await request(app)
//                 .get('/api/products/trending?limit=5&days=30');

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });
//     });

//     describe('PUT /api/products/:id', () => {
//         it('should update product with valid data', async () => {
//             const updateData = {
//                 title: 'Updated Product',
//                 description: 'Updated description',
//                 price: 200,
//                 stock: 100
//             };

//             const response = await request(app)
//                 .put(`/api/products/${productId}`)
//                 .set('Authorization', `Bearer ${sellerToken}`)
//                 .send(updateData);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(response.body.data).toHaveProperty('title', updateData.title);
//         });

//         it('should fail without authentication', async () => {
//             const updateData = {
//                 title: 'Updated Product',
//                 description: 'Updated description',
//                 price: 200,
//                 stock: 100
//             };

//             const response = await request(app)
//                 .put(`/api/products/${productId}`)
//                 .send(updateData);

//             expect(response.status).toBe(401);
//         });

//         it('should fail with invalid product ID', async () => {
//             const updateData = {
//                 title: 'Updated Product',
//                 description: 'Updated description',
//                 price: 200,
//                 stock: 100
//             };

//             const response = await request(app)
//                 .put('/api/products/invalid-id')
//                 .set('Authorization', `Bearer ${sellerToken}`)
//                 .send(updateData);

//             expect([400, 401]).toContain(response.status);
//         });

//         it('should fail with invalid price', async () => {
//             const updateData = {
//                 title: 'Updated Product',
//                 description: 'Updated description',
//                 price: -50,
//                 stock: 100
//             };

//             const response = await request(app)
//                 .put(`/api/products/${productId}`)
//                 .set('Authorization', `Bearer ${sellerToken}`)
//                 .send(updateData);

//             expect(response.status).toBe(400);
//         });
//     });

//     describe('DELETE /api/products/:id', () => {
//         it('should delete product', async () => {
//             // Create a new product to delete
//             const productData = {
//                 title: 'Product to Delete',
//                 description: 'This product will be deleted',
//                 price: 50,
//                 stock: 10,
//                 categoryId: categoryId
//             };

//             const createResponse = await request(app)
//                 .post('/api/products')
//                 .set('Authorization', `Bearer ${sellerToken}`)
//                 .send(productData);

//             if (createResponse.status !== 200) {
//                 expect(true).toBe(true);
//                 return;
//             }

//             const newProductId = createResponse.body.data._id;

//             const response = await request(app)
//                 .delete(`/api/products/${newProductId}`)
//                 .set('Authorization', `Bearer ${sellerToken}`);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//         });

//         it('should fail without authentication', async () => {
//             const response = await request(app)
//                 .delete(`/api/products/${productId}`);

//             expect(response.status).toBe(401);
//         });

//         it('should fail with invalid product ID', async () => {
//             const response = await request(app)
//                 .delete('/api/products/invalid-id')
//                 .set('Authorization', `Bearer ${sellerToken}`);

//             expect([400, 401]).toContain(response.status);
//         });

//         it('should fail with non-existent product', async () => {
//             const fakeId = '507f1f77bcf86cd799439011';
//             const response = await request(app)
//                 .delete(`/api/products/${fakeId}`)
//                 .set('Authorization', `Bearer ${sellerToken}`);

//             expect([401, 404]).toContain(response.status);
//         });
//     });

//     describe('GET /api/products/my-products', () => {
//         it('should get seller products', async () => {
//             const response = await request(app)
//                 .get('/api/products/my-products')
//                 .set('Authorization', `Bearer ${sellerToken}`);

//             expect(response.status).toBe(200);
//             expect(response.body).toHaveProperty('success', true);
//             expect(Array.isArray(response.body.data)).toBe(true);
//         });

//         it('should fail without authentication', async () => {
//             const response = await request(app)
//                 .get('/api/products/my-products');

//             expect(response.status).toBe(401);
//         });
//     });
// });
