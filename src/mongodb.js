const mongoose = require("mongoose");

mongoose.connect("mongodb://admin:admin@mongoauth://localhost:27017/Hotel_Reservation?authSource=admin")
.then(() => {
    console.log("✅ MongoDB is connected");
})
.catch(() => {
    console.log("❌ MongoDB failed to connect");
});

const LogInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const collection = mongoose.model("Collection1", LogInSchema);

module.exports = collection;
