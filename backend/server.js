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
      .map((file) => {
        let fileName = path.parse(file).name;
        
        // Remove SPOTDOWNLOADER.COM prefix if present
        fileName = fileName.replace('[SPOTDOWNLOADER.COM] ', '');
        
        // Try to extract artist from filename
        // Common patterns:
        // 1. "Artist - Title"
        // 2. "Title - Lofi" or "Title - Lofi Flip"
        // 3. "Title (Lofi Mix)"
        let artist = "Unknown Artist";
        let title = fileName;

        // Check for " - " pattern
        if (fileName.includes(' - ')) {
          const parts = fileName.split(' - ');
          // If the last part contains "Lofi" or "Flip", it's probably a remix
          if (parts[parts.length - 1].toLowerCase().includes('lofi') || 
              parts[parts.length - 1].toLowerCase().includes('flip')) {
            artist = "Lofi Artist";
            title = parts.slice(0, -1).join(' - ');
          } else {
            artist = parts[0];
            title = parts.slice(1).join(' - ');
          }
        }
        
        // Clean up the title
        title = title.replace(/\(Lofi Mix\)/i, '')
                    .replace(/\(Slowed & Reverb\)/i, '')
                    .replace(/\(Slowed \+ Reverb\)/i, '')
                    .trim();

        return {
          title: title,
          artist: artist,
          src: `http://localhost:${PORT}/songs/${file}`,
        };
      });

    console.log('Sending songs:', songList);
    res.json(songList);
  });
});

app.use("/songs", express.static(songsDir));

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
  console.log(`Songs directory: ${songsDir}`);
});
