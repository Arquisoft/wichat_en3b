const axios = require('axios');
const express = require('express');

const app = express();
const port = 8003;

// Middleware to parse JSON in request body
app.use(express.json());
// Load enviornment variables
require('dotenv').config();

const empathy = (model, prompt) => {
  return {
    url: () => 'https://empathyai.prod.empathy.co/v1/chat/completions',
    transformRequest: (question) => ({
      model: model,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: question }
      ]
    }),
    transformResponse: (response) => response.data.choices[0]?.message?.content,
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    })
  }
}

// Define configurations for different LLM APIs
const llmConfigs = (model, prompt) => {
  const models = {
    mistral: empathy("mistralai/Mistral-7B-Instruct-v0.3", prompt),
    qwen: empathy("qwen/Qwen2.5-Coder-7B-Instruct", prompt),
  };

  return models[model] || models.mistral; // Default to Mistral if model is not found
};

// Function to validate required fields in the request body
function validateRequiredFields(req, requiredFields) {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

// Generic function to send questions to LLM
async function sendQuestionToLLM(question, apiKey, model, prompt) {
  try {
    const config = llmConfigs(model, prompt);
    if (!config) {
      throw new Error(`Something failed setting up the model`);
    }

    const url = config.url(apiKey);
    const requestData = config.transformRequest(question);

    const headers = {
      'Content-Type': 'application/json',
      ...(config.headers ? config.headers(apiKey) : {})
    };

    const response = await axios.post(url, requestData, { headers });

    return config.transformResponse(response);

  } catch (error) {
    console.error(`Error sending question to the LLM:`, error.message || error);
    throw error;
  }
}

app.post('/ask', async (req, res) => {
  try {
    // Check if required fields are present in the request body
    validateRequiredFields(req, ['question', 'model', 'prompt']);

    const { question, model, prompt } = req.body;
    //load the api key from an environment variable
    const apiKey = process.env.LLM_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'API key is missing.' });
    }
    const answer = await sendQuestionToLLM(question, apiKey, model, prompt);
    res.json({ answer });
  } catch (error) {
    const statusCode = error.response?.status || 500;
    res.status(statusCode).json({ error: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`LLM Service listening at http://localhost:${port}`);
});

module.exports = server