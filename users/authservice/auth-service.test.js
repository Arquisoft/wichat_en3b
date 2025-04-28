const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./auth-model');

let mongoServer;
let app;

//test user
const user = {
  username: 'testuser',
  password: 'testpassword',
};

// Invalid user
const invalidUser = {
  username: 'nonexistentuser',
  password: 'wrongpassword',
};

async function addUser(user){
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const newUser = new User({
    username: user.username,
    password: hashedPassword,
  });

  await newUser.save();
  return newUser;
}

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./auth-service'); 
  //Load database with initial conditions
  await addUser(user);
});

afterAll(async () => {
  app.close();
  await mongoServer.stop();
});

describe('Auth Service', () => {
  it('Should perform a login operation /login', async () => {
    const response = await request(app).post('/login').send(user);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');
  });

  it('Should return 400 if required fields are missing', async () => {
    const response = await request(app).post('/login').send({ username: 'testuser' });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });


  it('Should return 401 for invalid credentials', async () => {
    const response = await request(app).post('/login').send(invalidUser);
    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('error', 'Invalid credentials');
  });

  
  it('Should return 400 for invalid input format', async () => {
    const response = await request(app).post('/login').send({
      username: 'ab', 
      password: 'abc'
    });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('Should successfully logout a user', async () => {
    const response = await request(app).post('/logout');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Logged out successfully');
    
    
    expect(response.headers['set-cookie']).toBeDefined();
    let cookieHeader = response.headers['set-cookie'][0];
    expect(cookieHeader).toContain('accessToken=;');
    cookieHeader = response.headers['set-cookie'][1];
    expect(cookieHeader).toContain('jwt=;');
  });

  it('Should return 401 when refreshing without token', async () => {
    const response = await request(app).get('/refresh');
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Forbidden');
  });

  it('Should return 403 when refreshing with invalid token', async () => {
    
    const invalidToken = jwt.sign({ username: 'nonexistentuser' }, 'refreshTokenSecret', { expiresIn: '7d' });
    
    const response = await request(app)
      .get('/refresh')
      .set('Cookie', [`jwt=${invalidToken}`]);
    
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty('error', 'Forbidden');
  });

  
  it('Should successfully refresh token for authenticated user', async () => {
    
    const loginResponse = await request(app).post('/login').send(user);
    expect(loginResponse.status).toBe(200);
    
    const cookies = loginResponse.headers['set-cookie'];
    expect(cookies).toBeDefined();
    
    const refreshResponse = await request(app)
      .get('/refresh')
      .set('Cookie', cookies);
    
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body).toHaveProperty('username', user.username);
    expect(refreshResponse.body).toHaveProperty('accessToken');
  });

  
  it('Should return 403 when refreshing with tampered token', async () => {
    
    const loginResponse = await request(app).post('/login').send(user);
    
    const tamperedToken = jwt.sign(
      { userId: 'fakeid', username: 'differentuser' }, 
      'refreshTokenSecret', 
      { expiresIn: '7d' }
    );
    
    const refreshResponse = await request(app)
      .get('/refresh')
      .set('Cookie', [`jwt=${tamperedToken}`]);
    
    expect(refreshResponse.status).toBe(403);
    expect(refreshResponse.body).toHaveProperty('error', 'Forbidden');
  });

});
