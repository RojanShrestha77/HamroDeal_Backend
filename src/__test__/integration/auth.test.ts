import request from 'supertest';
import app from '../../app';
import { UserModel } from '../../models/user.model';

describe(
    'Authentication Integration Tests', // descibe test suite
    () => { // what to run 
        const testUser = { // according to your UserModel
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

        describe(
            'POST /api/auth/register', // nested describe block
            () => {
                test( // actual test case
                    'should register a new user', // test case description
                    async () => { // test case implementation
                        const response = await request(app)
                            .post('/api/auth/register')
                            .send(testUser)
                        
                        expect(response.status).toBe(201);
                        expect(response.body).toHaveProperty(
                            'message', 
                            'User registered successfully'
                        );
                    }
                )
            }
        )
    }
);