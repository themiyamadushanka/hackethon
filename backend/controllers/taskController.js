// In-memory data (easy to replace with MongoDB / PostgreSQL later)
let tasks = [
  {
    id: "1",
    title: "Project themiya",
    description: "im working as backend developer",
    status: "closed",
    priority: "low",
  },
  {
    id: "2",
    title: "he he edied",
    description: "i was edited by themiya ",
    status: "in_progress",
    priority: "medium",
  },
  {
    id: "3",
    title: "hi hi isira",
    description: "i was edited by themiya",
    status: "in_progress",
    priority: "medium",
  },
];

// GET /api/v1/tasks
const getTasks = (req, res) => {
  res.json(tasks);
};

// GET /api/v1/tasks/:id
const getTaskById = (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }
  res.json(task);
};

// POST /api/v1/tasks
const createTask = (req, res) => {
  const { title, description, priority = "medium" } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  const newTask = {
    id: String(Date.now()),
    title,
    description: description || "",
    status: "todo",
    priority,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
};

// PUT /api/v1/tasks/:id
const updateTask = (req, res) => {
  const { id } = req.params;
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks[index] = { ...tasks[index], ...req.body };
  res.json(tasks[index]);
};

// DELETE /api/v1/tasks/:id
const deleteTask = (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter((t) => t.id !== id);
  res.json({ message: "Task deleted successfully" });
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
