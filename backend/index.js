const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      amount NUMERIC NOT NULL,
      category VARCHAR(100) NOT NULL,
      date DATE NOT NULL
    );
  `);

  console.log("Database table is ready");
}

app.get("/", (req, res) => {
  res.send("Expense Tracker API with PostgreSQL is running 🚀");
});

app.get("/expenses", async (req, res) => {
  const result = await pool.query("SELECT * FROM expenses ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/expenses", async (req, res) => {
  const { title, amount, category, date } = req.body;

  const result = await pool.query(
    "INSERT INTO expenses (title, amount, category, date) VALUES ($1, $2, $3, $4) RETURNING *",
    [title, amount, category, date]
  );

  res.status(201).json(result.rows[0]);
});

app.delete("/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  await pool.query("DELETE FROM expenses WHERE id = $1", [id]);

  res.json({ message: "Expense deleted successfully" });
});

app.get("/summary", async (req, res) => {
  const totalResult = await pool.query(
    "SELECT COALESCE(SUM(amount), 0) AS total, COUNT(*) AS count FROM expenses"
  );

  const categoryResult = await pool.query(
    "SELECT category, SUM(amount) AS total FROM expenses GROUP BY category"
  );

  res.json({
    total: Number(totalResult.rows[0].total),
    count: Number(totalResult.rows[0].count),
    byCategory: categoryResult.rows
  });
});

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
});