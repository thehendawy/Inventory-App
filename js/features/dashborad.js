import ProductService from "../services/products-services.js";

// EndPoints
let productService = new ProductService();
let allProducts = await productService.getAll("products");
let allSuppliers = await productService.getAll("suppliers");

// All Products Dom and Value
const total_products = document.querySelector(".total-products");
total_products.textContent = allProducts.length;

// All Suppliers Dom and Value
const total_suppliers = document.querySelector(".total-suppliers");
total_suppliers.textContent = allSuppliers.length;

// Low Stock Dom and Value
const low_stock = document.querySelector(".low-stock");
const lowStockProds = allProducts.filter((p) => p.quantity < p.reorderLevel);
low_stock.textContent = lowStockProds.length;

// Total Price Dom and Value
const total_price = document.querySelector(".total-price");
const Total = allProducts.reduce((acc, product) => {
  return acc + product.price * product.quantity;
}, 0);
total_price.textContent = `$${Total.toLocaleString()}`;

// Low stock Table =>
const table_body = document.querySelector(".table_body");

let displayProducts = (data) => {
  table_body.innerHTML = "";
  if (data.length === 0) {
    table_body.innerHTML = `
      <tr>
        <td colspan="4" class="text-center py-4 text-muted">
          No low stock products found!
        </td>
      </tr>`;
    return;
  }

  let allRows = "";
  data.forEach((product) => {
    let tr = /* html */ `
      <tr>
          <td class="fw-500">${product.name}</td>
          <td><span class="sku-bg">${product.sku}</span></td>
          <td class="text-center">
          <span class="stock-bg">${product.quantity}</span>
          </td>
          <td class="text-end reorder-num">${product.reorderLevel}</td>
     </tr>
      `;
    allRows += tr;
  });
  table_body.insertAdjacentHTML("beforeend", allRows);
};
displayProducts(lowStockProds);
