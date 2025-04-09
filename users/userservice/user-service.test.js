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
      username: 'TestUser1',
      password: 'TestPassword1!',
    };

    const response = await request(app).post('/adduser').send(newUser);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('username', 'TestUser1');

    // Check if the user is inserted into the database
    const userInDb = await User.findOne({ username: 'TestUser1' });

    // Assert that the user exists in the database
    expect(userInDb).not.toBeNull();
    expect(userInDb.username).toBe('TestUser1');

    // Assert that the password is encrypted
    const isPasswordValid = await bcrypt.compare('TestPassword1!', userInDb.password);
    expect(isPasswordValid).toBe(true);
  });

  it('should not add a new user on POST /adduser and should send an exception', async () => {

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

  it('should return error when username format is invalid', async () => {
    const invalidUser = {
      username: 'Invalid@Username', 
      password: 'ValidPassword1!'
    };
    
    const response = await request(app).post('/adduser').send(invalidUser);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/username is not valid/i);
  });

  it('should return error when password does not meet complexity requirements', async () => {
    const userWithWeakPassword = {
      username: 'ValidUser3',
      password: 'weakpassword'  
    };
    
    const response = await request(app).post('/adduser').send(userWithWeakPassword);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/Password must have at least one capital letter, one digit and one special character/i);
  });

  it('should return error when password is too short', async () => {
    const userWithShortPassword = {
      username: 'ValidUser4',
      password: 'Short1!' 
    };
    
    const response = await request(app).post('/adduser').send(userWithShortPassword);
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/Password must have at least one capital letter, one digit and one special character./i);
  });

  describe('Game endpoints', () => {

    beforeEach(async () => {
      await Game.deleteMany({});
      await UserStatistics.deleteMany({});

      const newUser = { username: 'GameUser1', password: 'GamePassword1!' };
      await request(app).post('/adduser').send(newUser);
    });

    it('should add a new game on POST /addgame and update user statistics', async () => {
      const newGameData = {
        username: 'GameUser1',
        password: 'GameUser1!',
        questions: [
          { topic: 'arcade', isCorrect: true, pointsIncrement: 50 },
          { topic: 'arcade', isCorrect: false, pointsIncrement: 50 },
        ]
      };

      const response = await request(app).post('/addgame').send(newGameData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', 'GameUser1');
      expect(response.body).toHaveProperty('score', 50);
      expect(response.body).toHaveProperty('correctRate', 0.5);
      expect(response.body).toHaveProperty('gameTopic');
      expect(response.body.gameTopic).toEqual(['arcade']);


      const savedGame = await Game.findOne({ username: 'GameUser1' });
      expect(savedGame).not.toBeNull();
    });

    it('should delete the oldest game when MAX_GAMES is reached', async () => {

      const MAX_GAMES = 100;
      for (let i = 0; i < MAX_GAMES; i++) {
        await new Game({
          username: 'GameUser1',
          password: 'GameUser1!',
          score: i,
          correctRate: 0.5,
          gameTopic: 'classic',
          createdAt: new Date(Date.now() - 1000 * (MAX_GAMES - i))
        }).save();
      }

      let count = await Game.countDocuments({ username: 'GameUser1' });
      expect(count).toBe(MAX_GAMES);

      const newGameData = {
        username: 'GameUser1',
        password: 'GameUser1!',
        questions: [
          { topic: 'classic', isCorrect: true, pointsIncrement: 50 },
          { topic: 'classic', isCorrect: false, pointsIncrement: 50 },
        ],
        createdAt: Date.now(), // Set createdAt to the current date
      };

      const response = await request(app).post('/addgame').send(newGameData);
      expect(response.status).toBe(200);

      count = await Game.countDocuments({ username: 'GameUser1' });
      expect(count).toBe(MAX_GAMES);

      const oldestGame = await Game.findOne({ username: 'GameUser1' }).sort({ createdAt: 1 });
      expect(oldestGame.score).not.toBe(0);
    });
  });

  describe('User Statistics endpoint', () => {
    async function addGameData(username, password, questions) {
      await request(app).post('/addgame').send({ username, password, questions });
    }

    beforeAll(async () => {

      // Clear previous data
      await UserStatistics.deleteMany({});
      await Game.deleteMany({});


      // Create users with valid credentials
      const statsUser = { username: 'StatsUser1', password: 'StatsPass1!' };
      const user1 = { username: 'User1Test', password: 'Password1!' };
      const user2 = { username: 'User2Test', password: 'Password2!' };
      const allUser = { username: 'AllUserTest', password: 'Password3!' };
      
      await request(app).post('/adduser').send(statsUser);
      await request(app).post('/adduser').send(user1);
      await request(app).post('/adduser').send(user2);
      await request(app).post('/adduser').send(allUser);

      // Add game data for testing
      await addGameData('StatsUser1', 'StatsPass1!', [{ topic: 'arcade', isCorrect: true, pointsIncrement: 70 }]);
      await addGameData('StatsUser1', 'StatsPass1!', [{ topic: 'arcade', isCorrect: false, pointsIncrement: 80 }]);

      await addGameData('User1Test', 'Password1!', [{ topic: 'flag', isCorrect: true, pointsIncrement: 70 }]);
      await addGameData('User1Test', 'Password1!', [{ topic: 'flag', isCorrect: false, pointsIncrement: 50 }]);
      await addGameData('User2Test', 'Password2!', [{ topic: 'flag', isCorrect: true, pointsIncrement: 80 }]);

      await addGameData('User1Test', 'Password1!', [{ topic: 'arcade', isCorrect: true, pointsIncrement: 100 }]);
      await addGameData('User1Test', 'Password1!', [{ topic: 'arcade', isCorrect: false, pointsIncrement: 50 }]);
      await addGameData('User2Test', 'Password2!', [{ topic: 'arcade', isCorrect: true, pointsIncrement: 90 }]);

      await addGameData('AllUserTest', 'Password3!', [{ topic: 'arcade', isCorrect: true, pointsIncrement: 100 }]);
      await addGameData('AllUserTest', 'Password3!', [{ topic: 'flag', isCorrect: false, pointsIncrement: 50 }]);
      await addGameData('AllUserTest', 'Password3!', [{ topic: 'arcade', isCorrect: true, pointsIncrement: 90 }]);
    });

    it('should return user statistics on GET /userstats/user/:username', async () => {

      const response = await request(app).get('/userstats/user/StatsUser1');
      expect(response.status).toBe(200);

      expect(Array.isArray(response.body.stats)).toBe(true);
      expect(response.body.stats.length).toBeGreaterThan(0);
      
      const stats = response.body.stats[0];
      expect(stats.username).toBe('StatsUser1');
      expect(stats.totalScore).toBe(70); // Only the correct answer adds points
      expect(stats.correctRate).toBe(0.5); // 1 correct, 1 incorrect = 0.5
      expect(stats.totalGamesPlayed).toBe(2);
    });

    it('should return empty array if user statistics not found on GET /userstats/user/:username', async () => {
      const response = await request(app).get('/userstats/user/nonexistentuser');
      expect(response.status).toBe(200);
      expect(response.body.stats).toEqual([]);
    });

    it('should return all statistics for a specific game topic on GET /userstats/topic/:topic', async () => {
      const response = await request(app).get('/userstats/topic/flag');
      expect(response.status).toBe(200);
      
      // Check array length and sort order
      expect(response.body.stats.length).toBeGreaterThanOrEqual(2);
      
      // Find the users in the results (order might vary)
      const user1Stats = response.body.stats.find(s => s.username === 'User1Test');
      const user2Stats = response.body.stats.find(s => s.username === 'User2Test');
      
      expect(user1Stats).toBeDefined();
      expect(user2Stats).toBeDefined();
      
      expect(user1Stats.totalScore).toBe(70);
      expect(user2Stats.totalScore).toBe(80);
      expect(user1Stats.correctRate).toBe(0.5);
      expect(user2Stats.correctRate).toBe(1);
      expect(user1Stats.totalGamesPlayed).toBe(2);
      expect(user2Stats.totalGamesPlayed).toBe(1);
    });

    it('should return all statistics for a specific user and topic on GET /userstats/:username/:topic', async () => {
      const response = await request(app).get('/userstats/User1Test/arcade');
      expect(response.status).toBe(200);
      expect(response.body.stats.username).toBe('User1Test');
      expect(response.body.stats.totalScore).toBe(100);
      expect(response.body.stats.correctRate).toBe(0.5);
      expect(response.body.stats.totalGamesPlayed).toBe(2);
    });

    it('should return the combined statistics for all game topics on GET /userstats/:username/all', async () => {
       const response = await request(app).get('/userstats/AllUserTest/all');
      expect(response.status).toBe(200);
      expect(response.body.stats.username).toBe('AllUserTest');
      expect(response.body.stats.totalScore).toBe(190); // 100 + 0 + 90
      
      // Weighted average: (1*1 + 0*1 + 1*1)/3 = 2/3
      expect(response.body.stats.correctRate).toBeCloseTo(2/3, 5);
      expect(response.body.stats.totalGamesPlayed).toBe(3);
    });
  });
});