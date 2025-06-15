const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 4000;

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Accept']
}));

// Add error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: err.message });
});

const songsDir = path.join(__dirname, "public", "songs");

// Create songs directory if it doesn't exist
if (!fs.existsSync(songsDir)) {
  fs.mkdirSync(songsDir, { recursive: true });
  console.log('Created songs directory at:', songsDir);
}

app.get("/api/songs", (req, res) => {
  console.log('Received request for songs');
  fs.readdir(songsDir, (err, files) => {
    if (err) {
      console.error('Error reading songs directory:', err);
      return res.status(500).json({ 
        error: "Unable to list songs",
        details: err.message 
      });
    }

    const songList = files
      .filter((file) => file.endsWith(".mp3"))
      .map((file) => ({
        title: path.parse(file).name,
        artist: "Unknown Artist",
        src: `http://localhost:${PORT}/songs/${file}`,
      }));

    console.log('Sending songs:', songList);
    res.json(songList);
  });
});

app.use("/songs", express.static(songsDir));

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  console.log(`Songs directory: ${songsDir}`);
});
