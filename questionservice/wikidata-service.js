const axios = require("axios");
const City = require("./wikidata-model");

//Import mongo
const mongoose = require('mongoose'); 

//Import express 
const express = require('express'); 
const app = express();

//For using json
app.use(express.json());

//define the port
const port = 8004; 

//Define the connection to DB
const mongoDB = process.env.MONGODB_URI || 'mongodb://localhost:27017/mongo-db-wichat_en3b'; 

// SPARQL endpoint for WikiData
const SPARQL_ENDPOINT = "https://query.wikidata.org/sparql";

// SPARQL query to get the 50 most populated cities that have an image
const SPARQL_QUERY = `
SELECT DISTINCT ?city ?cityLabel ?image WHERE {  
  ?city wdt:P31 wd:Q515;
        wdt:P1082 ?population;
        wdt:P18 ?image.
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
} 
ORDER BY DESC(?population)
LIMIT 50
`;

mongoose.connect(mongoDB)
.then(() => console.log('Connected'))
.catch(err => console.log('Error on the connection to the DB. ', err)); 

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

// Function to fetch cities from WikiData and store them in MongoDB
async function fetchAndStoreCities() {
    try {
        // Fetch city data from WikiData
        const response = await axios.get(SPARQL_ENDPOINT, {
            params: { query: SPARQL_QUERY, format: "json" }, // Query parameters
            headers: { "User-Agent": "QuizGame/1.0 (student project)" } // User-Agent to avoid request blocking
        });

        // Process the retrieved data and format it
        const cities = await Promise.all(response.data.results.bindings.map(async (city) => {
            const imageUrl = city.image.value;
            const imageAltText = await getImageDescription(imageUrl); // Fetch alternative text for the image

            return {
                id: city.city.value.split("/").pop(), // Extract city ID from the URL
                name: city.cityLabel.value, // Get city name
                imageUrl, // Store image URL
                imageAltText // Store alternative image description
            };
        }));

        // Insert or update city data in MongoDB
        for (const city of cities) {
            await City.findOneAndUpdate(
                { id: city.id }, // Search for an existing document by city ID
                city, // Update or insert this city data
                { upsert: true, new: true } // If not found, insert it; return the updated document
            );
        }

        console.log("Cities successfully stored in MongoDB");

        //if this is uncommented the cities will be returned apart from being saved in the DB
        //return cities; 

    } catch (error) {
        console.error("Error fetching and storing cities:", error);
    }
}

app.post('/load' , async (req, res) => { //Calling the function to get the information from WikiData and store it on the DB
    try {
        await fetchAndStoreCities();
        res.status(200).json({ message: 'Cities successfully stored in MongoDB' });
    } catch(error) {
        console.error('Error fetching data from question service:', error);
        res.status(error.response?.status || 500).json({ error: 'Error fetching question data' });
    }
});

async function getRandomCitiesWithImage() {
    try {
        // 4 random rows from the data base
        const cities = await City.aggregate([{ $sample: { size: 4 } }]);

        // Pick one randomly and get its url for the picture
        const randomCityIndex = Math.floor(Math.random() * cities.length); // Pick a random index
        const randomCity = cities[randomCityIndex];

        return {
            cities: cities.map(city => ({
                
                name: city.name,
            })),
            cityWithImage: randomCity
        };        
    } catch (error) {
        console.error("Error fetching random cities:", error);
        throw error;
    }
}

app.get('/getRound' , async (req, res) => { //Calling the function to get a question
    try {
        const dataFromDatabase = await getRandomCitiesWithImage(); 
        res.json(dataFromDatabase); 
    } catch(error) {
        console.error('Error fetching data from question service:', error);
        res.status(error.response?.status || 500).json({ error: 'Error fetching question data' });
    }
})

async function getCityNameById(cityId) {
    try {
        
        const city = await City.findOne({ id: cityId });

        if (!city) {
            throw new Error(`City with id ${cityId} not found`);
        }

        return city.name;
    } catch (error) {
        console.error("Error fetching city name by id:", error);
        throw error;
    }
}

const server = app.listen(port, () => {
    console.log(`Question Service listening at http://localhost:${port}`);
  });

// Exporting the function so that it can be used in other files
module.exports = server;