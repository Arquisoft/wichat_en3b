const axios = require("axios");
const mongoose = require("mongoose");
const express = require("express");
const WikidataObject = require("./wikidata-model");
const app = express();

app.use(express.json());

//define the port
const port = 8004; 

//Define the connection to DB
const mongoDB = process.env.MONGODB_URI || 'mongodb://localhost:27017/mongo-db-wichat_en3b'; 

// SPARQL endpoint for WikiData
const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

// Global variable to store the selected game modes
let selectedModes = []; 

// Define the SPARQL queries to fetch data from Wikidata
const QUERIES = {
    city: `SELECT ?city ?cityLabel ?image WHERE {
  ?city wdt:P31 wd:Q515;  # The entity is a city
        wikibase:sitelinks ?sitelinks;  # Number of Wikipedia links
        wdt:P18 ?image.  # The city has an image
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`,

    flag: `SELECT ?flag ?flagLabel ?image WHERE {
  ?flag wdt:P31 wd:Q6256;  # The entity is a country
           wikibase:sitelinks ?sitelinks;  # Number of Wikipedia links
           wdt:P41 ?image.  # Country flag image
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)  # Order by popularity
LIMIT 200
`,

    athlete: `SELECT DISTINCT ?athlete ?athleteLabel ?image WHERE {
  ?athlete wdt:P31 wd:Q5;  # The entity is a person
           wdt:P106 ?sport;  # The person is an athlete
           wikibase:sitelinks ?sitelinks;  # Number of Wikipedia links
           wdt:P18 ?image;  # The athlete must have an image
           wdt:P166 ?award.  # The athlete has won a major award

  # Filter by types of athletes
  VALUES ?sport { wd:Q937857 wd:Q10833314 wd:Q3665646 }  
  # Q937857 = Footballer
  # Q10833314 = Tennis player
  # Q3665646 = Basketball player

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)  # Order by popularity
LIMIT 200
`,

    singer: `SELECT ?singer ?singerLabel ?image WHERE {
  ?singer wdt:P31 wd:Q5;  # The entity is a person
          wdt:P106 wd:Q177220;  # The person is a singer
          wikibase:sitelinks ?sitelinks;  # Number of Wikipedia links
          wdt:P18 ?image.  # The person has an image

  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
}
ORDER BY DESC(?sitelinks)
LIMIT 200
`
};


mongoose.connect(mongoDB)
    .then(async () => {
        console.log("✅ Connected to MongoDB");

        if (process.env.NODE_ENV === "test") { // If the environment is test, do not load data
            return;
        }

        await clearDatabase(); // Clear the database before loading new data
        await fetchAndStoreData(); // Fetch data and store it in MongoDB when the service starts
    })
    .catch(err => console.error("❌ Error connecting to the DB:", err));

// Function to clear the database
async function clearDatabase() {
    try {
        await WikidataObject.deleteMany({});
    } catch (error) {
        console.error("Error clearing the database:", error);
    }
}

// Function to fetch the alternative description of an image from Wikimedia Commons
async function getImageDescription(imageUrl) {
    const fileName = decodeURIComponent(imageUrl.split("/").pop()); // Extract the image filename
    const commonsApiUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${fileName}&prop=imageinfo&iiprop=extmetadata&format=json`;

    try {
        const response = await axios.get(commonsApiUrl);
        const pages = response.data.query.pages;
        const pageId = Object.keys(pages)[0]; // Get the first (and only) page ID

        if (pages[pageId].imageinfo) { 
            const metadata = pages[pageId].imageinfo[0].extmetadata;
            return metadata.ImageDescription?.value || "No alternative text available"; // Return image description or fallback message
        }
        return "No alternative text available"; // If no description is found, return a default message
    } catch (error) {
        console.error("Error fetching image description:", error);
        return "No alternative text available"; // Return a fallback message in case of an error
    }
}

async function fetchAndStoreData() {
    console.log("Fetching data from Wikidata and storing it in the database");
    try {
        const fetchPromises = Object.entries(QUERIES).map(async ([mode, query]) => {
            console.log(`-> Fetching data for mode: ${mode}`);
            console.time(`Time taken for ${mode}`);

            const response = await axios.get(SPARQL_ENDPOINT, {
                params: { query, format: "json" },
                headers: { "User-Agent": "QuizGame/1.0 (student project)" }
            });

            const items = response.data.results.bindings.map(item => ({
                id: item[mode]?.value?.split("/").pop() || "Unknown",
                name: item[`${mode}Label`]?.value || "No Name",
                imageUrl: item.image?.value || "",
                mode
            }));

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

            console.timeEnd(`Time taken for ${mode}`);
            console.log(`✔ Finished storing ${mode} data.`);
        });

        await Promise.all(fetchPromises);
        console.log("✅ Data successfully stored in the database.");
    } catch (error) {
        console.error("❌ Error obtaining data from Wikidata:", error);
    }
}

// Endpoint to fetch data from Wikidata and store it in the database
app.post("/load", async (req, res) => {
    try {
        const { modes } = req.body;
        if (!modes || !Array.isArray(modes)) {
            return res.status(400).json({ error: "Invalid modes parameter" });
        }

        selectedModes = modes; // Store the selected modes in the global variable
        //await clearDatabase(); // Clear the database before loading new data
        //await fetchAndStoreData(modes); // Fetch data and store it in MongoDB
        
        res.status(200).json({ message: "Data successfully stored" });
    } catch (error) {
        console.error("Error in /load endpoint:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Function to get random items from MongoDB
async function getRandomItems() {
    try {
        const randomMode = selectedModes[Math.floor(Math.random() * selectedModes.length)]; // Choose a random mode from the selected ones
        const items = await WikidataObject.aggregate([
            { $match: { mode: randomMode } }, // Filter by the chosen mode
            { $sample: { size: 4 } } // Retrieve 4 random items
        ]);

        const randomItem = items[Math.floor(Math.random() * items.length)]; // Choose one random item
        return {
            mode: randomMode,
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
        if (selectedModes.length === 0) {
            return res.status(400).json({ error: "No modes available. Load data first." });
        }

        const data = await getRandomItems(); // Use stored modes instead of receiving them in the request
        res.json(data);
    } catch (error) {
        console.error("Error in /getRound endpoint:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`);
  });

// Exporting the function so that it can be used in other files
module.exports = server;