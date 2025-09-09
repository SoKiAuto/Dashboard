require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/Wi_Dashboard",
  CPM_SOCKET_URL: process.env.CPM_SOCKET_URL || "http://172.16.0.1:10001",
  HISTORY_INTERVAL: Number(process.env.HISTORY_INTERVAL) || 60 * 1000,
};
