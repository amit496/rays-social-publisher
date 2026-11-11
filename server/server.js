const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://rays-social-publisher.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RAYS TechLab Social Publisher API is running!"
  });
});

// MongoDB connection
let connectionPromise = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(
      process.env.MONGODB_URI
    ).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
}

// Database middleware BEFORE API routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

// API routes
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/instagram", require("./routes/instagramRoutes"));

// Local development
if (process.env.VERCEL !== "1") {
  connectDB()
    .then(() => {
      const PORT = process.env.PORT || 5000;

      app.listen(PORT, () => {
        console.log(
          `Server running on http://localhost:${PORT}`
        );
      });
    })
    .catch((error) => {
      console.error("MongoDB connection failed:", error.message);
    });
}

module.exports = app;