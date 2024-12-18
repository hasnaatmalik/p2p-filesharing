const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const FILE_DIR = path.join(__dirname, "p2p-files");
if (!fs.existsSync(FILE_DIR)) {
  fs.mkdirSync(FILE_DIR);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter server URL (e.g., ws://localhost:3000): ", (serverURL) => {
  rl.question("Enter your unique peer ID: ", (peerID) => {
    const ws = new WebSocket(serverURL);

    ws.on("open", () => {
      console.log("Connected to server.");
      ws.send(JSON.stringify({type: "register", peerID}));
    });

    ws.on("message", (message) => {
      const data = JSON.parse(message);
      if (data.type === "error" && data.message === "Username already taken") {
        console.error(
          "This username is already taken. Please restart and choose another."
        );
        process.exit(1); // Exit if username is not unique
      }
      switch (data.type) {
        case "peer-list":
          console.log("Connected peers:", data.peers);
          break;

        case "file-list":
          console.log("Available files:", data.files);
          break;

        case "file-response":
          saveFile(data);
          break;

        case "chat":
          console.log(
            `${data.sender}: ${Buffer.from(data.content, "base64").toString()}`
          );
          break;
        case "file-response":
          saveFile(data);
          break;
        case "file-preview-response":
          console.log(`Preview for ${data.filename}:`);
          console.log(data.content); // Log preview in CLI
          break;
        default:
          console.log("Unknown message type:", data);
      }
    });

    rl.on("line", (input) => {
      const [command, ...args] = input.split(" ");
      if (command === "list") {
        ws.send(JSON.stringify({type: "file-list-request"}));
      } else if (command === "download") {
        ws.send(
          JSON.stringify({type: "file-request", filename: args.join(" ")})
        );
      } else if (command === "upload") {
        uploadFile(ws, args.join(" "), peerID);
      } else if (command === "chat") {
        ws.send(
          JSON.stringify({
            type: "chat",
            sender: peerID,
            content: Buffer.from(args.join(" ")).toString("base64"),
          })
        );
      } else {
        console.log(
          "Commands: list | download <filename> | upload <filename> | chat <message>"
        );
      }
    });
  });
});

function uploadFile(ws, filename, peerID) {
  const filePath = path.join(FILE_DIR, filename);
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath).toString("base64");
    ws.send(JSON.stringify({type: "file-upload", filename, fileContent}));
    console.log(`Uploaded: ${filename}`);
  } else {
    console.log(`File not found: ${filename}`);
  }
}

function saveFile({filename, fileContent}) {
  const filePath = path.join(FILE_DIR, filename);
  fs.writeFile(filePath, Buffer.from(fileContent, "base64"), (err) => {
    if (err) {
      console.error(`Failed to save file ${filename}:`, err.message);
    } else {
      console.log(`File saved: ${filename}`);
    }
  });
}
