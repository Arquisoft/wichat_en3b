const mongoose = require("mongoose");

// Define the schema for tracking topic updates
const topicUpdateSchema = new mongoose.Schema({
    topic: { 
        type: String, 
        required: true, 
        unique: true 
    },
    lastUpdated: { 
        type: Date, 
        default: Date.now 
    }
});

// Export the model
const TopicUpdate = mongoose.model("TopicUpdate", topicUpdateSchema);
module.exports = TopicUpdate;