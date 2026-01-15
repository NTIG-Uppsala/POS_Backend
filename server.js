// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Skapa / anslut till SQLite
const dbPath = path.join(__dirname, "products.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Fel vid anslutning till DB:", err);
  } else {
    console.log("Ansluten till SQLite DB");
  }
});

// Skapa tabellen om den inte finns
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      category TEXT,
      name TEXT,
      stock INTEGER
    )
  `);

  // Kontrollera om tabellen är tom, lägg in produkter
  db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (err) {
      console.error("Fel vid kontroll av produkter:", err);
    } else if (row.count === 0) {
      const stmt = db.prepare("INSERT INTO products (category, name, stock) VALUES (?, ?, ?)");
      const products = [
        { category: "Tobak", name: "Marlboro Red (20-pack)", stock: 100 },
        { category: "Tobak", name: "Camel Blue (20-pack)", stock: 100 },
        { category: "Tobak", name: "L&M Filter (20-pack)", stock: 100 },
        { category: "Tobak", name: "Skruf Original Portion", stock: 100 },
        { category: "Tobak", name: "Göteborgs Rapé White Portion", stock: 100 },
        { category: "Godis", name: "Marabou Mjölkchoklad 100 g", stock: 100 },
        { category: "Godis", name: "Daim Dubbel", stock: 100 },
        { category: "Godis", name: "Kexchoklad", stock: 100 },
        { category: "Godis", name: "Malaco Gott & Blandat 160 g", stock: 100 },
        { category: "Enkel Mat", name: "Korv med bröd", stock: 100 },
        { category: "Enkel Mat", name: "Varm toast (ost & skinka)", stock: 100 },
        { category: "Enkel Mat", name: "Pirog (Köttfärs)", stock: 100 },
        { category: "Enkel Mat", name: "Färdig sallad (Kyckling)", stock: 100 },
        { category: "Enkel Mat", name: "Panini (Mozzarella & Pesto)", stock: 100 },
        { category: "Tidningar", name: "Aftonbladet (Dagens)", stock: 100 },
        { category: "Tidningar", name: "Expressen (Dagens)", stock: 100 },
        { category: "Tidningar", name: "Illustrerad Vetenskap", stock: 100 },
        { category: "Tidningar", name: "Kalle Anka & Co", stock: 100 },
        { category: "Tidningar", name: "Allt om Mat", stock: 100 }
      ];

      for (const p of products) {
        stmt.run(p.category, p.name, p.stock);
      }

      stmt.finalize(() => console.log("Produkter skapade i DB"));
    }
  });
});

// Hämta alla produkter
app.get("/products", (req, res) => {
  db.all("SELECT * FROM products ORDER BY id", (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Uppdatera lagersaldo
app.put("/products/:id/stock", (req, res) => {
  const id = parseInt(req.params.id);
  const { stock } = req.body;

  if (typeof stock !== "number" || stock < 0) {
    return res.status(400).json({ error: "Ogiltigt lagervärde" });
  }

  db.run("UPDATE products SET stock = ? WHERE id = ?", [stock, id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Produkten hittades inte" });
    res.json({ id, stock });
  });
});

// Starta servern
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

