// UI Elements
const peerList = document.getElementById("peer-list");
const fileList = document.getElementById("file-list");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const uploadFile = document.getElementById("upload-file");
const uploadBtn = document.getElementById("upload-btn");
const emojiPicker = document.getElementById("emoji-picker");
const emojiBtn = document.getElementById("emoji-btn");

let peerID;
function promptPeerID() {
  peerID = prompt("Enter a unique Peer ID:");
  if (!peerID) {
    alert("Peer ID cannot be empty.");
    return promptPeerID();
  }
  ws.send(JSON.stringify({type: "register", peerID}));
  console.log(`Attempting to register Peer ID: ${peerID}`);
}

const ws = new WebSocket("ws://192.168.1.6:3000"); // Replace with your server's IP

ws.onopen = () => {
  promptPeerID(); // Prompt for Peer ID when connection opens
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  if (data.type === "error" && data.message.includes("PeerID")) {
    alert(data.message); // Notify the user if PeerID is already taken
    location.reload(); // Reload to allow the user to choose another ID
  } else {
    // Handle other message types as before
    console.log("Message received:", data);
  }
};

// Update peer list in the UI
function updatePeerList(peers) {
  peerList.innerHTML = ""; // Clear the current list

  peers.forEach((peer) => {
    const listItem = document.createElement("li");
    listItem.textContent = peer; // Use the username directly
    listItem.className = "list-group-item";
    peerList.appendChild(listItem);
  });
}

// Handle incoming messages
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case "peer-list":
      updatePeerList(data.peers);
      break;
    case "error":
      if (data.message.includes("PeerID")) {
        alert(data.message); // Show error for duplicate Peer ID
        promptPeerID(); // Prompt the user to enter a new Peer ID
      }
      break;
    case "file-list":
      updateFileList(data.files);
      break;

    case "chat":
      displayChatMessage(data.sender, data.content);

      break;

    case "file-preview-response":
      if (data.content) {
        openPreviewInNewTab(data.filename, data.content, data.format);
      } else {
        alert(data.message || "Preview not available for this file type.");
      }
      break;

    case "file-response":
      saveFileLocally(data.filename, data.fileContent);
      break;

    default:
      console.log("Unknown message type:", data.type);
  }
};

// Update peer list in the UI
function updatePeerList(peers) {
  peerList.innerHTML = peers.map((peer) => `<li>${peer}</li>`).join("");
}

// Update file list in the UI
function updateFileList(files) {
  fileList.innerHTML = "";
  files.forEach((file) => {
    const listItem = document.createElement("li");
    listItem.className = "list-group-item";

    const fileInfo = `${file.filename} (v${file.version || 1})`;
    listItem.textContent = fileInfo;

    const previewBtn = document.createElement("button");
    previewBtn.className = "btn btn-outline-info btn-sm";
    previewBtn.textContent = "Preview";
    previewBtn.onclick = () => requestFilePreview(file.filename);

    const downloadBtn = document.createElement("button");
    downloadBtn.className = "btn btn-outline-success btn-sm";
    downloadBtn.textContent = "Download";
    downloadBtn.onclick = () => downloadFile(file.filename);

    listItem.appendChild(previewBtn);
    listItem.appendChild(downloadBtn);
    fileList.appendChild(listItem);
  });
}

// Request file preview
function requestFilePreview(filename) {
  ws.send(JSON.stringify({type: "file-preview", filename}));
  console.log(`Preview requested for: ${filename}`);
}

// Download file function (triggered by button click)
function downloadFile(filename) {
  ws.send(
    JSON.stringify({
      type: "file-request",
      filename,
    })
  );
  console.log(`Download requested for: ${filename}`);
}

// Upload files
uploadBtn.addEventListener("click", () => {
  const file = uploadFile.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      ws.send(
        JSON.stringify({
          type: "file-upload",
          filename: file.name,
          fileContent: reader.result.split(",")[1], // Base64 content
        })
      );
      alert(`File uploaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  } else {
    alert("Please select a file to upload.");
  }
});

// Send chat messages
sendBtn.addEventListener("click", () => {
  const messageContent = chatInput.value.trim();
  if (messageContent) {
    ws.send(
      JSON.stringify({
        type: "chat",
        sender: peerID,
        content: messageContent, // Send plain text (including emojis)
      })
    );
    chatInput.value = ""; // Clear input
  }
});

// Display chat messages in the UI
function displayChatMessage(username, message) {
  const messageElement = document.createElement("div");
  messageElement.textContent = `${username}: ${message}`;
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
}

// Save file locally
function saveFileLocally(filename, fileContent) {
  const link = document.createElement("a");
  link.href = `data:application/octet-stream;base64,${fileContent}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Open file preview in a new tab
function openPreviewInNewTab(filename, content, format) {
  const blobType =
    format === ".pdf"
      ? "application/pdf"
      : format === ".jpg" || format === ".jpeg" || format === ".png"
      ? `image/${format.substring(1)}`
      : null;

  if (blobType) {
    const blob = new Blob(
      [Uint8Array.from(atob(content), (c) => c.charCodeAt(0))],
      {type: blobType}
    );
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  } else {
    alert(`Preview not supported for ${filename}. Please download.`);
  }
}

// Show/hide the emoji picker
function toggleEmojiPicker() {
  emojiPicker.style.display =
    emojiPicker.style.display === "none" ? "block" : "none";
}

// Insert the selected emoji into the chat input
function insertEmoji(emoji) {
  chatInput.value += emoji;
  chatInput.focus(); // Keep focus on the input box
  toggleEmojiPicker(); // Hide the emoji picker after selection
}
