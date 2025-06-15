const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 4000;

// Allow frontend (React) to access this backend
app.use(cors());

app.get("/api/songs", (req, res) => {
  const songsDir = path.join(__dirname, "../public/songs");

  fs.readdir(songsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: "Unable to read songs directory" });
    }

    const mp3Files = files
      .filter(file => file.endsWith(".mp3"))
      .map(file => ({
        title: path.parse(file).name,
        artist: "Unknown Artist",
        src: `/songs/${file}`
      }));

    res.json(mp3Files);
  });
});

app.listen(PORT, () => {
  console.log(`🎧 Server running at http://localhost:${PORT}`);
});
