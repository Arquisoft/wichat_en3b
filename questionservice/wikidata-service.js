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

        await fetchAndStoreData(); // Fetch data and store it in MongoDB when the service starts
    } catch (err) {
        console.error("❌ Error connecting to the DB:", err);
    }
}

// Function to clear the database (just for development)
/** 
async function clearDatabase() {
    try {
        console.log("Clearing the database...");
        await WikidataObject.deleteMany({});
        console.log("✅ Database cleared successfully.");
    } catch (error) {
        console.error("Error clearing the database:", error);
    }
}
*/

// Function to pause execution
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAndStoreData() {
    console.log("Fetching data from Wikidata and storing it in the database");
    
    // Define the freshness threshold (15 days in milliseconds)
    const FRESHNESS_THRESHOLD = 15 * 24 * 60 * 60 * 1000; // 15 days in ms
    const now = new Date();
    
    // Get all topics from the database
    const topicUpdates = await TopicUpdate.find().lean();
    const topicUpdateMap = topicUpdates.reduce((acc, update) => {
        acc[update.topic] = update;
        return acc;
    }, {});
    
    // Filter topics that need updating (not in DB or older than threshold)
    const topicsToUpdate = [];
    for (const topic of Object.keys(QUERIES)) {
        const update = topicUpdateMap[topic];
        if (!update || (now - new Date(update.lastUpdated) > FRESHNESS_THRESHOLD)) {
            topicsToUpdate.push(topic);
        } else {
            console.log(`Topic '${topic}' is up to date (last updated: ${update.lastUpdated})`);
        }
    }
    
    if (topicsToUpdate.length === 0) {
        console.log("✅ All topics are up to date (updated within the last 15 days).");
        return;
    }
    
    console.log(`Found ${topicsToUpdate.length} topics that need updating: ${topicsToUpdate.join(', ')}`);
    
    // Create a map to track the processing status of each topic
    const topicStatus = topicsToUpdate.reduce((acc, topic) => {
        acc[topic] = { 
            processed: false, 
            attempts: 0,
            processing: false,
            lastAttemptTime: 0
        };
        return acc;
    }, {});
    
    // Function to process a single topic
    async function processTopic(topic) {
        if (topicStatus[topic].processed || topicStatus[topic].processing) {
            return; // Skip if already processed or currently being processed
        }
        
        // Mark as being processed to prevent concurrent processing
        topicStatus[topic].processing = true;
        topicStatus[topic].attempts += 1;
        topicStatus[topic].lastAttemptTime = Date.now();
        
        const query = QUERIES[topic];
        console.log(`-> Fetching data for topic: ${topic} (Attempt ${topicStatus[topic].attempts})`);
        console.time(`Time taken for ${topic}`);
        
        try {
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
                console.log(`✅ Stored ${bulkOps.length} items for topic '${topic}'`);
                
                // Log a sample of what was stored
                if (bulkOps.length > 0) {
                    const sampleItem = bulkOps[0].updateOne.update.$set;
                    console.log(`Sample item stored for '${topic}':`, JSON.stringify(sampleItem, null, 2));
                }
                
                // Update the last updated timestamp
                await TopicUpdate.findOneAndUpdate(
                    { topic },
                    { lastUpdated: new Date() },
                    { upsert: true }
                );
            }

            console.timeEnd(`Time taken for ${topic}`);
            console.log(`✔ Finished storing ${topic} data.`);
            
            // Mark as successfully processed
            topicStatus[topic].processed = true;
            topicStatus[topic].processing = false;
            
        } catch (error) {
            console.timeEnd(`Time taken for ${topic}`);
            console.error(`❌ Error processing topic ${topic}:`, error.message);
            
            // Mark as not being processed anymore (will be retried)
            topicStatus[topic].processing = false;
        }
    }
    
    // Start processing all topics that need updating
    const initialPromises = topicsToUpdate.map(topic => processTopic(topic));
    await Promise.all(initialPromises);
    
    // Set up interval to check for failed topics and retry them every 2.5 seconds
    const RETRY_DELAY = 2500; // 2.5 seconds
    const retryInterval = setInterval(() => {
        const pendingTopics = Object.entries(topicStatus)
            .filter(([_, status]) => !status.processed && !status.processing)
            .map(([topic, _]) => topic);
        
        if (pendingTopics.length === 0) {
            clearInterval(retryInterval);
            checkCompletion();
            return;
        }
        
        console.log(`Retrying ${pendingTopics.length} pending topics...`);
        pendingTopics.forEach(topic => processTopic(topic));
    }, RETRY_DELAY);
    
    // Function to check completion status
    function checkCompletion() {
        const remainingTopics = Object.entries(topicStatus)
            .filter(([_, status]) => !status.processed)
            .map(([topic, _]) => topic);
        
        if (remainingTopics.length === 0) {
            console.log("✅ All topics were processed successfully!");
            logTopicCounts();
        } else {
            // Check again in 1 second
            setTimeout(checkCompletion, 1000);
        }
    }
    
    // Log the number of items for each topic
    async function logTopicCounts() {
        console.log("✅ Data successfully stored in the database.");
        for (const topic of Object.keys(QUERIES)) {
            const topicCount = await WikidataObject.countDocuments({ topic });
            console.log(`  - Topic '${topic}': ${topicCount} items`);
        }
    }
    
    // Start checking for completion
    checkCompletion();
    
    // Return a promise that resolves when all topics are processed
    return new Promise((resolve) => {
        const checkForCompletion = setInterval(() => {
            const allDone = Object.values(topicStatus).every(status => status.processed);
            if (allDone) {
                clearInterval(checkForCompletion);
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