// server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servera frontend-filer (index.html, script.js, style.css)
app.use(express.static(__dirname));

// SQLite-databas

const db = new sqlite3.Database("./products.db", (err) => {
  if (err) {
    console.error("Kunde inte öppna databasen:", err.message);
  } else {
    console.log("SQLite-databas ansluten");
  }
});

// Skapa tabell + fyll med startdata om den är tom
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY,
      category TEXT,
      name TEXT,
      stock INTEGER
    )
  `);

  db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
    if (err) {
      console.error("Fel vid kontroll av produkter:", err);
      return;
    }

    if (row.count === 0) {
      const stmt = db.prepare(
        "INSERT INTO products (id, category, name, stock) VALUES (?, ?, ?, ?)"
      );

      const initialProducts = [
        [1, "Tobak", "Marlboro Red (20-pack)", 100],
        [2, "Tobak", "Camel Blue (20-pack)", 100],
        [3, "Tobak", "L&M Filter (20-pack)", 100],
        [4, "Tobak", "Skruf Original Portion", 100],
        [5, "Tobak", "Göteborgs Rapé White Portion", 100],
        [6, "Godis", "Marabou Mjölkchoklad 100 g", 100],
        [7, "Godis", "Daim Dubbel", 100],
        [8, "Godis", "Kexchoklad", 100],
        [9, "Godis", "Malaco Gott & Blandat 160 g", 100],
        [10, "Enkel Mat", "Korv med bröd", 100],
        [11, "Enkel Mat", "Varm toast (ost & skinka)", 100],
        [12, "Enkel Mat", "Pirog (Köttfärs)", 100],
        [13, "Enkel Mat", "Färdig sallad (kyckling)", 100],
        [14, "Enkel Mat", "Panini (mozzarella & pesto)", 100],
        [15, "Tidningar", "Aftonbladet (Dagens)", 100],
        [16, "Tidningar", "Expressen (Dagens)", 100],
        [17, "Tidningar", "Illustrerad Vetenskap", 100],
        [18, "Tidningar", "Kalle Anka & Co", 100],
        [19, "Tidningar", "Allt om Mat", 100]
      ];

      initialProducts.forEach(p => stmt.run(p));
      stmt.finalize();

      console.log("Produkter skapade med startlager 100");
    }
  });
});

// API-endpoints

// Hämta alla produkter
app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      return res.status(500).json(err);
    }
    res.json(rows);
  });
});

// Uppdatera lagersaldo (sätt nytt värde)
app.put("/products/:id/stock", (req, res) => {
  const id = req.params.id;
  const { stock } = req.body;

  if (typeof stock !== "number" || stock < 0) {
    return res.status(400).json({ error: "Ogiltigt lagersaldo" });
  }

  db.run(
    "UPDATE products SET stock = ? WHERE id = ?",
    [stock, id],
    function (err) {
      if (err) {
        return res.status(500).json(err);
      }
      res.json({ success: true });
    }
  );
});

// Startar server

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
