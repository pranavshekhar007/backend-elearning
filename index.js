require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./src/route");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);

const allowedOrigins = [
  "https://frontend-elearning-beta.vercel.app", // Ensure no trailing slash
  "http://localhost:3000", // For local development
];

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true); // Allow requests from listed origins or localhost
      } else {
        callback(new Error("CORS policy does not allow this origin"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Apply fallback CORS headers manually (as a fallback)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // You can specify the origin if needed
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Static file handling for uploads
app.use('/uploads', express.static('uploads'));

// Middleware to handle JSON and URL encoded data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Connect to MongoDB
const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB_STRING)
  .then(() => {
    console.warn("DB connection done again");
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

// Pass the `io` instance to routes
app.use((req, res, next) => {
  req.io = io; // Attach the `io` object to the request
  next();
});

// Routes
app.get("/", (req, res) => res.send(`Server listing on port ${PORT}`));
app.use("/api", routes);
app.all("*", (req, res) => res.status(404).json({ error: "404 Not Found" }));

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () =>
  console.log(`Server running on ${PORT}`)
);
