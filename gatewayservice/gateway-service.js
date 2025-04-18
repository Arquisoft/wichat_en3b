const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
const jwt = require('jsonwebtoken');
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')

const app = express();
const port = 8000;

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';
const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';

// Read the OpenAPI YAML file synchronously
openapiPath = './openapi.yaml'
if (fs.existsSync(openapiPath)) {
  const file = fs.readFileSync(openapiPath, 'utf8');

  // Parse the YAML content into a JavaScript object representing the Swagger document
  const swaggerDocument = YAML.parse(file);

  // Disable the "Try it out" button
  const swaggerOptions = {
    swaggerOptions: {
      supportedSubmitMethods: [] 
    }
  };
  
  // Serve the Swagger UI documentation at the '/api-doc' endpoint
  // This middleware serves the Swagger UI files and sets up the Swagger UI page
  // It takes the parsed Swagger document as input
  app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));
  
} else {
  console.log("Not configuring OpenAPI. Configuration file not present.")
}

app.use(cors({ origin: frontendUrl, credentials: true }));
app.use(express.json());

//Prometheus configuration
const metricsMiddleware = promBundle({ includeMethod: true });
app.use(metricsMiddleware);

// Define a middleware to check authentication
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, "accessTokenSecret", (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded.username;
    next();
  }
  );
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(authServiceUrl + '/login', req.body, { withCredentials: true, headers: { ...req.headers } });

    // Forward the cookie to the client from the authentication service
    if (authResponse.headers && authResponse.headers["set-cookie"])
      res.setHeader("Set-Cookie", authResponse.headers["set-cookie"]);

    res.json(authResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/logout', async (req, res) => {
  try {
    // Forward the logout request to the authentication service
    const authResponse = await axios.post(authServiceUrl + '/logout', req.body, { withCredentials: true, headers: { ...req.headers } });

    // Forward the cookie to the client from the authentication service
    if (authResponse.headers && authResponse.headers["set-cookie"])
      res.setHeader("Set-Cookie", authResponse.headers["set-cookie"]);

    res.json(authResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.get("/refresh", async (req, res) => {
  try {
    // Forward the logout request to the authentication service
    const authResponse = await axios.get(authServiceUrl + '/refresh', { withCredentials: true, headers: { ...req.headers } });
    res.json(authResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/adduser', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const userResponse = await axios.post(userServiceUrl + '/adduser', req.body);
    res.json(userResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

// Add the verifyJWT middleware to private endpoints
app.use(verifyJWT);

app.post('/askllm', async (req, res) => {
  try {
    // Forward the add user request to the user service
    const llmResponse = await axios.post(llmServiceUrl + '/ask', req.body);
    res.json(llmResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});
app.get('/getRound', async (req, res) => {
  try {
    const { topics } = req.query;

    const roundResponse = await axios.get(questionServiceUrl + '/getRound', {
      params:{topics: topics}
    });

    res.json(roundResponse.data);
  } catch (error) {
    res.status(error.response?.status).json({ error: error.response.data.error });
  }
});

app.get('/getTopics', async (req, res) => {
  try {
    const topicsResponse = await axios.get(questionServiceUrl + '/getTopics');
    res.json(topicsResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.post('/addgame', async (req, res) => {
  try {
    const gameResponse = await axios.post(userServiceUrl + '/addgame', req.body);
    res.json(gameResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.get('/userstats/user/:username', async (req, res) => {
  try {
    const statsResponse = await axios.get(userServiceUrl + '/userstats/user/' + req.params.username);
    res.json(statsResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});


app.get('/usercoins/:username', async (req, res) => {
  try {
    const coinsResponse = await axios.get(userServiceUrl + '/usercoins/' + req.params.username);
    res.json(coinsResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});


app.post('/updatecoins', async (req, res) => {
  try {
    const updateResponse = await axios.post(userServiceUrl + '/updatecoins', req.body);
    res.json(updateResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.get('/userstats/topic/:topic', async (req, res) => {
  try {
    const usersResponse = await axios.get(userServiceUrl + '/userstats/topic/' + req.params.topic);
    res.json(usersResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.get('/userstats/:username/:topic', async (req, res) => {
  try {
    const statsResponse = await axios.get(userServiceUrl + '/userstats/' + req.params.username + '/' + req.params.topic);
    res.json(statsResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

app.get('/games/:username', async (req, res) => {
  try {
    const gamesResponse = await axios.get(userServiceUrl + '/games/' + req.params.username);
    res.json(gamesResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

// Start the gateway service
const server = app.listen(port, () => {
  console.log(`Gateway Service listening at http://localhost:${port}`);
});

module.exports = server
