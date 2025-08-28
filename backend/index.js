require('dotenv').config(); // load .env once
const connectDB = require('./db/mongo');

async function start() {
  await connectDB();

  // Start Sentinel-VM poller
     const startSentinelVM = require('./poller/sentinel-vm');
    startSentinelVM();

  // Start Sentinel-CPM poller
      const startSentinelCPM = require("./poller/sentinel-cpm");
      startSentinelCPM();


  // In future: Add CPM poller, DE-4000, API server, etc.
  // const startCPM = require('./poller/sentinel-cpm');
  // startCPM();

  // const startApiServer = require('./api/server');
  // startApiServer();

  console.log('🚀 All modules started');
}

start();
