require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const routes = require("./src/route");

const app = express();

// Middleware
app.use(cors({
  origin: [
    "https://frontend-elearning-beta.vercel.app",
    "http://localhost:3000"
  ],
  credentials: true,
}));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Static files
app.use('/uploads', express.static('uploads'));

// DB Connection
mongoose.connect(process.env.DB_STRING)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ DB Error:", err));

// Routes
app.get("/", (req, res) => res.send("Backend is working"));
app.use("/api", routes);
app.all("*", (req, res) => res.status(404).json({ error: "404 Not Found" }));

// ✅ Export app for Vercel
module.exports = app;
