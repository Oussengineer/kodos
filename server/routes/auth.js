import { Router } from "express";
import { readFile, writeFile } from "node:fs/promises";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { getTransporter, getAppUrl, isMailConfigured } from "../config/mail.js";

const router = Router();
const USERS_PATH = new URL("../data/users.json", import.meta.url);
const SALT_ROUNDS = 10;

router.post("/register", async (req, res) => {
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
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const user = {
      id: Date.now(), name, email, password: hashedPassword, phone,
      role: "user", verified: false, verificationToken,
    };
    users.push(user);
    await writeFile(USERS_PATH, JSON.stringify(users, null, 2));

    if (isMailConfigured()) {
      const transporter = getTransporter();
      const appUrl = getAppUrl();
      const link = `${appUrl}/api/auth/verify/${verificationToken}`;
      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        subject: "Verify your Kodos account",
        html: `<h2>Welcome to Kodos!</h2><p>Click the link below to verify your email:</p><a href="${link}">${link}</a><p>This link expires in 24 hours.</p>`,
      });
    }

    res.status(201).json({ message: "Account created! Please check your email to verify your account." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    const data = await readFile(USERS_PATH, "utf-8");
    const users = JSON.parse(data);
    const idx = users.findIndex(
      (u) => u.verificationToken === req.params.token && u.verified === false
    );
    if (idx === -1) {
      return res.status(400).json({ error: "Invalid or expired verification link" });
    }
    users[idx].verified = true;
    delete users[idx].verificationToken;
    await writeFile(USERS_PATH, JSON.stringify(users, null, 2));
    res.send(`<h2>Email verified successfully!</h2><p>You can now close this tab and sign in.</p>`);
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
    const user = { id: Date.now(), name, email, password: hashedPassword, phone, role: "driver", verified: true };
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
    if (user.verified === false) {
      return res.status(403).json({ error: "Please verify your email before signing in. Check your inbox." });
    }
    const { password: _, ...safe } = user;
    res.json({ user: safe, token: `token-${user.id}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
