const request = require("supertest");
const axios = require("axios");
const server = require("./llm-service");

// Mock axios to prevent actual API calls
jest.mock("axios");

describe('LLM Service', () => {
  const originalEnv = process.env;

    beforeEach(() => {
        // Reset environment variables before each test
        process.env = { ...originalEnv };
        process.env.LLM_API_KEY = "test-api-key";
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    beforeAll(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterAll(() => {
        server.close();
        process.env = originalEnv;
        console.error.mockRestore();
    });
    
    // Test missing required fields in request
    it("should return 500 when required fields are missing", async () => {
      let response = await request(server)
          .post("/ask")
          .send({ question: "What is the capital of France?", model: "mistral" });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Missing required field: prompt");

      response = await request(server)
          .post("/ask")
          .send({ question: "What is the capital of France?", prompt: "You are a helpful assistant" });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Missing required field: model");
  });

  // Test missing API key
  it("should return 500 when API key is missing", async () => {
    delete process.env.LLM_API_KEY;

    const response = await request(server)
        .post("/ask")
        .send({ 
            question: "What is the capital of France?", 
            prompt: "You are a helpful assistant",
            model: "mistral" 
        });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("error", "API key is missing.");
});

// Test error handling when LLM API returns an error
it("should handle LLM API errors properly", async () => {
  axios.post.mockRejectedValue({
      response: {
          status: 403,
          data: { error: "Unauthorized" }
      },
      message: "Request failed with status code 403"
  });

  const response = await request(server)
      .post("/ask")
      .send({ 
          question: "What is the capital of France?", 
          prompt: "You are a helpful assistant",
          model: "mistral"
      });

  expect(response.status).toBe(403);
  expect(response.body).toHaveProperty("error", "Request failed with status code 403");
});

// Test error handling when LLM API returns a non-standard error
it("should handle non-standard LLM API errors", async () => {
  axios.post.mockRejectedValue(new Error("Network Error"));

  const response = await request(server)
      .post("/ask")
      .send({ 
          question: "What is the capital of France?", 
          prompt: "You are a helpful assistant",
          model: "mistral"
      });

  expect(response.status).toBe(500);
  expect(response.body).toHaveProperty("error", "Network Error");
});

// Test validateRequiredFields function
it("should validate all required fields correctly", async () => {
  const response = await request(server)
      .post("/ask")
      .send({});

  expect(response.status).toBe(500);
  expect(response.body).toHaveProperty("error", "Missing required field: question");
});

// Test malformed API response
it("should handle malformed LLM API responses", async () => {
  axios.post.mockResolvedValue({
      data: { }
  });

  const response = await request(server)
      .post("/ask")
      .send({ 
          question: "What is the capital of France?", 
          prompt: "You are a helpful assistant",
          model: "mistral"
      });

  expect(response.status).toBe(500); 
  expect(response.body).toHaveProperty("error");
});
});