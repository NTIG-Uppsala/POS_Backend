const API_URL = "/products";

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("products-body");

  async function loadProducts() {
    try {
      const response = await fetch(API_URL);
      const products = await response.json();

      tableBody.innerHTML = "";

      products.forEach(product => {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${product.category}</td>
          <td>${product.name}</td>
          <td>
            <input
              type="number"
              id="stock-${product.id}"
              value="${product.stock}"
              min="0"
              style="width: 70px;"
            />
          </td>
          <td>
            <button onclick="updateStock(${product.id})">Spara</button>
          </td>
        `;

        tableBody.appendChild(row);
      });
    } catch (err) {
      console.error("Fel vid laddning av produkter:", err);
    }
  }

  window.updateStock = async function (id) {
    const input = document.getElementById(`stock-${id}`);
    const newStock = parseInt(input.value, 10);

    if (isNaN(newStock) || newStock < 0) {
      alert("Ogiltigt lagersaldo");
      return;
    }

    await fetch(`/products/${id}/stock`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: newStock })
    });

    loadProducts();
  };

  loadProducts();
});
