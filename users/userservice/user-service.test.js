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
        questions: [
          { mode: 'arcade', isCorrect: true, pointsIncrement: 50 },
          { mode: 'arcade', isCorrect: false, pointsIncrement: 50 },
        ]
      };

      const response = await request(app).post('/addgame').send(newGameData);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', 'gameuser');
      expect(response.body).toHaveProperty('score', 50);
      expect(response.body).toHaveProperty('correctRate', 0.5);
      expect(response.body).toHaveProperty('gameMode');
      expect(response.body.gameMode).toEqual(['arcade']);


      const savedGame = await Game.findOne({ username: 'gameuser' });
      expect(savedGame).not.toBeNull();
    });

    it('should return error on POST /addgame when required fields are missing', async () => {
      const incompleteGameData = {
        username: 'gameuser',
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
        questions: [
          { mode: 'classic', isCorrect: true, pointsIncrement: 50 },
          { mode: 'classic', isCorrect: false, pointsIncrement: 50 },
        ],
        createdAt: Date.now(), // Set createdAt to the current date
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
    async function addGameData(username, questions) {
      await request(app).post('/addgame').send({ username, questions });
    }

    it('should return user statistics on GET /userstats/user/:username', async () => {
      const newUser = { username: 'statsuser', password: 'secret' };
      await request(app).post('/adduser').send(newUser);

      await addGameData('statsuser', [{ mode: 'arcade', isCorrect: true, pointsIncrement: 70 }]);
      await addGameData('statsuser', [{ mode: 'arcade', isCorrect: false, pointsIncrement: 80 }]);

      const response = await request(app).get('/userstats/user/statsuser');
      expect(response.status).toBe(200);
      expect(response.body.stats[0].username).toBe('statsuser');
      expect(response.body.stats[0].totalScore).toBe(70);
      expect(response.body.stats[0].correctRate).toBe(0.5);
      expect(response.body.stats[0].totalGamesPlayed).toBe(2);
    });

    it('should return empty array if user statistics not found on GET /userstats/user/:username', async () => {
      const response = await request(app).get('/userstats/user/nonexistentuser');
      expect(response.status).toBe(200);
      expect(response.body.stats).toEqual([]);
    });

    it('should return all statistics for a specific game mode on GET /userstats/mode/:gameMode', async () => {
      await addGameData('user1', [{ mode: 'flag', isCorrect: true, pointsIncrement: 70 }]);
      await addGameData('user1', [{ mode: 'flag', isCorrect: false, pointsIncrement: 50 }]);
      await addGameData('user2', [{ mode: 'flag', isCorrect: true, pointsIncrement: 80 }]);

      const response = await request(app).get('/userstats/mode/flag');
      expect(response.status).toBe(200);
      expect(response.body.stats[0].username).toBe('user1');
      expect(response.body.stats[1].username).toBe('user2');
      expect(response.body.stats[0].totalScore).toBe(70);
      expect(response.body.stats[1].totalScore).toBe(80);
      expect(response.body.stats[0].correctRate).toBe(0.5);
      expect(response.body.stats[1].correctRate).toBe(1);
      expect(response.body.stats[0].totalGamesPlayed).toBe(2);
      expect(response.body.stats[1].totalGamesPlayed).toBe(1);
    });

    it('should return all statistics for a specific user and mode on GET /userstats/:username/:mode', async () => {
      await addGameData('user1', [{ mode: 'arcade', isCorrect: true, pointsIncrement: 100 }]);
      await addGameData('user1', [{ mode: 'arcade', isCorrect: false, pointsIncrement: 50 }]);
      await addGameData('user2', [{ mode: 'arcade', isCorrect: true, pointsIncrement: 90 }]);

      const response = await request(app).get('/userstats/user1/arcade');
      expect(response.status).toBe(200);
      expect(response.body.stats.username).toBe('user1');
      expect(response.body.stats.totalScore).toBe(100);
      expect(response.body.stats.correctRate).toBe(0.5);
      expect(response.body.stats.totalGamesPlayed).toBe(2);
    });

    it('should return the combined statistics for all game modes on GET /userstats/:username/all', async () => {
      await addGameData('all', [{ mode: 'arcade', isCorrect: true, pointsIncrement: 100 }]);
      await addGameData('all', [{ mode: 'flag', isCorrect: false, pointsIncrement: 50 }]);
      await addGameData('all', [{ mode: 'arcade', isCorrect: true, pointsIncrement: 90 }]);

      const response = await request(app).get('/userstats/all/all');
      expect(response.status).toBe(200);
      expect(response.body.stats.username).toBe('all');
      expect(response.body.stats.totalScore).toBe(190);
      expect(response.body.stats.correctRate).toBe(2/3);
      expect(response.body.stats.totalGamesPlayed).toBe(3);
    });
  });
});