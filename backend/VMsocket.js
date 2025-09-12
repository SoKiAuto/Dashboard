const fs = require('fs');
const path = require('path');
const { io } = require("socket.io-client");

const DEVICE_URL = "http://172.16.0.1:10001";
const socket = io(DEVICE_URL, {
  reconnection: false
});

const filePath = path.join(__dirname, 'VMJsondata.json');

// Store event history
let allData = {};

function saveData() {
  fs.writeFile(filePath, JSON.stringify(allData, null, 2), (err) => {
    if (err) {
      console.error('Error saving data:', err);
    } else {
      console.log('Data saved to VMJsondata.json');
    }
  });
}

socket.on('connect', () => {
  console.log('Connected to device:', DEVICE_URL);
});

socket.on('connect_error', (err) => {
  console.error('Connection error:', err.message);
});

socket.onAny((event, data) => {
  console.log(`Received event: ${event}`);
  if (!allData[event]) {
    allData[event] = [];
  }
  allData[event].push({
    timestamp: new Date().toISOString(),
    data: data
  });

  console.log(`Stored ${event} event`);
  saveData();
});

socket.on('disconnect', () => {
  console.log('Disconnected from device');
});
