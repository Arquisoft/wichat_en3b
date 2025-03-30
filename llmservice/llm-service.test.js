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

    afterAll(() => {
        server.close();
        process.env = originalEnv;
    });

    // Test the /ask endpoint with valid data
    it("should return answer when valid question and prompt are provided", async () => {
        // Mock successful response from LLM API
        axios.post.mockResolvedValue({
            data: {
                choices: [
                    {
                        message: {
                            content: "This is the answer from the LLM"
                        }
                    }
                ]
            }
        });

        const response = await request(server)
            .post("/ask")
            .send({ 
                question: "What is the capital of France?", 
                prompt: "You are a helpful assistant" 
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty("answer", "This is the answer from the LLM");
        expect(axios.post).toHaveBeenCalledTimes(1);
        
        // Verify the correct request was made to the LLM API
        const axiosCallArg = axios.post.mock.calls[0];
        expect(axiosCallArg[0]).toBe("https://empathyai.prod.empathy.co/v1/chat/completions");
        expect(axiosCallArg[1]).toEqual({
            model: "qwen/Qwen2.5-Coder-7B-Instruct",
            messages: [
                { role: "system", content: "You are a helpful assistant" },
                { role: "user", content: "What is the capital of France?" }
            ]
        });
        expect(axiosCallArg[2].headers).toEqual({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key'
        });
    });

    // Test missing required fields in request
    it("should return 500 when required fields are missing", async () => {
      const response = await request(server)
          .post("/ask")
          .send({ question: "What is the capital of France?" });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error", "Missing required field: prompt");
  });

  // Test missing API key
  it("should return 500 when API key is missing", async () => {
    delete process.env.LLM_API_KEY;

    const response = await request(server)
        .post("/ask")
        .send({ 
            question: "What is the capital of France?", 
            prompt: "You are a helpful assistant" 
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
          prompt: "You are a helpful assistant" 
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
          prompt: "You are a helpful assistant" 
      });

  expect(response.status).toBe(500);
  expect(response.body).toHaveProperty("error", "Network Error");
});

});

  