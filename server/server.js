const express = require("express");
const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const FILE_DIR = path.join(__dirname, "p2p-files");

// Ensure the file directory exists
if (!fs.existsSync(FILE_DIR)) {
  fs.mkdirSync(FILE_DIR);
}
const PUBLIC_DIR = path.join(__dirname, "..", "public");
// Serve frontend
app.use(express.static(PUBLIC_DIR));

// Optional: Handle the root URL explicitly
app.get("/", (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

// Start the HTTP server
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});
app.get("/", (req, res) => {
  console.log("Root URL accessed");
  res.sendFile(path.join(PUBLIC_DIR, "index.html"));
});

const wss = new WebSocket.Server({server});
const peers = {};

// Broadcast data to all peers
function broadcastToAll(message) {
  Object.values(peers).forEach((peer) => peer.send(JSON.stringify(message)));
}

// Send the file list to a peer
function sendFileList(ws) {
  const files = fs.readdirSync(FILE_DIR).map((file) => ({
    filename: file,
    version: 1, // Default version
  }));
  ws.send(JSON.stringify({type: "file-list", files}));
}

// Handle WebSocket connections
wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    const data = JSON.parse(message);

    switch (data.type) {
      case "register":
        if (peers[data.peerID]) {
          // Notify the client that the PeerID is already taken
          ws.send(
            JSON.stringify({type: "error", message: "PeerID already taken"})
          );
        } else {
          // Register the new peer
          peers[data.peerID] = ws;
          console.log(`Peer registered: ${data.peerID}`);
          broadcastToAll({type: "peer-list", peers: Object.keys(peers)});
          sendFileList(ws);
        }
        break;

      case "file-list-request":
        sendFileList(ws);
        break;

      case "file-request":
        sendFile(ws, data.filename);
        break;

      case "file-upload":
        saveFile(data);
        break;

      case "chat":
        broadcastToAll(data);
        break;

      case "file-preview":
        sendFilePreview(ws, data.filename);
        break;

      default:
        ws.send(
          JSON.stringify({type: "error", message: "Unknown request type"})
        );
    }
  });

  ws.on("close", () => {
    const username = Object.keys(peers).find((key) => peers[key] === ws);
    if (username) {
      console.log("Removing disconnected username:", username);
      delete peers[username];
    }
  });
});

// Save an uploaded file
function saveFile({filename, fileContent}) {
  const filePath = path.join(FILE_DIR, filename);
  fs.writeFile(filePath, Buffer.from(fileContent, "base64"), (err) => {
    if (err) {
      console.error(`Error saving file ${filename}:`, err.message);
    } else {
      console.log(`File uploaded: ${filename}`);
      broadcastToAll({type: "file-list-update"});
    }
  });
}

// Send a file to a peer
function sendFile(ws, filename) {
  const filePath = path.join(FILE_DIR, filename);
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath).toString("base64");
    ws.send(JSON.stringify({type: "file-response", filename, fileContent}));
  } else {
    ws.send(
      JSON.stringify({type: "error", message: `File not found: ${filename}`})
    );
  }
}
function sendFilePreview(ws, filename) {
  const filePath = path.join(FILE_DIR, filename);
  if (fs.existsSync(filePath)) {
    const fileExtension = path.extname(filename).toLowerCase();
    const supportedPreviewFormats = [".jpg", ".jpeg", ".png", ".pdf"];

    if (supportedPreviewFormats.includes(fileExtension)) {
      const fileContent = fs.readFileSync(filePath).toString("base64");
      ws.send(
        JSON.stringify({
          type: "file-preview-response",
          filename,
          content: fileContent,
          format: fileExtension,
        })
      );
    } else {
      ws.send(
        JSON.stringify({
          type: "file-preview-response",
          filename,
          content: null,
          message: "Preview not supported for this file type. Please download.",
        })
      );
    }
  } else {
    ws.send(
      JSON.stringify({type: "error", message: `File not found: ${filename}`})
    );
  }
}
