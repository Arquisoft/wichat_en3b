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
const cookieParser = require('cookie-parser');

const app = express();
const port = 8000;

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
const questionServiceUrl = process.env.QUESTION_SERVICE_URL || 'http://localhost:8004';
const llmServiceUrl = process.env.LLM_SERVICE_URL || 'http://localhost:8003';
const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:8002';
const userServiceUrl = process.env.USER_SERVICE_URL || 'http://localhost:8001';
const grafanaUrl = process.env.GRAFANA_URL || 'http://localhost:9091';

app.use(express.json());
app.use(cookieParser());

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

//Prometheus configuration
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  includeStatusCode: true,
  includeDefaultMetrics: true,
  normalizePath: true,
  promClient: {
      collectDefaultMetrics: {
      }
  },
});
app.use(metricsMiddleware);

// CORS configuration
const allowedOrigins = [
  frontendUrl,
  `http://localhost:${port}`
];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) {
      // Allow non-browser requests (e.g., server-to-server requests)
      return callback(null, true);
    }

    try {
      const url = new URL(origin);
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        const allowedUrl = new URL(allowedOrigin);
        return allowedUrl.hostname === url.hostname; // Match hostname only
      });

      if (isAllowed) {
        return callback(null, true); // Origin is allowed
      }

      console.error(`Origin ${origin} not allowed by CORS`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    } catch (err) {
      console.error(`Invalid origin: ${origin}`);
      callback(new Error(`Invalid origin: ${origin}`));
    }
  },
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type, Authorization, X-Requested-With, Accept, Origin"
}));

// Set up a proxy server for Grafana
// This proxy server will forward requests to the Grafana service
const serverProxy = httpProxy.createProxyServer();
serverProxy.on("proxyReq", (proxyReq, req, res) => {
  if (req.body) {
    const bodyData = JSON.stringify(req.body);
    proxyReq.setHeader("Content-Type", "application/json");
    proxyReq.setHeader("Content-Length", Buffer.byteLength(bodyData));
    proxyReq.write(bodyData);
  }
});

serverProxy.on("error", (err, req, res) => {
  console.error("Proxy error:", err);
  res.status(500).json({ error: "Proxy error" });
});

// Define a middleware to check authentication
const verifyJWT = (req, res, next) => {
  let token = null;
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader?.startsWith('Bearer '))
    token = authHeader.split(' ')[1];
  else if (req.cookies?.accessToken)
    token = req.cookies.accessToken;

  if (!token)
    return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "accessTokenSecret", (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token. Please log in again.' });
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

    // Forward the cookie to the client from the authentication service
    if (authResponse.headers && authResponse.headers["set-cookie"])
      res.setHeader("Set-Cookie", authResponse.headers["set-cookie"]);
    
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

// Proxy requests to Grafana
app.all("/admin/monitoring/*", (req, res) => {
  // Verify if the user has admin role
  if (req.role !== 'admin')
    return res.status(403).json({ error: 'Forbidden' });

  console.log("Proxying request to Grafana:", req.url);
  serverProxy.web(req, res, { target: grafanaUrl, prependPath: false, headers: { ...req.headers } });
});

app.get('/isAdmin/:username', async (req, res) => {
  try {
    // Forward the isAdmin request to the user service
    const userResponse = await axios.get(userServiceUrl + '/isAdmin/' + req.params.username);
    res.json(userResponse.data);
  } catch (error) {
    res.status(error.response.status).json({ error: error.response.data.error });
  }
});

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