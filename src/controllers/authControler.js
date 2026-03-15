import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getDb } from "../database/db.js";

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const db = await getDb();

  const existingUser = await db.get("SELECT id FROM users WHERE email = ?", [email]);
  if (existingUser) {
    return res.status(409).json({ error: "E-mail já cadastrado." });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const result = await db.run(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name, email, passwordHash]
  );

  return res.status(201).json({ id: result.lastID, name, email });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const db = await getDb();
  const user = await db.get("SELECT * FROM users WHERE email = ?", [email]);

  if (!user) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  const passwordOk = await bcrypt.compare(password, user.password_hash);
  if (!passwordOk) {
    return res.status(401).json({ error: "Credenciais inválidas." });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
}