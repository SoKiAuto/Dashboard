const WebSocket = require("ws");
const ws = new WebSocket("ws://localhost:4110");

ws.on("open", () => {
  console.log("✅ Connected to server");

  // Screen 1 → subscribe these
  ws.send(JSON.stringify({
    action: "readTags",
    tags: [
      "/Station/Compressors/01/Analog/GD_101/engValue",
      "/Station/Compressors/01/Analog/GD_102/engValue"
    ]
  }));

  // After 15s switch to Screen 2
  setTimeout(() => {
    ws.send(JSON.stringify({
      action: "readTags",
      tags: [
        "/Station/Compressors/01/Analog/PT_101/engValue",
        "/Station/Compressors/01/Analog/PT_102/engValue"
      ]
    }));
    console.log("📲 Screen changed → updated tags");
  }, 15000);
});

ws.on("message", (event) => {
  const update = JSON.parse(event);
  if (update.snapshot) {
    console.log("📸 Snapshot:", update.path, update.snapshot);
  } else {
    console.log("🔄 Update:", update.path, update.data);
  }
});
