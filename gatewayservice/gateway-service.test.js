const request = require('supertest');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const app = require('./gateway-service');

// Close the server after all tests
afterAll(async () => {
    app.close();
});

// Mock axios to prevent actual API calls
jest.mock('axios');

describe('Gateway Service', () => {
    const token = jwt.sign("mockToken", "accessTokenSecret");
    const invalidToken = 'invalidtoken';

    beforeEach(() => {
        axios.post.mockImplementation((url, data) => {
            if (url.endsWith('/login')) {
                return Promise.resolve({
                    data: { accessToken: 'mockedToken' },
                    headers: { "set-cookie": ["refreshToken=mockRefreshToken"] }
                });
            } else if (url.endsWith('/logout')) {
                return Promise.resolve({
                    data: { message: 'Logged out successfully' },
                    headers: { "set-cookie": ["jwt=; Max-Age=0"] }
                });
            } else if (url.endsWith('/adduser')) {
                return Promise.resolve({ data: { userId: 'mockedUserId' } });
            } else if (url.endsWith('/ask')) {
                return Promise.resolve({ data: { answer: 'llmanswer' } });
            } else if (url.endsWith('/load')) {
                return Promise.resolve({ data: { status: 'questions loaded' } });
            } else if (url.endsWith('/addgame')) {
                return Promise.resolve({ data: { message: 'Game added successfully' } });
            }
        });

        axios.get.mockImplementation((url) => {
            if (url.endsWith('/getRound')) {
                return Promise.resolve({ data: { round: 'mockedRoundData' } });
            } else if (url.endsWith('/refresh')) {
                return Promise.resolve({ data: { accessToken: 'mockedToken' } });
            } else if (url.endsWith('/getTopics')) {
                return Promise.resolve({ data: { modes: ['city', 'athlete'] } });
            } else if (url.endsWith('/userstats/user/testuser')) {
                return Promise.resolve({ data: { message: 'Fetched user statistics for user: testuser' } });
            } else if (url.endsWith('/userstats/mode/flag')) {
                return Promise.resolve({ data: { message: 'Fetched statistics for mode: flag' } });
            } else if (url.endsWith('/userstats/testuser/flag')) {
                return Promise.resolve({ data: { message: 'Fetched statistics for user testuser in mode flag' } });
            }
        });
    });

    // Test /health endpoint
    it('should return status OK for health check', async () => {
        const response = await request(app).get('/health');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: 'OK' });
    });

    // Test /login endpoint
    it('should forward login request to auth service', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: 'testuser', password: 'testpassword' });

        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBe('mockedToken');
    });

    // Test login error handling
    it('should handle errors from login endpoint', async () => {
        axios.post.mockImplementationOnce((url) => {
            if (url.endsWith('/login')) {
                return Promise.reject({
                    response: {
                        status: 401,
                        data: { error: 'Invalid credentials' }
                    }
                });
            }
        });

        const response = await request(app)
            .post('/login')
            .send({ username: 'baduser', password: 'badpassword' });
        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Invalid credentials');
    });

    // Test /logout endpoint
    it('should forward logout request to auth service', async () => {
        const response = await request(app).post('/logout')

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Logged out successfully');
    });

    // Test logout error handling
    it('should handle errors from logout endpoint', async () => {
        axios.post.mockImplementationOnce((url) => {
            if (url.endsWith('/logout')) {
                return Promise.reject({
                    response: {
                        status: 500,
                        data: { error: 'Server error' }
                    }
                });
            }
        });

        const response = await request(app).post('/logout');
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('Server error');
    });


    // Test /refresh endpoint
    it('should return a new access token', async () => {
        const response = await request(app).get('/refresh');

        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBe('mockedToken');
    });

    // Test refresh error handling
    it('should handle errors from refresh endpoint', async () => {
        axios.get.mockImplementationOnce((url) => {
            if (url.endsWith('/refresh')) {
                return Promise.reject({
                    response: {
                        status: 401,
                        data: { error: 'Invalid refresh token' }
                    }
                });
            }
        });

        const response = await request(app).get('/refresh');
        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Invalid refresh token');
    });

    // Test /adduser endpoint
    it('should forward add user request to user service', async () => {
        const response = await request(app)
            .post('/adduser')
            .send({ username: 'newuser', password: 'newpassword' });

        expect(response.statusCode).toBe(200);
        expect(response.body.userId).toBe('mockedUserId');
    });

    // Test adduser error handling
    it('should handle errors from adduser endpoint', async () => {
        axios.post.mockImplementationOnce((url) => {
            if (url.endsWith('/adduser')) {
                return Promise.reject({
                    response: {
                        status: 409,
                        data: { error: 'User already exists' }
                    }
                });
            }
        });

        const response = await request(app)
            .post('/adduser')
            .send({ username: 'existinguser', password: 'password' });
        expect(response.statusCode).toBe(409);
        expect(response.body.error).toBe('User already exists');
    });

    // Test JWT verification failure
    it('should return 401 when no authorization header is provided', async () => {
        const response = await request(app).get('/getRound');
        expect(response.statusCode).toBe(401);
        expect(response.body.error).toBe('Unauthorized');
    });

    // Test JWT invalid token
    it('should return 403 when an invalid token is provided', async () => {
        const response = await request(app)
            .get('/getRound')
            .set('Authorization', `Bearer ${invalidToken}`);
        expect(response.statusCode).toBe(403);
        expect(response.body.error).toBe('Invalid token');
    });



    // Test /askllm endpoint
    it('should forward askllm request to the llm service', async () => {
        const response = await request(app)
            .post('/askllm')
            .set('Authorization', `Bearer ${token}`)
            .send({ question: 'question', apiKey: 'apiKey', model: 'gemini' });

        expect(response.statusCode).toBe(200);
        expect(response.body.answer).toBe('llmanswer');
    });

    // Test askllm error handling
    it('should handle errors from askllm endpoint', async () => {
        axios.post.mockImplementationOnce((url) => {
            if (url.endsWith('/ask')) {
                return Promise.reject({
                    response: {
                        status: 500,
                        data: { error: 'LLM service error' }
                    }
                });
            }
        });

        const response = await request(app)
            .post('/askllm')
            .set('Authorization', `Bearer ${token}`)
            .send({ question: 'question', apiKey: 'apiKey' });
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('LLM service error');
    });

    // Test /loadQuestion endpoint
    it('should forward loadQuestion request to the question service', async () => {
        const response = await request(app)
            .post('/loadQuestion')
            .set('Authorization', `Bearer ${token}`)
            .send({ modes: ['city', 'athlete'] });

        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('questions loaded');
    });

    // Test loadQuestion error handling 
    it('should handle errors from loadQuestion endpoint', async () => {
        axios.post.mockImplementationOnce((url) => {
            if (url.endsWith('/load')) {
                return Promise.reject({
                    response: {
                        status: 500
                    }
                });
            }
        });

        const response = await request(app)
            .post('/loadQuestion')
            .set('Authorization', `Bearer ${token}`)
            .send({ modes: ['city', 'athlete'] });
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('Error fetching question data');
    });

    // Test loadQuestion with invalid modes 
    it('should return 400 when modes parameter is invalid', async () => {
        const response = await request(app)
            .post('/loadQuestion')
            .set('Authorization', `Bearer ${token}`)
            .send({ modes: 'not-an-array' });
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('Invalid modes parameter');
    });

    // Test /getRound endpoint
    it('should fetch round data from the question service', async () => {
        const response = await request(app).get('/getRound').set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.round).toBe('mockedRoundData');
    });

    // Test getRound error handling 
    it('should handle errors from getRound endpoint', async () => {
        axios.get.mockImplementationOnce((url) => {
            if (url.endsWith('/getRound')) {
                return Promise.reject({
                    response: {
                        status: 500,
                        data: { error: 'Question service error' }
                    }
                });
            }
        });

        const response = await request(app)
            .get('/getRound')
            .set('Authorization', `Bearer ${token}`);
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('Question service error');
    });

    // Test /getTopics endpoint
    it('should fetch topics from the question service', async () => {
        const response = await request(app).get('/getTopics').set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.modes).toEqual(['city', 'athlete']);
    });

    // Test /addgame endpoint 
    it('should forward addgame request to the user service', async () => {
        const response = await request(app)
            .post('/addgame')
            .set('Authorization', `Bearer ${token}`)
            .send({ username: 'testuser', score: 100 });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Game added successfully');
    });

    // Test addgame error handling
    it('should handle errors from addgame endpoint', async () => {
        axios.post.mockImplementationOnce((url) => {
            if (url.endsWith('/addgame')) {
                return Promise.reject({
                    response: {
                        status: 500,
                        data: { error: 'User service error' }
                    }
                });
            }
        });

        const response = await request(app)
            .post('/addgame')
            .set('Authorization', `Bearer ${token}`)
            .send({ username: 'testuser', score: 100 });
        expect(response.statusCode).toBe(500);
        expect(response.body.error).toBe('User service error');
    });

    // Test /userstats/user/:username endpoint
    it('should fetch user statistics for a specific user from the user service', async () => {
        const response = await request(app).get('/userstats/user/testuser').set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Fetched user statistics for user: testuser');
    });

    // Test /userstats/mode/:mode endpoint
    it('should fetch user statistics for a specific game mode from the user service', async () => {
        const response = await request(app).get('/userstats/mode/flag').set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Fetched statistics for mode: flag');
    });

    // Test /userstats/:username/:mode endpoint
    it('should fetch user statistics for a specific user and game mode from the user service', async () => {
        const response = await request(app).get('/userstats/testuser/flag').set('Authorization', `Bearer ${token}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Fetched statistics for user testuser in mode flag');
    });
});