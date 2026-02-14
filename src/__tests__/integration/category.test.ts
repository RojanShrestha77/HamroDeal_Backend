import request from 'supertest';
import app from '../../app';
import { CategoryModel } from '../../models/category_model';  // Note: category_model not category.model

describe('Category Integration Tests', () => {
    let testCategoryId: string;

    afterAll(async () => {
        await CategoryModel.deleteMany({ name: /Test Category/ });
    });

    describe('POST /api/categories', () => {
        test('should create category', async () => {
            const categoryData = {
                name: 'Test Category 1',
                description: 'Test category description'
            };

            const response = await request(app)
                .post('/api/categories')
                .send(categoryData);
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            testCategoryId = response.body.data._id;
        });
    });

    describe('GET /api/categories', () => {
        test('should get all categories', async () => {
            const response = await request(app).get('/api/categories');
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/categories/:id', () => {
        test('should get single category by id', async () => {
            const response = await request(app)
                .get(`/api/categories/${testCategoryId}`);
            
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('_id', testCategoryId);
        });
    });

    describe('DELETE /api/categories/:id', () => {
        test('should delete category', async () => {
            const response = await request(app)
                .delete(`/api/categories/${testCategoryId}`);
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('success', true);
        });
    });
});
