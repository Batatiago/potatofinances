import { getDb } from "../database/db.js";

export async function createTransaction(req, res) {
  const { type, description, category, amount, date } = req.body;

  if (!type || !description || !amount || !date) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  const db = await getDb();

  const result = await db.run(
    `INSERT INTO transactions (user_id, type, description, category, amount, date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [req.user.id, type, description, category || null, Number(amount), date]
  );

  return res.status(201).json({ id: result.lastID });
}

export async function listTransactions(req, res) {
  const { month, year, type } = req.query;
  const db = await getDb();

  let query = "SELECT * FROM transactions WHERE user_id = ?";
  const params = [req.user.id];

  if (year && month) {
    const monthStr = String(month).padStart(2, "0");
    query += " AND substr(date, 1, 7) = ?";
    params.push(`${year}-${monthStr}`);
  }

  if (type) {
    query += " AND type = ?";
    params.push(type);
  }

  query += " ORDER BY date DESC, id DESC";

  const rows = await db.all(query, params);
  return res.json(rows);
}

export async function updateTransaction(req, res) {
  const id = Number(req.params.id);
  const { type, description, category, amount, date } = req.body;
  const db = await getDb();

  const existing = await db.get(
    "SELECT id FROM transactions WHERE id = ? AND user_id = ?",
    [id, req.user.id]
  );

  if (!existing) {
    return res.status(404).json({ error: "Transação não encontrada." });
  }

  await db.run(
    `UPDATE transactions
     SET type = ?, description = ?, category = ?, amount = ?, date = ?
     WHERE id = ? AND user_id = ?`,
    [type, description, category || null, Number(amount), date, id, req.user.id]
  );

  return res.json({ message: "Transação atualizada com sucesso." });
}

export async function deleteTransaction(req, res) {
  const id = Number(req.params.id);
  const db = await getDb();

  const result = await db.run(
    "DELETE FROM transactions WHERE id = ? AND user_id = ?",
    [id, req.user.id]
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: "Transação não encontrada." });
  }

  return res.json({ message: "Transação removida com sucesso." });
}