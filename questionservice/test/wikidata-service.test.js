const request = require("supertest");
const { MongoMemoryServer } = require('mongodb-memory-server');
const WikidataObject = require("../wikidata-model");
const axios = require("axios");

jest.mock("axios");

// Mock the database methods to prevent actual DB operations
describe("Express Service API Endpoints", () => {
    let app;
    let mongoServer;

    let start;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        process.env.MONGODB_URI = mongoUri;

        axios.get.mockResolvedValue({
            data: {
                results: {
                    bindings: [{ city: { value: '.../Q1' }, cityLabel: { value: 'City1' }, image: { value: 'img1.jpg' } }]
                }
            }
        });

        deleteManySpy = jest.spyOn(WikidataObject, 'deleteMany');
        bulkWriteSpy = jest.spyOn(WikidataObject, 'bulkWrite');

        const { server, startUp } = require("../wikidata-service");
        app = server;
        start = startUp;
    });

    afterAll(async () => {
        await app.close();
        await mongoServer.stop();
    });

    it('should clear the database and repopulate it on startup', async () => {
        // Mock the console.log to capture logs
        jest.spyOn(console, "log").mockImplementation(() => { });

        // Call the startUp function
        await start();

        // Verify that specific logs were printed
        expect(console.log).toHaveBeenCalledWith("Connected to MongoDB");
        expect(console.log).toHaveBeenCalledWith("Clearing the database...");
        expect(console.log).toHaveBeenCalledWith("✅ Database cleared successfully.");
        expect(console.log).toHaveBeenCalledWith("Fetching data from Wikidata and storing it in the database");
        expect(console.log).toHaveBeenCalledWith("✅ Data successfully stored in the database.");

        // Restore the original console.log
        console.log.mockRestore();
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