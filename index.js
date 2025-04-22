require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./src/route");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);

// ✅ No trailing slashes
const allowedOrigins = [
  "https://frontend-elearning-beta.vercel.app",
  "http://localhost:3000"
];

// ✅ Apply full CORS config once
const corsOptions = {
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
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ preflight using same options

// ✅ Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// ✅ MongoDB
const mongoose = require("mongoose");
mongoose
  .connect(process.env.DB_STRING)
  .then(() => console.warn("DB connection established"))
  .catch((err) => console.error("DB error:", err));

// ✅ Socket.io
const io = new Server(server, {
  cors: {
    origin: "*", // for dev/testing; restrict for production
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ✅ Routes
app.get("/", (req, res) => res.send(`Server listening on port ${PORT}`));
app.use("/api", routes);
app.all("*", (req, res) => res.status(404).json({ error: "404 Not Found" }));

// ✅ Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
