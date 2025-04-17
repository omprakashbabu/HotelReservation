const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const fs = require("fs");
const csv = require("csv-parser");
const axios = require("axios");
const cors = require("cors");
const fetch = (...args) => import("node-fetch").then(({ default: fetch }) => fetch(...args));
const paypal = require("paypal-rest-sdk");
const collection = require("./mongodb");

// Define paths
const templatePath = path.join(__dirname, "../templates");
const csvFilePath = path.join(__dirname, "google_hotel_data_clean_v2.csv");

app.use(express.static(path.join(__dirname, "..")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Set view engine
app.set("view engine", "hbs");
app.set("views", templatePath);

// Load hotel data from CSV
let hotels = [];
fs.createReadStream(csvFilePath)
    .pipe(csv())
    .on("data", (row) => {
        hotels.push(row);
    })
    .on("end", () => {
        console.log("✅ Hotel data loaded!");
    });

paypal.configure({
    mode: "sandbox", // Change to 'live' for production
    client_id: "AdK5oReJGuV0_GIP73nRJQ3Qe-xJb16tZf0xM_kmWkpY0AgaK3EtrTTgm0y5ZyoPJ4VCqsmRojmrEZYy",
    client_secret: "EHTQHAsJYoMSGphjAe_tT2ShKx0tkqzn-nQPdBsmqs85nWCKNyWNCKO8-ZywVcvcxs_BhfxHNBS9t5ax"
});

// Routes
app.get("/login", (req, res) => res.render("login"));
app.get("/signup", (req, res) => res.render("signup"));
app.get("/home", (req, res) => res.render("home"));

// API keys
const UNSPLASH_ACCESS_KEY = "Dlw-MLbWIwKU5ScSqjcx7ejRnS2EjU1Q_puLr5Ozn9k";
const PEXELS_ACCESS_KEY = "rES5qsnXudc2HaOlOaFypCgma05wsvGPvolZ0YFAbkGQNWe7tDbxLBsz"; // <- YOUR NEW KEY

let imageCache = {}; // To store hotel image URLs

const getImagesFromUnsplash = async (query) => {
    const response = await axios.get('https://api.unsplash.com/search/photos', {
        params: { query, client_id: UNSPLASH_ACCESS_KEY, per_page: 5 }
    });
    return response.data.results;
};

const getImagesFromPexels = async (query) => {
    const response = await axios.get('https://api.pexels.com/v1/search', {
        headers: { Authorization: PEXELS_ACCESS_KEY }, // <-- updated with your new key
        params: { query, per_page: 5 }
    });
    return response.data.photos;
};

app.get("/getHotelImage", async (req, res) => {
    const { hotelName, city } = req.query;

    if (!hotelName) {
        return res.status(400).json({ error: "Hotel name is required" });
    }

    if (imageCache[hotelName]) {
        return res.json({ imageUrl: imageCache[hotelName] });
    }

    let query = `${hotelName} ${city} hotel exterior`;

    try {
        const unsplashImages = await getImagesFromUnsplash(query);
        const pexelsImages = await getImagesFromPexels(query);

        const allImages = [...unsplashImages, ...pexelsImages];

        if (allImages.length > 0) {
            const randomIndex = Math.floor(Math.random() * allImages.length);
            const imageUrl = allImages[randomIndex].urls
                ? allImages[randomIndex].urls.regular
                : allImages[randomIndex].src.original;

            imageCache[hotelName] = imageUrl;

            return res.json({ imageUrl: imageUrl });
        } else {
            return res.json({
                imageUrl: "https://via.placeholder.com/400x250?text=No+Image+Found"
            });
        }
    } catch (error) {
        console.error("Error fetching image:", error);
        return res.status(500).json({ error: "Error fetching image" });
    }
});

app.get("/searchHotels", (req, res) => {
    const query = req.query.query;

    if (!query) {
        return res.status(400).send("❌ Missing search query");
    }

    if (!hotels || hotels.length === 0) {
        return res.status(500).send("❌ Hotel data not loaded yet, please try again.");
    }

    const searchQuery = query.toLowerCase();
    const filteredHotels = hotels.filter(hotel =>
        (hotel["Hotel_Name"] && hotel["Hotel_Name"].toLowerCase().includes(searchQuery)) ||
        (hotel["City"] && hotel["City"].toLowerCase().includes(searchQuery))
    );

    res.render("listHotels", { hotels: filteredHotels });
});

app.get("/success", (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        payer_id: payerId,
        transactions: [{
            amount: {
                currency: "USD",
                total: "50.00"
            }
        }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error);
            res.send("Payment Failed");
        } else {
            res.send("Payment Successful! ✅");
        }
    });
});

app.get("/cancel", (req, res) => {
    res.send("Payment Cancelled ❌");
});

app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
    };

    await collection.insertMany([data]);
    res.render("home");
});

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ email: req.body.email });
        if (check && check.password === req.body.password) {
            res.render("home");
        } else {
            res.send("Wrong password");
        }
    } catch {
        res.send("Wrong details");
    }
});

app.post("/pay", (req, res) => {
    const { hotelName, price } = req.body;

    const create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {
            return_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/cancel"
        },
        transactions: [{
            item_list: {
                items: [{
                    name: hotelName,
                    sku: "001",
                    price: price,
                    currency: "USD",
                    quantity: 1
                }]
            },
            amount: {
                currency: "USD",
                total: price
            },
            description: `Payment for ${hotelName}`
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.log(error);
            res.send("Error creating payment");
        } else {
            for (let link of payment.links) {
                if (link.rel === "approval_url") {
                    res.redirect(link.href);
                }
            }
        }
    });
});

app.listen(80, () => {
    console.log("✅ Server is running on port 80");
});
