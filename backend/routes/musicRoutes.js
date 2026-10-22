const express = require("express");
const router = express.Router();
const {
  getAllSongs,
  getSongById,
  addSong,
  deleteSong,
} = require("../controllers/musicController");

// Music Routes
router.get("/", getAllSongs);
router.get("/:id", getSongById);
router.post("/", addSong);
router.delete("/:id", deleteSong);

module.exports = router;
