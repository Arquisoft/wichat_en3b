const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require('mongodb-memory-server');
const server = require("../wikidata-service");
const WikidataObject = require("../wikidata-model");

let mongoServer;
let app;

// Mock the database methods to prevent actual DB operations
describe("Express Service API Tests", () => {
    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        process.env.MONGODB_URI = mongoUri;
        app = require('../wikidata-service');
    });

    afterAll(async () => {
        app.close();
        await mongoServer.stop();
    });

    // Test the /load endpoint with valid data
    it("should return 200 when valid modes are provided", async () => {
        const response = await request(server)
            .post("/load")
            .send({ modes: ["city", "flag"] });
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("message", "Data successfully stored");
    });

    // Test /load with invalid data
    it("should return 400 for invalid modes parameter", async () => {
        const response = await request(server)
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
        const response = await request(server).get("/getRound");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("mode");
        expect(response.body.items.length).toBe(4);
        expect(response.body.itemWithImage).toHaveProperty("imageUrl");
    });

    // Test error handling in /getRound
    it("should return 500 if an error occurs", async () => {
        const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => { }); // Suppress console.error
        jest.spyOn(WikidataObject, "aggregate").mockRejectedValue(new Error("Database error"));
        const response = await request(server).get("/getRound");
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error", "Internal server error");
        consoleErrorMock.mockRestore(); // Restore the original console.error
    });
});
