const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

console.log("Server.js startar...")

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files (index.html, css, js)
app.use(express.static(__dirname));

// Produktdata (lager = 0)
let products = [
  { id: 1, category: "Tobak", name: "Marlboro Red (20-pack)", stock: 100 },
  { id: 2, category: "Tobak", name: "Camel Blue (20-pack)", stock: 100 },
  { id: 3, category: "Tobak", name: "L&M Filter (20-pack)", stock: 100 },
  { id: 4, category: "Tobak", name: "Skruf Original Portion", stock: 100 },
  { id: 5, category: "Tobak", name: "Göteborgs Rapé White Portion", stock: 100 },
  { id: 6, category: "Godis", name: "Marabou Mjölkchoklad 100 g", stock: 100 },
  { id: 7, category: "Godis", name: "Daim Dubbel", stock: 100 },
  { id: 8, category: "Godis", name: "Kexchoklad", stock: 100 },
  { id: 9, category: "Godis", name: "Malaco Gott & Blandat 160 g", stock: 100 },
  { id: 10, category: "Enkel Mat", name: "Korv med bröd", stock: 100 },
  { id: 11, category: "Enkel Mat", name: "Varm toast (ost & skinka)", stock: 100 },
  { id: 12, category: "Enkel Mat", name: "Pirog (Köttfärs)", stock: 100 },
  { id: 13, category: "Enkel Mat", name: "Färdig sallad (kyckling)", stock: 100 },
  { id: 14, category: "Enkel Mat", name: "Panini (mozzarella & pesto)", stock: 100 },
  { id: 15, category: "Tidningar", name: "Aftonbladet (Dagens)", stock: 100 },
  { id: 16, category: "Tidningar", name: "Expressen (Dagens)", stock: 100 },
  { id: 17, category: "Tidningar", name: "Illustrerad Vetenskap", stock: 100 },
  { id: 18, category: "Tidningar", name: "Kalle Anka & Co", stock: 100 },
  { id: 19, category: "Tidningar", name: "Allt om Mat", stock: 100 }
];

/// Hämta alla produkter
app.get("/products", (req, res) => {
  res.json(products);
});

// Uppdatera lager (+ / -)
app.put("/products/:id/stock", (req, res) => {
  const id = parseInt(req.params.id);
  const { change } = req.body;

  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  product.stock = Math.max(0, product.stock + change);
  res.json(product);
});

// STARTA SERVERN (detta saknas i din kod just nu)
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});



