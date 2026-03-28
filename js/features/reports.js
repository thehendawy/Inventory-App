import ProductService from "../services/products-services.js";

let productService = new ProductService();

let totalPro = document.querySelector(".totalProduct");
let totalSupp = document.querySelector(".totalSupplier");
let inventory = document.querySelector(".inventoryVal");
let lowStockVal = document.querySelector(".lowStock");

let tableBody = document.getElementById("tableBody");
let tableBodyProduct = document.getElementById("tableBody2");
let tableFooter = document.getElementById("tableFooter");

let products = await productService.getAll("products?_embed=category&_embed=supplier");
let suppliers = await productService.getAll("suppliers");
let categories = await productService.getAll("categories");



function getReports() {
  let inventoryValue = products.reduce(
    (sum, p) => sum + Number(p.price) * Number(p.quantity),
    0
  );

  let lowStockProducts = products.filter(
    (p) => Number(p.quantity) <= Number(p.reorderLevel)
  );

  return {
    inventoryValue,
    lowStock: lowStockProducts.length,
    lowStockProducts,
  };

}

function showReports() {
  let { inventoryValue, lowStock } = getReports();

  totalPro.textContent = products.length;
  totalSupp.textContent = suppliers.length;
  inventory.textContent = inventoryValue.toLocaleString();
  lowStockVal.textContent = lowStock;
}

showReports();

function getCategoryInventory(products, categories) {
  let inventoryData = categories.map((cat) => {
    let catProducts = products.filter((p) => p.categoryId === cat.id);

    let value = catProducts.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );

    return {
      name: cat.name,
      products: catProducts.length,
      value,
    };
  });

  let totalProducts = inventoryData.reduce(
    (sum, item) => sum + item.products,
    0
  );

  let totalValue = inventoryData.reduce(
    (sum, item) => sum + item.value,
    0
  );

  inventoryData.forEach((item) => {
    item.percentage = totalValue
      ? ((item.value / totalValue) * 100).toFixed(1)
      : 0;
  });

  return { inventoryData, totalProducts, totalValue };
}


function renderCategoryTable(data, totalProducts, totalValue) {
  tableBody.innerHTML = data
    .map(
      (item) => `
      <tr>
        <td>${item.name}</td>
        <td>${item.products}</td>
        <td>$${item.value.toLocaleString()}</td>
        <td>
          <span class="badge text-secondary bg-secondary-subtle">
            ${item.percentage}%
          </span>
        </td>
      </tr>
    `
    )
    .join("");

  tableFooter.innerHTML = `
    <tr>
      <td><strong>Total</strong></td>
      <td><strong>${totalProducts}</strong></td>
      <td><strong>$${totalValue.toLocaleString()}</strong></td>
      <td><span class="badge text-light bg-primary">100%</span></td>
    </tr>
  `;
}

let {inventoryData, totalProducts, totalValue } = getCategoryInventory(products, categories);

renderCategoryTable(inventoryData, totalProducts, totalValue);




function displayLowStock() {
  let { lowStockProducts } = getReports();

  if (lowStockProducts.length === 0) {
    tableBodyProduct.innerHTML = `
      <tr>
        <td colspan="9" class="text-center text-muted py-4">
          No Low Stock !
        </td>
      </tr>
    `;
    return;
  }

  tableBodyProduct.innerHTML = lowStockProducts
    .map(
      (pro) => `
      <tr>
        <td>${pro.name}</td>
        <td class="text-secondary">${pro.sku}</td>
        <td>${pro.category.name}</td>
        <td class="text-center">
          <span class="badge bg-danger">${pro.quantity}</span>
        </td>
        <td>${pro.reorderLevel}</td>
        <td class="text-danger fw-medium">
          ${pro.quantity - pro.reorderLevel}
        </td>
      </tr>
    `
    )
    .join("");
}

displayLowStock();