const express = require("express");
const cors = require("cors");

const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/authRoutes");
const musicRoutes = require("./routes/musicRoutes");
const visionRoutes = require("./routes/visionRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Base route
app.get("/", (req, res) => {
  res.send("hello world - backend is working");
});

app.get("/hi", (req, res) => {
  res.send("hello world - backend is working");
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Feature routes
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/music", musicRoutes);
app.use("/api/v1/vision", visionRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});