const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./user-model');


let mongoServer;
let app;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  process.env.MONGODB_URI = mongoUri;
  app = require('./user-service'); 
});

afterAll(async () => {
    app.close();
    await mongoServer.stop();
});

describe('User Service', () => {
  it('should add a new user on POST /adduser', async () => {
    const newUser = {
      username: 'testuser',
      password: 'testpassword',
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'testuser');

    // Check if the user is inserted into the database
    const userInDb = await User.findOne({ username: 'testuser' });

    // Assert that the user exists in the database
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe('testuser');

    // Assert that the password is encrypted
    const isPasswordValid = await bcrypt.compare('testpassword', userInDb.password);
    expect(isPasswordValid).toBe(true);
  });

  it ('should not add a new user on POST /adduser and should send an exception', async () => { 

    const response = await request(app).post('/adduser').send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/Missing required field/i);

  }); 
  
  it('should return error on POST /adduser when the request body is empty (missing required fields)', async () => {
    const response = await request(app).post('/adduser').send({});
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    // Se espera que se lance el error al faltar el primer campo requerido, en este caso "username"
    expect(response.body.error).toMatch(/Missing required field: username/i);
  });

  it('should return error on POST /adduser when password is missing', async () => {
    const incompleteUser = { username: 'testuser' };
    const response = await request(app).post('/adduser').send(incompleteUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/Missing required field: password/i);
  });
  
  
});
