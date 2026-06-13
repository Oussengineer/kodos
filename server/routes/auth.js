import { Router } from "express";
import { readFile, writeFile } from "node:fs/promises";
import bcrypt from "bcryptjs";

const router = Router();
const USERS_PATH = new URL("../data/users.json", import.meta.url);
const SALT_ROUNDS = 10;

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ error: "Name, email, password, and phone required" });
    }
    const data = await readFile(USERS_PATH, "utf-8");
    const users = JSON.parse(data);
    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = { id: Date.now(), name, email, password: hashedPassword, phone, role: "user" };
    users.push(user);
    await writeFile(USERS_PATH, JSON.stringify(users, null, 2));
    const { password: _, ...safe } = user;
    res.status(201).json({ user: safe, token: `token-${user.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/register/driver", async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password required" });
    }
    const data = await readFile(USERS_PATH, "utf-8");
    const users = JSON.parse(data);
    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = { id: Date.now(), name, email, password: hashedPassword, phone, role: "driver" };
    users.push(user);
    await writeFile(USERS_PATH, JSON.stringify(users, null, 2));
    const { password: _, ...safe } = user;
    res.status(201).json({ user: safe, token: `token-${user.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const data = await readFile(USERS_PATH, "utf-8");
    const users = JSON.parse(data);
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const { password: _, ...safe } = user;
    res.json({ user: safe, token: `token-${user.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
