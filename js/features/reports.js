import ProductService from "../services/products-services.js";

let productService = new ProductService();
let totalPro = document.querySelector(".totalProduct")
let TotalSupp = document.querySelector(".totalSupplier")
let inventory = document.querySelector(".inventoryVal");
let lowStockVal = document.querySelector(".lowStock")
let products = await productService.getAll("products");
let suppliers = await productService.getAll("suppliers");
let categories = await productService.getAll("categories");
let tableBody = document.getElementById("tableBody");
let tableFooter = document.getElementById("tableFooter");



async function reports() {
    let inventoryValue = products.reduce((curr, product) => {
        return curr + (Number(product.price) * Number(product.quantity));
    }, 0)
    let lowStock = products.filter(product => {
        return Number(product.quantity) <= Number(product.reorderLevel);
    }).length;

    return {
        inventoryValue,
        lowStock
    }

}

async function showReports() {
    let obj = await reports();
    totalPro.innerHTML = products.length;
    TotalSupp.innerHTML = suppliers.length;
    inventory.innerHTML = obj.inventoryValue.toLocaleString();
    lowStockVal.innerHTML = obj.lowStock
}
showReports();

let inventoryData = categories.map(cat => {
  let catProducts = products.filter(p => p.categoryId === cat.id);
  let totalValue = catProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  return {
    name: cat.name,
    products: catProducts.length,
    value: totalValue
  };
});

let totalProducts = inventoryData.reduce((sum, item) => sum + item.products, 0);
let totalValue = inventoryData.reduce((sum, item) => sum + item.value, 0);
inventoryData.forEach(item => {
  item.percentage = totalValue ? ((item.value / totalValue) * 100).toFixed(1) : 0;
});




tableBody.innerHTML = inventoryData.map(item => `
  <tr>
    <td>${item.name}</td>
    <td>${item.products}</td>
    <td>$${item.value.toLocaleString()}</td>
    <td><span class="badge text-secondary bg-secondary-subtle">${item.percentage}%</span></td>
  </tr>
`).join("")

tableFooter.innerHTML = `
  <tr>
    <td><strong>Total</strong></td>
    <td><strong>${totalProducts}</strong></td>
    <td><strong>$${totalValue.toLocaleString()}</strong></td>
    <td><span class = "badge text-light bg-primary" >100%</span></td>
  </tr>
`;
