import { PurchaseOrdersService } from "../services/purchase-orders-services.js";
const PurchaseService = new PurchaseOrdersService();

import ProductService from "../services/products-services.js";
const ProductSer = new ProductService();

import { LogService } from "../services/logs-services.js";
const LogsSer = new LogService("http://localhost:3000");

import { username } from "../auth/getUser.js";

// *====> Selectors
const purchaseBody = document.querySelector("#purchaseBody");
const productOptions = document.querySelector("#productOptions");
const quantityInput = document.querySelector("#quantityInput");
const searchOrders = document.querySelector("#searchOrders");
const createOrderBtn = document.querySelector("#createOrderBtn");
const selectProductErr = document.querySelector("#selectProductErr");
const quantityErr = document.querySelector("#quantityErr");

let allProducts = [];

//? display all purchase orders
async function getAllPurchase() {
  try {
    const response = await PurchaseService.getAllPurchaseOrders();
    displayAllPurchase(response.reverse());
  } catch (error) {
    throw new Error(error);
  }
}

getAllPurchase();

// ^========> display all purchase
function displayAllPurchase(orders) {
  purchaseBody.innerHTML = "";
  orders.forEach((order) => {
    purchaseBody.innerHTML += `
  <tr>
      <td class="fw-medium">${order.orderId}</td>
      <td>${order.supplier?.name ?? order.supplierId}</td>
      <td>${order.product?.name ?? order.productId}</td>
      <td>${order.quantity}</td>
      <td class="fw-bold">$${order.total}</td>
      <td><span class="${order.status === "Received" ? "badge-received" : order.status === "Pending" ? "badge-pending" : "badge-cancelled"}">${order.status}</span></td>
      <td class="text-muted">${order.orderTime}</td>
      <td class="text-center ${order.status === "Pending" ? "d-flex justify-content-center" : ""} ">
        <button class="action-btn check-btn ${order.status === "Pending" ? "d-block" : "d-none"}" title="Approve">
          <i class="far fa-check-circle"></i>
        </button>
        <button class="action-btn cancel-btn ${order.status === "Pending" ? "d-block" : "d-none"}" title="Cancel">
          <i class="far fa-times-circle"></i>
        </button>
      </td>
    </tr>
  `;
  });
}

// &========> get all suppliers
async function getAllProducts() {
  try {
    const data = await ProductSer.getAll("products");
    allProducts = [...data];
    displayDataForModal(data);
  } catch (error) {
    throw new Error(error);
  }
}

getAllProducts();

// *========> display data for modal
function displayDataForModal(data) {
  productOptions.innerHTML = "";
  productOptions.innerHTML = `
  <option selected disabled readonly>Select product</option>`;
  data.forEach((product) => {
    productOptions.innerHTML += `
     <option value="${product.name}">${product.name}</option>
      `;
  });
}

// ~=======> Search orders
function searchOrdersFun() {
  searchOrders.addEventListener("input", async (e) => {
    const searchValue = e.target.value.toLowerCase();

    const orders = await PurchaseService.getAllPurchaseOrders();

    const filteredOrders = orders.filter((order) => {
      return (
        order.product.name.toLowerCase().includes(searchValue) ||
        order.supplier.name.toLowerCase().includes(searchValue) ||
        order.orderId.toString().includes(searchValue)
      );
    });

    displayAllPurchase(filteredOrders);
  });
}

searchOrdersFun();

//!=======>  Validate Create new order
function validateCreateOrder() {
  let validate = true;

  if (productOptions.value === "Select product") {
    selectProductErr.classList.remove("d-none");
    selectProductErr.classList.add("d-block");
    validate = false;
    return;
  } else {
    selectProductErr.classList.add("d-none");
  }

  if (!quantityInput.value) {
    quantityErr.classList.remove("d-none");
    quantityErr.classList.add("d-block");
    validate = false;
    return;
  } else {
    quantityErr.classList.add("d-none");
  }

  if (parseInt(quantityInput.value) <= 0) {
    quantityErr.classList.remove("d-none");
    quantityErr.innerHTML = "Quantity can not be negative or zero";
    quantityErr.classList.add("d-block");
    validate = false;
    return;
  } else {
    quantityErr.classList.add("d-none");
  }

  return validate;
}

//*=======>  Create new order
async function createNewOrder() {
  const selectedProduct = allProducts.find(
    (p) => p.name === productOptions.value,
  );

  const total = selectedProduct.price * parseInt(quantityInput.value);

  const data = {
    orderId: `PO-${Date.now()}`,
    supplierId: selectedProduct.supplierId,
    productId: selectedProduct.id,
    quantity: parseInt(quantityInput.value),
    total: total,
    status: "Pending",
    orderTime: new Date().toISOString().split("T")[0],
    isProcessed: false,
  };

  const response = await PurchaseService.createNewOrder(data);
  return response;
}

createOrderBtn.addEventListener("click", async () => {
  if (validateCreateOrder()) {
    await createNewOrder();
  }
});

// !=======> Handle Cancel Order
purchaseBody.addEventListener("click", async (e) => {
  const cancelBtn = e.target.closest(".cancel-btn");
  if (!cancelBtn) return;

  const row = cancelBtn.closest("tr");
  const orderId = row.querySelector("td:first-child").textContent.trim();

  // Find the order to get its id
  const orders = await PurchaseService.getAllPurchaseOrders();
  const order = orders.find((o) => o.orderId === orderId);
  if (!order) return;

  try {
    // Update status to Cancelled
    await PurchaseService.updateOrder(order.id, {
      ...order,
      status: "Cancelled",
      isProcessed: false,
    });

    // Add log for cancelled order
    await LogsSer.addLog({
      action: "Order Cancelled",
      productId: order.productId,
      quantity: order.quantity,
      details: `Purchase order ${order.orderId} cancelled — no stock changes made`,
      user: username,
    });

    // Update UI without re-fetching
    const statusCell = row.querySelector("td:nth-child(6) span");
    statusCell.className = "badge-cancelled";
    statusCell.textContent = "Cancelled";

    // Hide both action buttons
    row.querySelector(".check-btn").className = "action-btn check-btn d-none";
    row.querySelector(".cancel-btn").className = "action-btn cancel-btn d-none";
  } catch (error) {
    console.error("Failed to cancel order:", error);
  }
});

// &=======> Handle Approve Order
purchaseBody.addEventListener("click", async (e) => {
  const approveBtn = e.target.closest(".check-btn");
  if (!approveBtn) return;

  const row = approveBtn.closest("tr");
  const orderId = row.querySelector("td:first-child").textContent.trim();

  try {
    approveBtn.disabled = true;

    // 1. Get all orders and find the clicked one
    const orders = await PurchaseService.getAllPurchaseOrders();
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) return;

    // 2. Get current product to read its existing quantity
    const products = await ProductSer.getAll("products");
    const product = products.find((p) => p.id === order.productId);
    if (!product) return;

    // 3. Update product quantity — add order quantity to existing stock
    await ProductSer.update("products", product.id, {
      ...product,
      quantity: parseInt(product.quantity) + parseInt(order.quantity),
    });

    // 4. Update order — status, isProcessed
    await PurchaseService.updateOrder(order.id, {
      ...order,
      status: "Received",
      isProcessed: true,
    });

    // 5. Add log for received order
    await LogsSer.addLog({
      action: "Order Received",
      productId: product.id,
      quantity: order.quantity,
      details: `Purchase order ${order.orderId} approved — added ${order.quantity} units to ${product.name} stock`,
      user: username,
    });

    // 6. Update UI immediately
    const statusCell = row.querySelector("td:nth-child(6) span");
    statusCell.className = "badge-received";
    statusCell.textContent = "Received";

    // Hide both action buttons
    row.querySelector(".check-btn").className = "action-btn check-btn d-none";
    row.querySelector(".cancel-btn").className = "action-btn cancel-btn d-none";
  } catch (error) {
    console.error("Failed to approve order:", error);
    approveBtn.disabled = false;
  }
});
