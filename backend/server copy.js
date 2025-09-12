const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./utils/config");
const logger = require("./utils/logger");

// Services
const { startCPMSocketService } = require("./services/CPMsocketService");
const CPMhistoryService = require("./services/CPMhistoryService");

const app = express();
const PORT = config.PORT || 5000;

// ---------------------------
// 1. MIDDLEWARES
// ---------------------------
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ---------------------------
// 2. DATABASE CONNECTION
// ---------------------------
const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.success("✅ MongoDB connected successfully");
  } catch (err) {
    logger.error(`❌ MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

// ---------------------------
// 3. BASIC ROUTES
// ---------------------------

// Health check API
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "CPM Dashboard Backend is Running ✅",
    timestamp: new Date(),
  });
});

// ---------------------------
// 4. START SERVER
// ---------------------------
const startServer = async () => {
  await connectDB();

  // Start Express server
  app.listen(PORT, () => {
    logger.success(`🚀 Server running on http://localhost:${PORT}`);
  });

  // Start Socket.IO listener for CPM devices
  startCPMSocketService();

  // Start automatic history snapshot scheduler
  CPMhistoryService.startScheduler(config.HISTORY_INTERVAL || 60 * 1000);

  logger.info("📡 CPM Dashboard Backend Services Started...");
};

startServer();
