const express = require('express');
const axios = require('axios');
const cors = require('cors');
const promBundle = require('express-prom-bundle');
const jwt = require('jsonwebtoken');
//libraries required for OpenAPI-Swagger
const swaggerUi = require('swagger-ui-express');
const fs = require("fs")
const YAML = require('yaml')
const httpProxy = require('http-proxy');

const app = express();
const port = 8000;

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';
const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const grafanaUrl = process.env.GRAFANA_URL || 'http://localhost:9091';

app.use(express.json());

// Read the OpenAPI YAML file synchronously
const openapiPath = './openapi.yaml'
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

const allowedOrigins = [
  frontendUrl,
  `http://localhost:${port}`
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Origin is allowed
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization, X-Requested-With, Accept, Origin"
}));

const serverProxy = httpProxy.createProxyServer();
serverProxy.on("proxyReq", (proxyReq, req, res) => {
  if (req.body) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader("Content-Type", "application/json");
    proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }
});

app.all("/monitoring/*", (req, res) => {
  console.log("Proxying request to Grafana:", req.url);
  serverProxy.web(req, res, { target: grafanaUrl, prependPath: false });
});

serverProxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err);
  res.status(500).json({ error: "Proxy error" });
});

// Define a middleware to check authentication
const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "accessTokenSecret", (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded.username;
    req.role = decoded.role;
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.post('/login', async (req, res) => {
  try {
    // Forward the login request to the authentication service
    const authResponse = await axios.post(authServiceUrl + '/login', req.body, { withCredentials: true, headers: { ...req.headers } });

    // For admin users, provide a full URL to the monitoring dashboard
    if (authResponse.data.isAdmin) {
      return res.json({
        ...authResponse.data,
        redirectUrl: "/monitoring/" // Direct URL to Grafana
      });
    }

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
    const { topics, mode, usedImages } = req.query;

    const roundResponse = await axios.get(questionServiceUrl + '/getRound', {
      params: {
        topics: topics,
        mode: mode,
        usedImages: usedImages
      }
    });

    res.json(roundResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Internal server error' });
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

app.get('/getAvailableTopics', async (req, res) => {
  try {
    const availabilityResponse = await axios.get(questionServiceUrl + '/getAvailableTopics');
    res.json(availabilityResponse.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data?.error || 'Unknown error' });
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

app.get('/userstats', async (req, res) => {
  try {
    const { username, mode, topic } = req.query;

    const statsResponse = await axios.get(userServiceUrl + '/userstats', {
      params: { username, mode, topic }
    });

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