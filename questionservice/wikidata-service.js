const axios = require("axios");
const mongoose = require("mongoose");
const express = require("express");
const WikidataObject = require("./wikidata-model");
const TopicUpdate = require("./topics-update-model");
const crypto = require('crypto');
const app = express();

app.use(express.json());

// Define the port
const port = 8004;

// Define the connection to DB
const mongoDB = process.env.MONGODB_URI || 'mongodb://localhost:27017/mongo-db-wichat_en3b';

// Get the queries for the topics
const QUERIES = require('./sparqlQueries');

// SPARQL endpoint for WikiData
const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

// Retry configuration
const RETRY_DELAY = 5000; // 5 seconds between retry attempts

async function startUp() {
    try {
        await mongoose.connect(mongoDB);
        console.log("Connected to MongoDB");

        await clearDatabase(); // Clear the database (for development purposes)
        await fetchAndStoreData(); // Fetch data and store it in MongoDB when the service starts
    } catch (err) {
        console.error("❌ Error connecting to the DB:", err);
    }
}

// Function to clear the database (just for development)
async function clearDatabase() {
    try {
        console.log("Clearing the database...");
        await WikidataObject.deleteMany({});
        console.log("✅ Database cleared successfully.");
    } catch (error) {
        console.error("Error clearing the database:", error);
    }
}

// Function to pause execution
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndStoreData() {
    console.log("Fetching data from Wikidata and storing it in the database");

    // Define the freshness threshold (15 days in milliseconds) if needed
    const FRESHNESS_THRESHOLD = 15 * 24 * 60 * 60 * 1000; // 15 days
    const now = new Date();

    // Get all topics from the database and determine which to update
    const topicUpdates = await TopicUpdate.find().lean();
    const topicUpdateMap = topicUpdates.reduce((acc, update) => {
        acc[update.topic] = update;
        return acc;
    }, {});

    const topicsToUpdate = [];
    for (const topic of Object.keys(QUERIES)) {
        const update = topicUpdateMap[topic];
        // Uncomment freshness check if desired:
        // if (!update || (now - new Date(update.lastUpdated) > FRESHNESS_THRESHOLD)) {
            topicsToUpdate.push(topic);
        // }
    }

    if (topicsToUpdate.length === 0) {
        console.log("✅ All topics are up to date.");
        return;
    }

    console.log(`Found ${topicsToUpdate.length} topics to update: ${topicsToUpdate.join(", ")}`);

    // Track status per topic
    const topicStatus = topicsToUpdate.reduce((acc, topic) => {
        acc[topic] = { processed: false, attempts: 0, processing: false, intervalId: null };
        return acc;
    }, {});

    // Kick off initial processing of each topic
    topicsToUpdate.forEach(topic => processTopic(topic));

    async function processTopic(topic) {
        const status = topicStatus[topic];
        if (status.processed || status.processing) return;

        status.processing = true;
        status.attempts += 1;
        console.log(`🤔 Fetching data for topic: ${topic} (Attempt ${status.attempts})`);
        console.time(`Time taken for ${topic}`);

        try {
            const query = QUERIES[topic];
            const response = await axios.get(SPARQL_ENDPOINT, {
                params: { query, format: "json" },
                headers: { "User-Agent": "QuizGame/1.0 (student project)" }
            });

            const items = response.data.results.bindings.map(item => ({
                id: item[topic]?.value.split("/").pop() || "Unknown",
                name: item[`${topic}Label`]?.value || "No Name",
                imageUrl: item.image?.value || "",
                topic
            })).filter(item => !/^Q\d+$/.test(item.name));

            console.log(`🔎 ​${items.length} items for topic: ${topic}`);

            await WikidataObject.deleteMany({ topic }); // Clear old data for the topic

            if (items.length > 0) {
                const bulkOps = items.map(item => ({
                    updateOne: { filter: { id: item.id }, update: { $set: item }, upsert: true }
                }));
                await WikidataObject.bulkWrite(bulkOps);
            }

            // Check in the database the number of items stored
            const count = await WikidataObject.countDocuments({ topic });
            console.log(`📈​ ${count} items stored for topic: ${topic}`);

            await TopicUpdate.findOneAndUpdate(
                { topic },
                { lastUpdated: new Date() },
                { upsert: true }
            );

            console.timeEnd(`Time taken for ${topic}`);
            console.log(`✅ Finished storing ${topic} data.`);

            status.processed = true;
            status.processing = false;

            // Stop retry interval if running
            if (status.intervalId) {
                clearInterval(status.intervalId);
                status.intervalId = null;
            }

            checkCompletion();
        } catch (error) {
            console.timeEnd(`Time taken for ${topic}`);
            console.error(`❌ Error processing topic ${topic}:`, error.message);

            status.processing = false;

            // Start retry loop if not already set
            if (!status.intervalId) {
                status.intervalId = setInterval(() => processTopic(topic), 2000);
            }
        }
    }

    function checkCompletion() {
        const allDone = Object.values(topicStatus).every(s => s.processed);
        if (allDone) {
            console.log("✅✅✅ All topics were processed successfully!");

            // Clear any remaining intervals
            Object.values(topicStatus).forEach(s => {
                if (s.intervalId) clearInterval(s.intervalId);
            });
            logTopicCounts();
        }
    }

    async function logTopicCounts() {
        console.log("✅✅✅ Data successfully stored in the database. {");
        for (const topic of Object.keys(QUERIES)) {
            const count = await WikidataObject.countDocuments({ topic });
            console.log(`  - Topic '${topic}': ${count} items`);
        }
        console.log("}");
    }

    // Return a promise that resolves when all done (optional)
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (Object.values(topicStatus).every(s => s.processed)) {
                clearInterval(interval);
                resolve();
            }
        }, 1000);
    });
}


// Function to get random items from MongoDB
async function getRandomItems(topics) {
    try {
        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            throw new Error("No valid topics provided.");
        }

        const randomTopic = topics[Math.floor(Math.random() * topics.length)]; // Choose a random topic from the selected ones
        const items = await WikidataObject.aggregate([
            { $match: { topic: randomTopic } }, // Filter by the chosen topic
            { $sample: { size: 4 } } // Retrieve 4 random items
        ]);

        const randomItem = items[Math.floor(Math.random() * items.length)]; // Choose one random item
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

// Endpoint to get a game round with random items
app.get("/getRound", async (req, res) => {
    try {
        const { topics, mode, usedImages } = req.query; // Get all three parameters
        
        // Validate topics
        if (!topics || !Array.isArray(topics) || topics.length === 0) {
            return res.status(400).json({ error: "Missing or invalid topics" });
        }
        
        // Parse usedImages if it exists (it might come as a string from the query params)
        let parsedUsedImages = [];
        if (usedImages) {
            try {
                // If it's an array in string form, parse it
                parsedUsedImages = Array.isArray(usedImages) ? usedImages : JSON.parse(usedImages);
            } catch (e) {
                console.warn("Could not parse usedImages, treating as empty array", e);
            }
        }

        // For "rounds" or "hide" modes, filter out used images
        if (mode === "rounds" || mode === "hide") {
            let data;
            let attempts = 0;
            const maxAttempts = 10; // Prevent infinite loops
            
            // Try to get an image that's not in usedImages
            do {
                data = await getRandomItems(topics);
                attempts++;
                
                // Break the loop if we found an unused image or reached max attempts
                if (!parsedUsedImages.includes(data.itemWithImage.imageUrl) || attempts >= maxAttempts) {
                    break;
                }
            } while (true);
            
            // If we couldn't find an unused image after max attempts, just return what we have
            return res.json(data);
        } else {
            // For other modes, just get random items without filtering
            const data = await getRandomItems(topics);
            return res.json(data);
        }
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

// Verify if the topics are available in the database
app.get("/getAvailableTopics", async (req, res) => {
    try {
        const availableTopics = [];

        const allTopics = Object.keys(QUERIES);

        for (const topic of allTopics) {
            const count = await WikidataObject.countDocuments({ topic });
            if (count > 0) {
                availableTopics.push(topic);
            }
        }

        res.json({ availableTopics });
    } catch (error) {
        console.error("Error checking available topics:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Exporting the function so that it can be used in other files
module.exports = { server, startUp, fetchAndStoreData };