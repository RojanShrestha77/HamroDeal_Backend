import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';
import { BlogModel } from '../../models/blog.model';

describe('Blog Integration Tests', () => {
    let authToken: string;
    let testBlogId: string;
    const testUser = {
        firstName: 'Blog',
        lastName: 'Author',
        email: 'blog@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        username: 'blogauthor'
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
        await BlogModel.deleteMany({ title: /Test Blog/ });
    });

    describe('POST /api/blogs', () => {
        test('should create blog', async () => {
            const blogData = {
                title: 'Test Blog 1',
                content: 'This is test blog content',
                author: 'Test Author'
            };

            const response = await request(app)
                .post('/api/blogs')
                .set('Authorization', `Bearer ${authToken}`)
                .send(blogData);
            
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('success', true);
            testBlogId = response.body.data._id;
        });
    });

    describe('GET /api/blogs', () => {
        test('should get all blogs', async () => {
            const response = await request(app).get('/api/blogs');
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body.data)).toBe(true);
        });
    });

    describe('GET /api/blogs/:id', () => {
        test('should get single blog', async () => {
            const response = await request(app)
                .get(`/api/blogs/${testBlogId}`);
            
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('_id', testBlogId);
        });
    });

    // describe('PUT /api/blogs/:id', () => {
    //     test('should update blog', async () => {
    //         const updateData = {
    //             title: 'Updated Test Blog',
    //             content: 'Updated content'
    //         };

    //         const response = await request(app)
    //             .put(`/api/blogs/${testBlogId}`)
    //             .set('Authorization', `Bearer ${authToken}`)
    //             .send(updateData);
            
    //         expect(response.status).toBe(200);
    //         expect(response.body).toHaveProperty('success', true);
    //     });
    // });
});
