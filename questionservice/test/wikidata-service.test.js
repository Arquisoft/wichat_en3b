const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server');
const { startUp } = require("../wikidata-service");
const WikidataObject = require("../wikidata-model");

let mongoServer;
let app;

describe('Service Startup Logic', () => {
    jest.mock('axios');

    it('should clear the database and repopulate it on startup', async () => {
        // Spy on the method we expect to be called
        const deleteManySpy = jest.spyOn(WikidataObject, 'deleteMany');
        const bulkWriteSpy = jest.spyOn(WikidataObject, 'bulkWrite');

        process.env.NODE_ENV = "something";
        await startUp();
        process.env.NODE_ENV = "test"; // Reset the environment variable

        expect(deleteManySpy).toHaveBeenCalledTimes(1);
        expect(deleteManySpy).toHaveBeenCalledWith({}); // Ensure it's called with empty filter
        expect(bulkWriteSpy).toHaveBeenCalledTimes(4);
        expect(bulkWriteSpy).toHaveBeenCalledWith({});

        bulkWriteSpy.mockRestore(); // Clean up the spy
        deleteManySpy.mockRestore(); // Clean up the spy
    });

});

// Mock the database methods to prevent actual DB operations
describe("Express Service API Endpoints", () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        process.env.MONGODB_URI = mongoUri;
        const { server } = require("../wikidata-service");
        app = server;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    afterAll(async () => {
        app.close();
        await mongoServer.stop();
    });

    // Test the /load endpoint with valid data
    it("should return 200 when valid modes are provided", async () => {
        const response = await request(app)
            .post("/load")
            .send({ modes: ["city", "flag"] });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Data successfully stored");
    });

    // Test /load with invalid data
    it("should return 400 for invalid modes parameter", async () => {
        const response = await request(app)
            .post("/load")
            .send({ modes: "invalid" });
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Invalid modes parameter");
    });

    // Mock data for /getRound
    const mockItems = [
        { name: "Paris", mode: "city", imageUrl: "https://example.com/paris.jpg" },
        { name: "London", mode: "city", imageUrl: "https://example.com/london.jpg" },
        { name: "New York", mode: "city", imageUrl: "https://example.com/nyc.jpg" },
        { name: "Tokyo", mode: "city", imageUrl: "https://example.com/tokyo.jpg" }
    ];

    // Mock the database call to return mockItems
    jest.spyOn(WikidataObject, "aggregate").mockResolvedValue(mockItems);

    // Test /getRound endpoint
    it("should return a valid game round", async () => {
        const response = await request(app).get("/getRound");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("mode");
        expect(response.body.items.length).toBe(4);
        expect(response.body.itemWithImage).toHaveProperty("imageUrl");
    });

    // Test error handling in /getRound
    it("should return 500 if an error occurs", async () => {
        const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => { }); // Suppress console.error
        jest.spyOn(WikidataObject, "aggregate").mockRejectedValue(new Error("Database error"));
        const response = await request(app).get("/getRound");
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error", "Internal server error");
        consoleErrorMock.mockRestore(); // Restore the original console.error
    });

    it("should return a list of available modes", async () => {
        const response = await request(app).get("/getModes");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("modes");
        expect(Array.isArray(response.body.modes)).toBe(true);
    });
});