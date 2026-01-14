// server.js
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

console.log("Server.js startar...");

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files (index.html, css, js)
app.use(express.static(__dirname));

// Öppna / skapa SQLite-databas
const db = new sqlite3.Database("./products.db", (err) => {
  if (err) {
    console.error("Kunde inte öppna databasen", err);
  } else {
    console.log("Ansluten till SQLite-databas");
  }
});

// Skapa tabellen om den inte finns
db.run(
  `
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT,
    name TEXT,
    stock INTEGER
  )
  `,
  (err) => {
    if (err) {
      console.error("Kunde inte skapa tabellen:", err.message);
      return;
    }

    console.log("Tabellen products skapad / finns redan");

    // Lägg in startprodukter om tabellen är tom
    db.get("SELECT COUNT(*) AS count FROM products", (err, row) => {
      if (err) {
        console.error("Fel vid kontroll av produkter:", err);
        return;
      }

      if (row.count === 0) {
        const stmt = db.prepare(
          "INSERT INTO products (category, name, stock) VALUES (?, ?, ?)"
        );

        const initialProducts = [
          ["Tobak", "Marlboro Red (20-pack)", 100],
          ["Tobak", "Camel Blue (20-pack)", 100],
          ["Tobak", "L&M Filter (20-pack)", 100],
          ["Tobak", "Skruf Original Portion", 100],
          ["Tobak", "Göteborgs Rapé White Portion", 100],
          ["Godis", "Marabou Mjölkchoklad 100 g", 100],
          ["Godis", "Daim Dubbel", 100],
          ["Godis", "Kexchoklad", 100],
          ["Godis", "Malaco Gott & Blandat 160 g", 100],
          ["Enkel Mat", "Korv med bröd", 100],
          ["Enkel Mat", "Varm toast (ost & skinka)", 100],
          ["Enkel Mat", "Pirog (Köttfärs)", 100],
          ["Enkel Mat", "Färdig sallad (kyckling)", 100],
          ["Enkel Mat", "Panini (mozzarella & pesto)", 100],
          ["Tidningar", "Aftonbladet (Dagens)", 100],
          ["Tidningar", "Expressen (Dagens)", 100],
          ["Tidningar", "Illustrerad Vetenskap", 100],
          ["Tidningar", "Kalle Anka & Co", 100],
          ["Tidningar", "Allt om Mat", 100]
        ];

        initialProducts.forEach(p => stmt.run(p));
        stmt.finalize();

        console.log("Startprodukter inlagda i databasen");
      }
    });
  }
);


// API – hämta alla produkter
app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// API – uppdatera lager (+ / -)
app.put("/products/:id/stock", (req, res) => {
  const id = req.params.id;
  const { change } = req.body;

  db.run(
    "UPDATE products SET stock = MAX(stock + ?, 0) WHERE id = ?",
    [change, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://stockapi3.ntig.dev:${PORT}`);
});
