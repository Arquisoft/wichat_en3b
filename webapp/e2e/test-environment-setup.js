const { MongoMemoryServer } = require('mongodb-memory-server');
const { setDefaultOptions } = require('expect-puppeteer');

let mongoserver;
let userservice;
let authservice;
let llmservice;
let gatewayservice;
let questionservice;

async function startServer() {
    //Way of setting up the timeout
    setDefaultOptions({ timeout: 60000 });

    console.log('Starting MongoDB memory server...');
    mongoserver = await MongoMemoryServer.create();
    const mongoUri = mongoserver.getUri();
    process.env.MONGODB_URI = mongoUri;
    userservice = await require("../../users/userservice/user-service");
    authservice = await require("../../users/authservice/auth-service");
    llmservice = await require("../../llmservice/llm-service");
    questionservice = await require("../../questionservice/wikidata-service");
    gatewayservice = await require("../../gatewayservice/gateway-service");
}

startServer();
