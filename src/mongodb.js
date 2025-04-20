const mongoose = require("mongoose");

mongoose.connect("13.201.129.14:27017/HotelReservation")
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
