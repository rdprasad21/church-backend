const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// CREATE EVENT
app.post("/events", async (req, res) => {
  const { church_name, title, date, time, venue, description } = req.body;

  const conflict = await pool.query(
    "SELECT * FROM events WHERE date=$1 AND time=$2 AND venue=$3",
    [date, time, venue]
  );

  if (conflict.rows.length > 0) {
    return res.status(400).json({ message: "Conflict detected ❌" });
  }

  const result = await pool.query(
    "INSERT INTO events (church_name, title, date, time, venue, description) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *",
    [church_name, title, date, time, venue, description]
  );

  res.json({ message: "Event created ✅", data: result.rows[0] });
});

// GET EVENTS
app.get("/events", async (req, res) => {
  const result = await pool.query("SELECT * FROM events ORDER BY date");
  res.json(result.rows);
});

app.listen(4000, () => console.log("Server running"));