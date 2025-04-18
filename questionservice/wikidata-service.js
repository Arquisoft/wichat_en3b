const axios = require("axios");
const mongoose = require("mongoose");
const express = require("express");
const WikidataObject = require("./wikidata-model");
const crypto = require('crypto');
const app = express();

app.use(express.json());

//define the port
const port = 8004;

//Define the connection to DB
const mongoDB = process.env.MONGODB_URI || 'mongodb://localhost:27017/mongo-db-wichat_en3b';

// Get the queries for the topics
const QUERIES = require('./sparqlQueries');

// SPARQL endpoint for WikiData
const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

async function startUp() {
    try {
        await mongoose.connect(mongoDB);
        console.log("Connected to MongoDB");

        await clearDatabase(); // Clear the database before loading new data
        await fetchAndStoreData(); // Fetch data and store it in MongoDB when the service starts
    } catch (err) {
        console.error("❌ Error connecting to the DB:", err);
    }
}

// Function to clear the database
async function clearDatabase() {
    try {
        console.log("Clearing the database...");
        await WikidataObject.deleteMany({});
        console.log("✅ Database cleared successfully.");
    } catch (error) {
        console.error("Error clearing the database:", error);
    }
}

async function fetchAndStoreData() {
    console.log("Fetching data from Wikidata and storing it in the database");
    try {
        const fetchPromises = Object.entries(QUERIES).map(async ([topic, query]) => {
            console.log(`-> Fetching data for topic: ${topic}`);
            console.time(`Time taken for ${topic}`);

            const response = await axios.get(SPARQL_ENDPOINT, {
                params: { query, format: "json" },
                headers: { "User-Agent": "QuizGame/1.0 (student project)" }
            });

            const items = response.data.results.bindings.map(item => ({
                id: item[topic]?.value?.split("/").pop() || "Unknown",
                name: item[`${topic}Label`]?.value || "No Name",
                imageUrl: item.image?.value || "",
                topic
            })).filter(item => !/^Q\d+$/.test(item.name));

            const bulkOps = items.map(item => ({
                updateOne: {
                    filter: { id: item.id },
                    update: { $set: item },
                    upsert: true
                }
            }));

            if (bulkOps.length > 0) {
                await WikidataObject.bulkWrite(bulkOps);
            }

            console.timeEnd(`Time taken for ${topic}`);
            console.log(`✔ Finished storing ${topic} data.`);
        });

        await Promise.all(fetchPromises);
        console.log("✅ Data successfully stored in the database.");
    } catch (error) {
        console.error("❌ Error obtaining data from Wikidata:", error);
    }
}

// Function to get random items from MongoDB
async function getRandomItems(topics) {
    try {
        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            throw new Error("No valid topics provided.");
        }

        const randomTopic = topics[secureRandomInt(topics.length)]; // Choose a random topic from the selected ones
        const items = await WikidataObject.aggregate([
            { $match: { topic: randomTopic } }, // Filter by the chosen topic
            { $sample: { size: 4 } } // Retrieve 4 random items
        ]);

        const randomItem = items[secureRandomInt(items.length)]; // Choose one random item
        return {
            topic: randomTopic,
            items: items.map(item => ({ name: item.name })), // Return only names
            itemWithImage: randomItem // Return one item with an image
        };
    } catch (error) {
        console.error("Error fetching random items:", error);
        throw error;
    }
}

function secureRandomInt(max) {
    if (max <= 0 || !Number.isInteger(max)) throw new Error("Invalid max value");

    const byteSize = 256;
    const randomByte = () => crypto.randomBytes(1)[0];
    let rand;
    do {
        rand = randomByte();
    } while (rand >= byteSize - (byteSize % max));
    return rand % max;
}

// Endpoint to get a game round with random items
app.get("/getRound", async (req, res) => {
    try {
        const { topics } = req.query; // Get the topics from the query parameters
        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            return res.status(400).json({ error: "Missing or invalid topics" });
        }

        const data = await getRandomItems(topics);
        res.json(data);
    } catch (error) {
        console.error("Error in /getRound endpoint:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/getTopics", (req, res) => {
    res.json({ topics: Object.keys(QUERIES) }); // Return the available game topics
});

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`);
    if (process.env.NODE_ENV === "test") {
        console.log("Test mode detected. Skipping data load.");
        return;
    }

    startUp(); // Start the service and load data
});

// Exporting the function so that it can be used in other files
module.exports = { server, startUp };