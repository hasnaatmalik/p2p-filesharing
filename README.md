# P2P File Sharing & Chat

This project is a peer-to-peer (P2P) file sharing and chat application built with Node.js, Express, and WebSocket. It allows users to share files, preview them, and chat with connected peers in real-time.

## Project Structure

- **server.js**: The main server script handling HTTP and WebSocket connections.
- **peer.js**: The client-side script for peers to connect to the server and interact.
- **script.js**: The frontend script handling UI interactions and WebSocket communication.
- **index.html**: The main HTML file for the web interface.
- **styles.css**: Styling for the frontend UI.

## Features

- **File Sharing**:
  - Upload and download files.
  - File preview support for certain formats (e.g., JPG, PNG, PDF).
- **Real-time Chat**:
  - Group chat functionality with real-time updates.
- **Peer List**:
  - View connected peers.

## Requirements

- Node.js (version 14 or higher recommended)
- Web browser (e.g., Chrome, Firefox)

## Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/hasnaatmalik/p2p-filesharing
   cd p2p-file-sharing-chat
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the server:

   ```bash
   node server.js
   ```

4. Open `index.html` in your web browser to access the web interface.

## Usage

### Running the Peer Client

1. Run `peer.js` for a command-line interface (CLI) interaction:

   ```bash
   node peer.js
   ```

2. Enter the server URL (e.g., `ws://localhost:3000`) and your unique peer ID when prompted.

### Web Interface

- **Upload Files**: Select a file from your computer and click "Upload".
- **File List**: View and download available files.
- **Preview**: Request file previews where supported.
- **Chat**: Send and receive messages in real-time.

## Commands (CLI)

- **`list`**: Request the list of available files.
- **`download <filename>`**: Download a specific file.
- **`upload <filename>`**: Upload a specific file.
- **`chat <message>`**: Send a chat message to all connected peers.

## Example

**Uploading a file**:

- Run the `peer.js` client.
- Type `upload example.txt` to upload the file.

**Downloading a file**:

- Type `download example.txt` to request the file from the server.

**Sending a message**:

- Type `chat Hello everyone!` to send a chat message.

## How It Works

1. **Server**:

   - Handles WebSocket connections and maintains a list of connected peers.
   - Manages file upload, download, and preview functionality.

2. **Peer Client**:

   - Connects to the server and allows users to interact through CLI commands.
   - Handles file upload and download, and displays incoming chat messages.

3. **Web Interface**:
   - Provides a user-friendly interface for browsing peers, uploading and downloading files, and chatting in real-time.

## Technology Stack

- **Backend**: Node.js, Express, WebSocket
- **Frontend**: HTML, CSS, JavaScript
- **Database**: File system (local storage)

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`.
3. Make your changes and commit them: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature-branch`.
5. Create a pull request.

## License

This project is open source. Feel free to use and modify as needed. No license is provided, so please include your own license if required.

## Acknowledgements

- Bootstrap for the UI components.
- WebSocket for real-time communication.
- File system module for handling file operations.

## Contact

For any questions or issues, please contact hasnaatmalik2003@gmail.com or open an issue on GitHub.
