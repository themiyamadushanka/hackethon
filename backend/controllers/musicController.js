// In-memory Music playlist data
let playlist = [
  {
    id: "1",
    title: "Starboy",
    artist: "The Weeknd",
    genre: "Pop / R&B",
    duration: "3:50",
  },
  {
    id: "2",
    title: "Blinding Lights",
    artist: "The Weeknd",
    genre: "Synthwave",
    duration: "3:20",
  },
  {
    id: "3",
    title: "Shape of You",
    artist: "Ed Sheeran",
    genre: "Pop",
    duration: "3:53",
  },
];

// GET /api/v1/music
const getAllSongs = (req, res) => {
  res.json(playlist);
};

// GET /api/v1/music/:id
const getSongById = (req, res) => {
  const song = playlist.find((s) => s.id === req.params.id);
  if (!song) {
    return res.status(404).json({ error: "Song not found" });
  }
  res.json(song);
};

// POST /api/v1/music
const addSong = (req, res) => {
  const { title, artist, genre = "General", duration = "3:00" } = req.body;
  if (!title || !artist) {
    return res.status(400).json({ error: "Title and Artist are required" });
  }

  const newSong = {
    id: String(Date.now()),
    title,
    artist,
    genre,
    duration,
  };

  playlist.push(newSong);
  res.status(201).json(newSong);
};

// DELETE /api/v1/music/:id
const deleteSong = (req, res) => {
  const { id } = req.params;
  const initialLength = playlist.length;
  playlist = playlist.filter((s) => s.id !== id);

  if (playlist.length === initialLength) {
    return res.status(404).json({ error: "Song not found" });
  }

  res.json({ message: "Song removed from playlist" });
};

module.exports = {
  getAllSongs,
  getSongById,
  addSong,
  deleteSong,
};
