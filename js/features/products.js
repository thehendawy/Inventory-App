import { LogService } from "../services/logs-services.js";
import ProductService from "../services/products-services.js";
import { UserService } from "../services/users-services.js";

let productService = new ProductService("http://localhost:3000");
let logService = new LogService("http://localhost:3000");
let userService = new UserService("http://localhost:3000");
let products = [];
let addProductForm = document.getElementById("addProductForm");
let editProductForm = document.getElementById("editProductForm");
let searchInput = document.querySelector('.searchInput');
let base;
let selectedProductId = null;
let idEdit = null;
let debounceTimeout;



async function getProducts() {
    try {
        products = await productService.getAll(
            "products?_embed=category&_embed=supplier"
        );
        displayProducts(products);
    } catch (error) {
        showError();
    }
}

function displayProducts(data) {
    let tableBody = document.querySelector(".table tbody");
    let totalCountElement = document.querySelector(".totalCount");

    if (!tableBody) return;
    let html = "";
    data.reverse();
    data.forEach((product) => {
        let statusBadge = getStatusBadge(product);

        html += `
            <tr>
                <td class="py-3">${product.name}</td>
                <td class="text-secondary py-3">${product.sku}</td>
                <td class="py-3 ">${product.category?.name}</td>
                <td class="py-3">${product.supplier?.name}</td>
                <td class="py-3">$${product.price}</td>
                <td class="py-3">${product.quantity}</td>
                <td class="text-secondary py-3 text-center">${product.reorderLevel}</td>
                <td class="py-3">${statusBadge}</td>
                <td class="py-3">
                    <button class="btn btn-sm editBtn" data-id="${product.id}">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-sm deleteBtn" data-id="${product.id}">
                        <i class="fas fa-trash text-danger"></i>
                    </button>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = html;

    bindEvents();

    if (totalCountElement) {
        totalCountElement.textContent =
            `A list of all products in your inventory (${data.length} total)`;
    }
}

function getStatusBadge(product) {
    if (product.quantity == 0) {
        return '<span class="badge text-white bg-secondary">Out of Stock</span>';
    } else if (product.quantity <= product.reorderLevel) {
        return '<span class="badge text-white bg-danger">Low Stock</span>';
    } else {
        return '<span class="badge text-white bg-success">In Stock</span>';
    }
}

function bindEvents() {
    document.querySelectorAll(".editBtn").forEach((btn) => {
        btn.addEventListener("click", async function () {
            idEdit = this.dataset.id;
            await openEditModal(idEdit);
        });
    });
    document.querySelectorAll(".deleteBtn").forEach((btn) => {

        btn.addEventListener("click", async function () {
            selectedProductId = this.dataset.id;
            let product = await productService.getById("products", selectedProductId);
            if (product.quantity !== 0) {
                showAlert("You can't delete this product unless quantity is 0", "danger");
                return;
            }
            let modal = new bootstrap.Modal(document.getElementById("deleteModal"));
            modal.show();
        });
    });

}


function showError() {
    const tableBody = document.querySelector(".table tbody");

    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-danger py-5">
                    Failed to load products.
                </td>
            </tr>
        `;
    }
}
getProducts();


document.addEventListener("DOMContentLoaded", () => {
    loadCategories('category');
    loadSuppliers('supplier');
});


function generateSKU(name) {
    const cleanName = name
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '-');

    const random = Math.floor(Math.random() * 10000);
    const timestamp = Date.now().toString().slice(-4);

    return `${cleanName}-${timestamp}-${random}`;
}


async function loadCategories(selectId) {
    let res = await fetch('http://localhost:3000/categories');
    let categories = await res.json();

    let select = document.getElementById(selectId);

    select.innerHTML = '<option value="">Select Category</option>';
    categories.forEach(cat => {
        let option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}

async function loadSuppliers(selectId) {
    const res = await fetch('http://localhost:3000/suppliers');
    const suppliers = await res.json();

    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select Supplier</option>';

    suppliers.forEach(s => {
        const option = document.createElement('option');
        option.value = s.id;
        option.textContent = s.name;
        select.appendChild(option);
    });
}

function showAlert(message, type = "primary") {
    let alertBox = document.getElementById("alertBox");
    alertBox.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    alertBox.style.zIndex = "9999";
    alertBox.style.maxWidth = "300px";
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");

    setTimeout(() => {
        alertBox.classList.add("d-none");
    }, 6000);
}



async function openEditModal(id) {
    let product = await productService.getById(`products/${id}?_embed=category&_embed=supplier`);
    await loadCategories('editCategory');
    await loadSuppliers('editSupplier');

    document.getElementById("editProductName").value = product.name;
    document.getElementById("editPrice").value = product.price;
    document.getElementById("editQuantity").value = product.quantity;
    document.getElementById("editRecorder").value = product.reorderLevel;
    document.getElementById("editSupplier").value = product.supplierId;
    document.getElementById("editCategory").value = product.category.id;
    document.querySelector(".editSku").value = product.sku;


    let modal = new bootstrap.Modal(
        document.getElementById("editProductModal"),
    );
    modal.show();

}

function getAddFormData() {
    let productName = document.getElementById("productName").value.trim();
    base = document.getElementById("sku").value.trim();
    let category = document.getElementById("category").value;
    let supplier = document.getElementById("supplier").value;
    let price = document.getElementById("price").value.trim();
    let quantityValue = document.getElementById("quantity").value.trim();
    let recorderValue = document.getElementById("recorder").value.trim();


    return {
        name: productName,
        sku: base,
        price,
        quantity: quantityValue === "" ? "" : Number(quantityValue),
        reorderLevel: recorderValue === "" ? "" : Number(recorderValue),
        categoryId: category,
        supplierId: supplier,
    };
}

addProductForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    let productData = getAddFormData();
    let resultValidation = productService.validateProduct(productData, "add");
    document.querySelectorAll("#addProductForm p").forEach(p => p.textContent = "");

    if (!resultValidation.isValid) {
        let errors = resultValidation.errors;

        if (errors.name) document.getElementById("productNameError").textContent = errors.name;
        if (errors.category) document.getElementById("categoryError").textContent = errors.category;
        if (errors.supplier) document.getElementById("supplierError").textContent = errors.supplier;
        if (errors.price) document.getElementById("priceError").textContent = errors.price;
        if (errors.quantity) document.getElementById("quantityError").textContent = errors.quantity;
        if (errors.recorder) document.getElementById("reorderError").textContent = errors.recorder;
        if (errors.sku) document.getElementById("skuError").textContent = errors.sku;

        return;
    }

    productData.sku = generateSKU(base);

    try {
        let result = await productService.create("products", productData);

        let userId = localStorage.getItem("userId");
        let user = await userService.getLoggedUser(userId);

        await logService.addLog({
            action: "ADD_PRODUCT",
            productId: result.id,
            quantity: productData.quantity,
            details: `Added ${productData.name}`,
            user: user.name,
            timestamp: new Date().toISOString().slice(0, 19)
        });

        showAlert("Product added successfully", "primary");
        document.getElementById("addProductModal").style.display = "none";

    } catch (error) {
        console.error(error);
        showAlert("Failed to add product", "danger");
    }
});



editProductForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    let productData = {
        id: idEdit,
        name: document.getElementById('editProductName').value.trim(),
        price: document.getElementById('editPrice').value.trim(),
        quantity: document.getElementById('editQuantity').value.trim(),
        reorderLevel: document.getElementById('editRecorder').value.trim(),
        supplierId: document.getElementById('editSupplier').value,
        categoryId: document.getElementById('editCategory').value,
    };


    let resultValidation = productService.validateProduct(productData, "edit");
    document.querySelectorAll("#editProductForm p").forEach(p => p.textContent = "");

    if (!resultValidation.isValid) {
        let errors = resultValidation.errors;
        if (errors.name) document.getElementById("editProductNameError").textContent = errors.name;
        if (errors.category) document.getElementById("editCategoryError").textContent = errors.category;
        if (errors.supplier) document.getElementById("editSupplierError").textContent = errors.supplier;
        if (errors.price) document.getElementById("editPriceError").textContent = errors.price;
        if (errors.quantity) document.getElementById("editQuantityError").textContent = errors.quantity;
        if (errors.recorder) document.getElementById("editReorderError").textContent = errors.recorder;
        return;
    }

    try {
        let id = productData.id;
        let originalProduct = await productService.getById('products', id);

        let updatedData = {
            id: originalProduct.id,
            name: productData.name || originalProduct.name,
            sku: originalProduct.sku,
            price: productData.price || originalProduct.price,
            quantity: productData.quantity === "" ? originalProduct.quantity : Number(productData.quantity),
            reorderLevel: productData.reorderLevel === "" ? originalProduct.reorderLevel : Number(productData.reorderLevel),
            supplierId: productData.supplierId || originalProduct.supplierId,
            categoryId: productData.categoryId || originalProduct.categoryId,
        };

        await productService.update('products', id, updatedData);

        let userId = localStorage.getItem("userId");
        let user = await userService.getLoggedUser(userId);

        let changes = [];

        if (originalProduct.name !== updatedData.name) {
            changes.push(`Name: "${originalProduct.name}" → "${updatedData.name}"`);
        }
        if (originalProduct.price !== updatedData.price) {
            changes.push(`Price: ${originalProduct.price} → ${updatedData.price}`);
        }
        if (originalProduct.quantity !== updatedData.quantity) {
            changes.push(`Quantity: ${originalProduct.quantity} → ${updatedData.quantity}`);
        }
        if (originalProduct.reorderLevel !== updatedData.reorderLevel) {
            changes.push(`Reorder Level: ${originalProduct.reorderLevel} → ${updatedData.reorderLevel}`);
        }
        if (originalProduct.supplierId !== updatedData.supplierId) {
            changes.push(`Supplier: ${originalProduct.supplierId} → ${updatedData.supplierId}`);
        }
        if (originalProduct.categoryId !== updatedData.categoryId) {
            changes.push(`Category: ${originalProduct.categoryId} → ${updatedData.categoryId}`);
        }

        let detailsText = changes.length > 0 ? `Updated ${updatedData.name}: ` + changes.join(", ") : `No changes for ${updatedData.name}`;


        await logService.addLog({
            action: 'UPDATE_PRODUCT',
            productId: id,
            quantity: updatedData.quantity,
            details: detailsText,
            user: user.name,
            timestamp: new Date().toISOString().slice(0, 19)
        });

        showAlert('Product updated successfully', 'primary');
        bootstrap.Modal.getInstance(document.getElementById("editProductModal")).hide();
        await getProducts();

    } catch (error) {
        console.error(error);
        showAlert('Update failed', 'danger');
    }
});


document.getElementById("confirmDeleteBtn").addEventListener("click", async function () {
    if (selectedProductId) {
        let product = await productService.getById("products", selectedProductId);


        if (product.quantity !== 0) {
            showAlert("You can't delete this product unless quantity is 0", "danger");
            return;
        }

        await productService.delete("products", selectedProductId);

        let userId = localStorage.getItem("userId");
        let user = await userService.getLoggedUser(userId);

        await logService.addLog({
            action: 'DELETE_PRODUCT',
            productId: selectedProductId,
            quantity: product.quantity,
            details: `Delete ${product.name}`,
            user: user.name,
            timestamp: new Date().toISOString().slice(0, 19)
        });

        let modal = bootstrap.Modal.getInstance(document.getElementById("deleteModal"));
        modal.hide();
        showAlert("deleted successfully", "primary")
        displayProducts();
    } else {

        showAlert("failed to delete", "danger")
    }
});


searchInput.addEventListener('input', function () {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
        let value = this.value.toLowerCase().trim();

        if (!value) {
            displayProducts(products);
            return;
        }

        let filtered = products.filter(product => {
            return (
                product.name.toLowerCase().includes(value) ||
                product.sku.toLowerCase().includes(value) ||
                product.category?.name?.toLowerCase().includes(value) ||
                product.supplier?.name?.toLowerCase().includes(value)
            );
        });

        if (filtered.length === 0) {
            showNoResults();
        } else {
            displayProducts(filtered);
        }

    }, 300);
});




function showNoResults() {
    let tableBody = document.querySelector(".table tbody");

    tableBody.innerHTML = `
        <tr>
            <td colspan="9" class="text-center text-muted py-4">
                No products found
            </td>
        </tr>
    `;
}












