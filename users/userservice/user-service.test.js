const request = require('supertest');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');

const User = require('./user-model');
const Game = require('./game-model');
const UserStatistics = require('./user-statistic-model');


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
    expect(response.body.error).toMatch(/Missing required field: username/i);
  });

  it('should return error on POST /adduser when password is missing', async () => {
    const incompleteUser = { username: 'testuser' };
    const response = await request(app).post('/adduser').send(incompleteUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/Missing required field: password/i);
  });
  
  describe('Game endpoints', () => {
    
    beforeEach(async () => {
      await Game.deleteMany({});
      await UserStatistics.deleteMany({});

      const newUser = { username: 'gameuser', password: 'secret' };
      await request(app).post('/adduser').send(newUser);
    });

    it('should add a new game on POST /addgame and update user statistics', async () => {
      const newGameData = {
        username: 'gameuser',
        score: 50,
        correctRate: 0.8,
        gameMode: 'arcade',
      };

      const response = await request(app).post('/addgame').send(newGameData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', 'gameuser');
      expect(response.body).toHaveProperty('score', 50);
      expect(response.body).toHaveProperty('correctRate', 0.8);
      expect(response.body).toHaveProperty('gameMode');
      expect(response.body.gameMode).toEqual(['arcade']);

      
      const savedGame = await Game.findOne({ username: 'gameuser' });
      expect(savedGame).not.toBeNull();

      
      const stats = await UserStatistics.findOne({ username: 'gameuser' });
      expect(stats).not.toBeNull();
      expect(stats.totalGamesPlayed).toBe(1);
      expect(stats.avgScore).toBe(50);
      //expect(stats.highScore).toBe(50);
      expect(stats.correctRate).toBe(0.8);
    });

    it('should return error on POST /addgame when required fields are missing', async () => {
      
      const incompleteGameData = {
        username: 'gameuser',
        correctRate: 0.9,
        gameMode: 'arcade'
      };

      const response = await request(app).post('/addgame').send(incompleteGameData);
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toMatch(/Missing required field/i);
    });

    it('should delete the oldest game when MAX_GAMES is reached', async () => {
      
      const MAX_GAMES = 100;
      for (let i = 0; i < MAX_GAMES; i++) {
        await new Game({
          username: 'gameuser',
          score: i,
          correctRate: 0.5,
          gameMode: 'classic',
          createdAt: new Date(Date.now() - 1000 * (MAX_GAMES - i)) 
        }).save();
      }

      
      let count = await Game.countDocuments({ username: 'gameuser' });
      expect(count).toBe(MAX_GAMES);

      const newGameData = {
        username: 'gameuser',
        score: 200,
        correctRate: 0.95,
        gameMode: 'classic',
      };

      const response = await request(app).post('/addgame').send(newGameData);
      expect(response.status).toBe(200);

      count = await Game.countDocuments({ username: 'gameuser' });
      expect(count).toBe(MAX_GAMES);

      const oldestGame = await Game.findOne({ username: 'gameuser' }).sort({ createdAt: 1 });
      expect(oldestGame.score).not.toBe(0);
    });
  });

  
  describe('User Statistics endpoint', () => {
    it('should return user statistics on GET /userstats/:username', async () => {
      
      const newUser = { username: 'statsuser', password: 'secret' };
      await request(app).post('/adduser').send(newUser);
      
      const newGameData = {
        username: 'statsuser',
        score: 70,
        correctRate: 0.9,
        gameMode: 'survival',
      };
      await request(app).post('/addgame').send(newGameData);

      const response = await request(app).get('/userstats/statsuser');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', 'statsuser');
      expect(response.body.totalGamesPlayed).toBeGreaterThanOrEqual(1);
    });

    it('should return 404 if user statistics not found on GET /userstats/:username', async () => {
      const response = await request(app).get('/userstats/nonexistentuser');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'User statistics not found');
    });
  });
  
});
