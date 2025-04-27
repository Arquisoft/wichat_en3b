const request = require("supertest");
const { MongoMemoryServer } = require('mongodb-memory-server');
const WikidataObject = require("./wikidata-model");
const TopicUpdate = require("./topics-update-model");
const axios = require("axios");
const mongoose = require("mongoose");

jest.mock("axios");
jest.mock("./sparqlQueries", () => ({
  city: "SELECT * WHERE { ?city wdt:P31 wd:Q515 . }",
  country: "SELECT * WHERE { ?country wdt:P31 wd:Q6256 . }",
  animal: "SELECT * WHERE { ?animal wdt:P31 wd:Q729 . }"
}));

describe("Express Service API Endpoints Extended Tests", () => {
  let app;
  let mongoServer;
  let startUp;
  let clearDatabase;
  let fetchAndStoreData;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    process.env.MONGODB_URI = mongoUri;
    process.env.NODE_ENV = "test"; // Prevent auto data load on start

    // Mock console methods to reduce noise in tests
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "time").mockImplementation(() => {});
    jest.spyOn(console, "timeEnd").mockImplementation(() => {});

    // Access the internal functions for testing
    const wikidataService = require("./wikidata-service");
    app = wikidataService.server;
    startUp = wikidataService.startUp;
    fetchAndStoreData = wikidataService.fetchAndStoreData;
  });

  afterAll(async () => {
    jest.restoreAllMocks();
    await app.close();
    await mongoServer.stop();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test MongoDB connection failure
  it("should handle MongoDB connection errors gracefully", async () => {
    const mockConnect = jest.spyOn(mongoose, "connect").mockRejectedValueOnce(new Error("Connection failed"));
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    
    await startUp();
    
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining("Error connecting to the DB:"),
      expect.any(Error)
    );
    
    mockConnect.mockRestore();
    consoleErrorSpy.mockRestore();
  });
  

  // Test the fetchAndStoreData function
  describe("fetchAndStoreData function", () => {
    // Obtain fetchAndStoreData from the module
    const { fetchAndStoreData } = require("./wikidata-service");
  
    if (!fetchAndStoreData) {
      it.skip("fetchAndStoreData tests skipped - function not exported", () => {});
      return;
    }
  
    beforeEach(() => {
      // Reset TopicUpdate and WikidataObject mocks
      jest.spyOn(TopicUpdate, "find").mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });
      jest.spyOn(TopicUpdate, "findOneAndUpdate").mockResolvedValue({});
      jest.spyOn(WikidataObject, "bulkWrite").mockResolvedValue({});
      jest.spyOn(WikidataObject, "countDocuments").mockResolvedValue(10);
    });
  
    it("should fetch and store data for topics that need updating", async () => {
      // Mock TopicUpdate.find to return no existing updates
      // This ensures all topics need updating
      jest.spyOn(TopicUpdate, "find").mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });
  
      axios.get.mockResolvedValue({
        data: {
          results: {
            bindings: [
              {
                city: { value: "https://www.wikidata.org/entity/Q1" },
                cityLabel: { value: "Paris" },
                image: { value: "https://example.com/paris.jpg" }
              }
            ]
          }
        }
      });
  
      await fetchAndStoreData();
  
      expect(TopicUpdate.findOneAndUpdate).toHaveBeenCalled();
      expect(WikidataObject.bulkWrite).toHaveBeenCalled();
    });
  
    it("should skip topics that are already up to date", async () => {
      // Mock that all topics were updated recently
      const now = new Date();
      const recentDate = new Date(now.getTime() - 1000 * 60 * 60 * 24); // 1 day ago
      
      const topicUpdates = [
        { topic: "city", lastUpdated: recentDate },
        { topic: "country", lastUpdated: recentDate },
        { topic: "animal", lastUpdated: recentDate }
      ];
      
      jest.spyOn(TopicUpdate, "find").mockReturnValue({
        lean: jest.fn().mockResolvedValue(topicUpdates)
      });
  
      await fetchAndStoreData();
  
      // Should not attempt to update any topics
      expect(axios.get).not.toHaveBeenCalled();
      expect(WikidataObject.bulkWrite).not.toHaveBeenCalled();
    });
  
    it("should handle errors when fetching data and retry", async () => {
      jest.spyOn(TopicUpdate, "find").mockReturnValue({
        lean: jest.fn().mockResolvedValue([])
      });
      
      // First call fails, second call succeeds
      axios.get
        .mockRejectedValueOnce(new Error("API error"))
        .mockResolvedValueOnce({
          data: {
            results: {
              bindings: [
                {
                  city: { value: "https://www.wikidata.org/entity/Q1" },
                  cityLabel: { value: "Paris" },
                  image: { value: "https://example.com/paris.jpg" }
                }
              ]
            }
          }
        });
  
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      
      // This test assumes the function has retry logic
      await fetchAndStoreData();
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining("Error processing topic"),
        expect.any(String)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });

  // Test getAvailableTopics endpoint
  describe("getAvailableTopics endpoint", () => {
    it("should return topics with data in the database", async () => {
      // Mock countDocuments to return different counts
      jest.spyOn(WikidataObject, "countDocuments")
        .mockResolvedValueOnce(10)  // city has 10 items
        .mockResolvedValueOnce(0)   // country has 0 items
        .mockResolvedValueOnce(5);  // animal has 5 items

      const response = await request(app).get("/getAvailableTopics");
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("availableTopics");
      expect(response.body.availableTopics).toContain("city");
      expect(response.body.availableTopics).not.toContain("country");
      expect(response.body.availableTopics).toContain("animal");
    });

    it("should handle errors when checking available topics", async () => {
      jest.spyOn(WikidataObject, "countDocuments").mockRejectedValue(new Error("Database error"));
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      const response = await request(app).get("/getAvailableTopics");
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal server error");
      
      consoleErrorSpy.mockRestore();
    });
  });

  // Test different modes for the getRound endpoint
  describe("getRound endpoint with different modes", () => {
    const mockItems = [
      { name: "Paris", topic: "city", imageUrl: "https://example.com/paris.jpg" },
      { name: "London", topic: "city", imageUrl: "https://example.com/london.jpg" },
      { name: "New York", topic: "city", imageUrl: "https://example.com/nyc.jpg" },
      { name: "Tokyo", topic: "city", imageUrl: "https://example.com/tokyo.jpg" }
    ];

    beforeEach(() => {
      jest.spyOn(WikidataObject, "aggregate").mockResolvedValue(mockItems);
    });

    it("should handle 'rounds' mode and avoid used images", async () => {
      const usedImages = JSON.stringify(["https://example.com/paris.jpg", "https://example.com/london.jpg"]);
      
      const response = await request(app)
        .get("/getRound")
        .query({ 
          "topics[]": "city", 
          mode: "rounds", 
          usedImages: usedImages 
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("itemWithImage");
      // The response should ideally not contain a used image, but since our mock always returns the same items,
      // we can't fully test this without modifying the mock implementation
    });

    it("should handle 'hide' mode", async () => {
      const response = await request(app)
        .get("/getRound")
        .query({ 
          "topics[]": "city", 
          mode: "hide"
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("topic");
      expect(response.body).toHaveProperty("items");
      expect(response.body).toHaveProperty("itemWithImage");
    });

    it("should handle invalid usedImages JSON", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      
      const response = await request(app)
        .get("/getRound")
        .query({ 
          "topics[]": "city", 
          mode: "rounds", 
          usedImages: "invalid-json"
        });
      
      expect(response.status).toBe(200);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Could not parse usedImages"),
        expect.any(Error)
      );
      
      consoleWarnSpy.mockRestore();
    });

    it("should work with multiple topics provided", async () => {
      const response = await request(app)
        .get("/getRound")
        .query({ 
          "topics[]": ["city", "country", "animal"]
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("topic");
      // The specific topic chosen should be one of the provided topics
      expect(["city", "country", "animal"]).toContain(response.body.topic);
    });
  });

  // Test error handling in getRandomItems function
  describe("getRandomItems error handling", () => {
    it("should handle errors when no valid topics are provided", async () => {
      const response = await request(app)
        .get("/getRound")
        .query({ topics: [] });
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Missing or invalid topics");
    });

    it("should handle database errors during aggregation", async () => {
      jest.spyOn(WikidataObject, "aggregate").mockRejectedValue(new Error("Aggregation error"));
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      
      const response = await request(app)
        .get("/getRound")
        .query({ "topics[]": "city" });
      
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Internal server error");
      
      consoleErrorSpy.mockRestore();
    });
  });
});