const API_URL = "/products";
const tableBody = document.querySelector("#productTable tbody");

async function loadProducts() {
  const response = await fetch(API_URL);
  const products = await response.json();

  tableBody.innerHTML = "";

  products.forEach(product => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${product.category}</td>
      <td>${product.name}</td>
      <td>
        <button onclick="updateStock(${product.id}, -1)">−</button>
        <span style="margin: 0 8px;">${product.stock}</span>
        <button onclick="updateStock(${product.id}, 1)">+</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

async function updateStock(id, change) {
  await fetch(`/products/${id}/stock`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ change })
  });

  loadProducts(); // uppdatera tabellen
}

loadProducts();
