import ProductService from "./../services/products-services.js";
import { LogService } from "./../services/logs-services.js";

const ProductSer = new ProductService();
const LogSer = new LogService("http://localhost:3000");

import { username } from "./../auth/getUser.js";

//*=====> Selectors
const stockBody = document.querySelector("#stockBody");
const searchProducts = document.querySelector("#searchProducts");
const currentStockDisplay = document.querySelector("#currentStockDisplay");
const btnAdd = document.querySelector("#btnAdd");
const btnRemove = document.querySelector("#btnRemove");
const amountInput = document.querySelector("#amount");
const reasonInput = document.querySelector("#reason_msg");
const updateStockBtn = document.querySelector("#updateStockBtn");

// State
let selectedProduct = null;
let adjustmentType = "add";

// Store product by id
const productsMap = new Map();

//&=====> Get all products
async function getAllProducts() {
  try {
    const response = await ProductSer.getAll("products?_embed=category");
    productsMap.clear();
    response.forEach((p) => productsMap.set(String(p.id), p));
    displayAllProducts(response);
  } catch (error) {
    throw new Error(error);
  }
}

getAllProducts();

//^=====> Display all products
function displayAllProducts(products) {
  stockBody.innerHTML = "";

  products.forEach((product) => {
    stockBody.innerHTML += `
    <tr>
        <td>${product.name}</td>
        <td>${product.sku}</td>
        <td>${product.category.name}</td>
        <td>${product.quantity}</td>
        <td>${product.reorderLevel}</td>
        <td class='ps-4'>
          <i
            class="fa-solid fa-rotate text-secondary"
            style="cursor: pointer"
            data-bs-toggle="modal"
            data-bs-target="#inventoryInputs"
            data-product-id="${product.id}"
          ></i>
        </td>
      </tr>
    `;
  });

  attachAdjustIconListeners();
}

//~=====> Attach listeners to adjust icons
function attachAdjustIconListeners() {
  const adjustIcons = stockBody.querySelectorAll(".fa-rotate");

  adjustIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      selectedProduct = productsMap.get(String(icon.dataset.productId));

      // Reset modal state
      adjustmentType = "add";
      amountInput.value = "";
      reasonInput.value = "";
      clearInvalid(amountInput, reasonInput);
      setActiveAdjustmentType("add");
      currentStockDisplay.textContent = selectedProduct.quantity;
    });
  });
}

//?=====> Toggle Add / Remove buttons
function setActiveAdjustmentType(type) {
  adjustmentType = type;

  if (type === "add") {
    btnAdd.className = "btn btn-primary flex-fill";
    btnRemove.className = "btn btn-outline-secondary flex-fill";
  } else {
    btnAdd.className = "btn btn-outline-secondary flex-fill";
    btnRemove.className = "btn btn-danger flex-fill";
  }
}

btnAdd.addEventListener("click", () => setActiveAdjustmentType("add"));
btnRemove.addEventListener("click", () => setActiveAdjustmentType("remove"));

//~=====> Validation helpers
function setInvalid(input, message) {
  input.classList.add("is-invalid");
  let feedback = input.nextElementSibling;
  if (!feedback || !feedback.classList.contains("invalid-feedback")) {
    feedback = document.createElement("div");
    feedback.classList.add("invalid-feedback");
    input.insertAdjacentElement("afterend", feedback);
  }
  feedback.textContent = message;
}

function clearInvalid(...inputs) {
  inputs.forEach((input) => input.classList.remove("is-invalid"));
}

//*=====> Update Stock + addLog
updateStockBtn.addEventListener("click", async () => {
  const amount = parseInt(amountInput.value);
  const reason = reasonInput.value.trim();

  if (!selectedProduct) return;

  clearInvalid(amountInput, reasonInput);
  let isValid = true;

  if (!amount || amount <= 0) {
    setInvalid(amountInput, "Please enter a valid quantity.");
    isValid = false;
  }

  if (!reason) {
    setInvalid(reasonInput, "Please enter a reason for the adjustment.");
    isValid = false;
  }

  if (!isValid) return;

  const currentQty = selectedProduct.quantity;
  const newQty =
    adjustmentType === "add" ? currentQty + amount : currentQty - amount;

  if (newQty < 0) {
    setInvalid(amountInput, "Stock cannot go below zero.");
    return;
  }

  try {
    await ProductSer.update("products", selectedProduct.id, {
      ...selectedProduct,
      quantity: newQty,
    });

    await LogSer.addLog({
      action: adjustmentType === "add" ? "Stock Added" : "Stock Removed",
      productId: selectedProduct.id,
      quantity: amount,
      details: `${adjustmentType === "add" ? "Added" : "Removed"} ${amount} units ${adjustmentType === "add" ? "to" : "from"} ${selectedProduct.name}. Reason: ${reason}`,
      user: username,
    });
  } catch (error) {
    console.error("Error updating stock:", error);
  }
});

//!=====> Search Products
function searchProductsFun() {
  searchProducts.addEventListener("input", async (e) => {
    const searchValue = e.target.value.toLowerCase();

    const products = await ProductSer.getAll("products?_embed=category");

    const filteredProducts = products.filter((product) => {
      const productName = (product?.name ?? "").toString().toLowerCase();
      const categoryName = (product?.category?.name ?? "")
        .toString()
        .toLowerCase();

      return (
        productName.includes(searchValue) || categoryName.includes(searchValue)
      );
    });

    displayAllProducts(filteredProducts);
  });
}

searchProductsFun();