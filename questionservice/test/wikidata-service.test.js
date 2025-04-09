const request = require("supertest");
const { MongoMemoryServer } = require('mongodb-memory-server');
const WikidataObject = require("../wikidata-model");
const axios = require("axios");

jest.mock("axios");

describe("Express Service API Endpoints", () => {
    let app;
    let mongoServer;
    let start;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        process.env.MONGODB_URI = mongoUri;
        process.env.NODE_ENV = "test"; // Prevent auto data load on start

        // Mock Wikidata API response
        axios.get.mockResolvedValue({
            data: {
                results: {
                    bindings: [
                        {
                            city: { value: 'http://www.wikidata.org/entity/Q1' },
                            cityLabel: { value: 'City1' },
                            image: { value: 'http://example.com/image.jpg' }
                        }
                    ]
                }
            }
        });

        // Spy on DB methods
        jest.spyOn(WikidataObject, 'deleteMany').mockResolvedValue();
        jest.spyOn(WikidataObject, 'bulkWrite').mockResolvedValue();

        const { server, startUp } = require("../wikidata-service");
        app = server;
        start = startUp;
    });

    afterAll(async () => {
        await app.close();
        await mongoServer.stop();
    });

    // Test the startup process: connect, clear DB, fetch and store data
    it("should clear the database and repopulate it on startup", async () => {
        jest.spyOn(console, "log").mockImplementation(() => { });

        await start();

        expect(WikidataObject.deleteMany).toHaveBeenCalled();
        expect(WikidataObject.bulkWrite).toHaveBeenCalled();

        expect(console.log).toHaveBeenCalledWith("Connected to MongoDB");
        expect(console.log).toHaveBeenCalledWith("Clearing the database...");
        expect(console.log).toHaveBeenCalledWith("✅ Database cleared successfully.");
        expect(console.log).toHaveBeenCalledWith("✅ Data successfully stored in the database.");

        console.log.mockRestore();
    });

    // Test /getTopics endpoint
    it("should return a list of available topics", async () => {
        const response = await request(app).get("/getTopics");
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("topics");
        expect(Array.isArray(response.body.topics)).toBe(true);
        expect(response.body.topics).toContain("city");
    });

    // Mock data for /getRound
    const mockItems = [
        { name: "Paris", topic: "city", imageUrl: "https://example.com/paris.jpg" },
        { name: "London", topic: "city", imageUrl: "https://example.com/london.jpg" },
        { name: "New York", topic: "city", imageUrl: "https://example.com/nyc.jpg" },
        { name: "Tokyo", topic: "city", imageUrl: "https://example.com/tokyo.jpg" }
    ];

    // Mock the database call to return mockItems
    jest.spyOn(WikidataObject, "aggregate").mockResolvedValue(mockItems);

    // Test /getRound endpoint with valid topics
    it("should return a valid game round", async () => {
        const response = await request(app)
            .get("/getRound")
            .query({ "topics[]": "city" }); // Ensure it's parsed as an array
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("topic");
        expect(response.body.items.length).toBe(4);
        expect(response.body.itemWithImage).toHaveProperty("imageUrl");
    });    

    // Test /getRound with missing or invalid topics
    it("should return 400 for missing or invalid topics", async () => {
        const response = await request(app).get("/getRound");
        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Missing or invalid topics");
    });

    // Test /getRound when database throws an error
    it("should return 500 if an error occurs", async () => {
        const consoleErrorMock = jest.spyOn(console, "error").mockImplementation(() => { });
        jest.spyOn(WikidataObject, "aggregate").mockRejectedValue(new Error("Database error"));
        const response = await request(app)
            .get("/getRound")
            .query({ "topics[]": "city" }); // Ensure it's parsed as an array
        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty("error", "Internal server error");
        consoleErrorMock.mockRestore();
    });
});
