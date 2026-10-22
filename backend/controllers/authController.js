// POST /api/v1/auth/login
const login = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  res.json({
    message: "Login successful",
    token: "mock-token-12345",
    user: { id: "1", email, role: "developer" },
  });
};

// POST /api/v1/auth/register
const register = (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  res.status(201).json({
    message: "User registered successfully",
    user: { id: String(Date.now()), name, email, role: "developer" },
  });
};

module.exports = {
  login,
  register,
};
