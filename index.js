require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./src/route");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);

// ✅ Fixed: Remove trailing slash from frontend URL
const allowedOrigins = [
  "https://frontend-elearning-beta.vercel.app/",
  "http://localhost:3000"
];

// ✅ Apply CORS only once, with full config
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Handle preflight OPTIONS requests
app.options("*", cors());

// ✅ Apply middleware after CORS
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ✅ Connect to DB
const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB_STRING)
  .then(() => {
    console.warn("DB connection established");
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });

// ✅ Setup Socket.IO with open CORS (for development)
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Attach `io` to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Routes
app.get("/", (req, res) => res.send(`Server listening on port ${PORT}`));
app.use("/api", routes);
app.all("*", (req, res) => res.status(404).json({ error: "404 Not Found" }));

// ✅ Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));