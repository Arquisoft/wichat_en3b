const mongoose = require("mongoose");

// Define the schema for the objects
const wikidataObjectSchema = new mongoose.Schema({
    id: { type: String, unique: true },
    name: String,
    imageUrl: String,
    imageAltText: String,
    topic: String
});

// Export the model
const WikidataObject = mongoose.model("WikidataObject", wikidataObjectSchema);
module.exports = WikidataObject;